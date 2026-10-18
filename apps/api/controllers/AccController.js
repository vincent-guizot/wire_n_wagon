const { Order, User, Vehicle, sequelize } = require('../models');
const { Op } = require('sequelize');

const orderIncludeOptions = [
  { model: User, as: 'client', attributes: ['id', 'username', 'email'] },
  { model: User, as: 'courier', attributes: ['id', 'username', 'email'] },
  { model: User, as: 'supervisor', attributes: ['id', 'username', 'email'] },
  { model: User, as: 'manager', attributes: ['id', 'username', 'email'] },
  { model: Vehicle, as: 'vehicle', attributes: ['id', 'name', 'type', 'capacity_kg', 'cost_per_km', 'is_available'] }
];

class AccController {
  // 17. Manager ACC: Select vehicle & assign price -> Vehicle_Assigned
  static async managerVehicleAcc(req, res, next) {
    try {
      const { orderId } = req.params;
      const { vehicleId, price } = req.body;

      if (!vehicleId || price === undefined) {
        return res.status(400).json({
          statusCode: 400,
          message: 'vehicleId and price are required'
        });
      }

      const order = await Order.findByPk(orderId);
      if (!order) {
        return res.status(404).json({
          statusCode: 404,
          message: 'Order not found'
        });
      }

      if (order.status !== 'Payment_Verified') {
        return res.status(400).json({
          statusCode: 400,
          message: `Cannot assign vehicle. Order status must be 'Payment_Verified', currently '${order.status}'`
        });
      }

      const vehicle = await Vehicle.findByPk(vehicleId);
      if (!vehicle) {
        return res.status(404).json({
          statusCode: 404,
          message: 'Vehicle not found'
        });
      }

      await order.update({
        vehicleId: vehicle.id,
        price: parseInt(price, 10),
        managerId: req.user.id,
        status: 'Vehicle_Assigned'
      });

      const updated = await Order.findByPk(orderId, { include: orderIncludeOptions });

      return res.status(200).json({
        statusCode: 200,
        message: 'Vehicle assigned and ACC approved by Manager. Status is now Vehicle_Assigned',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  // 18. Supervisor ACC: Assign courier -> On_Delivery
  static async supervisorAssignCourier(req, res, next) {
    try {
      const { orderId } = req.params;
      const { courierId } = req.body;

      if (!courierId) {
        return res.status(400).json({
          statusCode: 400,
          message: 'courierId is required'
        });
      }

      const order = await Order.findByPk(orderId);
      if (!order) {
        return res.status(404).json({
          statusCode: 404,
          message: 'Order not found'
        });
      }

      if (order.status !== 'Vehicle_Assigned') {
        return res.status(400).json({
          statusCode: 400,
          message: `Cannot assign courier. Order status must be 'Vehicle_Assigned', currently '${order.status}'`
        });
      }

      const courier = await User.findOne({
        where: { id: courierId, role: 'courier' }
      });
      if (!courier) {
        return res.status(404).json({
          statusCode: 404,
          message: 'Courier user not found or role is not courier'
        });
      }

      await order.update({
        courierId: courier.id,
        supervisorId: req.user.id,
        status: 'On_Delivery'
      });

      const updated = await Order.findByPk(orderId, { include: orderIncludeOptions });

      return res.status(200).json({
        statusCode: 200,
        message: 'Courier assigned by Supervisor. Expedition is now On_Delivery',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  // 19. Courier ACC: Upload proof URL & approve delivery
  static async courierDeliverAcc(req, res, next) {
    try {
      const { orderId } = req.params;
      const { courier_proof_url } = req.body;

      if (!courier_proof_url || typeof courier_proof_url !== 'string' || !courier_proof_url.trim()) {
        return res.status(400).json({
          statusCode: 400,
          message: 'courier_proof_url is required and must be a valid URL string'
        });
      }

      const order = await Order.findByPk(orderId);
      if (!order) {
        return res.status(404).json({
          statusCode: 404,
          message: 'Order not found'
        });
      }

      if (order.status !== 'On_Delivery') {
        return res.status(400).json({
          statusCode: 400,
          message: `Cannot submit courier delivery ACC. Order status must be 'On_Delivery', currently '${order.status}'`
        });
      }

      if (order.courierId !== req.user.id) {
        return res.status(403).json({
          statusCode: 403,
          message: 'Forbidden: You are not the assigned courier for this order'
        });
      }

      const isDualAccComplete = order.is_client_acc === true;
      const newStatus = isDualAccComplete ? 'Waiting_Verification' : 'On_Delivery';

      await order.update({
        is_courier_acc: true,
        courier_proof_url: courier_proof_url.trim(),
        status: newStatus
      });

      const updated = await Order.findByPk(orderId, { include: orderIncludeOptions });

      return res.status(200).json({
        statusCode: 200,
        message: isDualAccComplete
          ? 'Courier ACC submitted. Both Courier & Client have ACCed! Order is now Waiting_Verification'
          : 'Courier ACC submitted. Waiting for Client ACC confirmation',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  // 20. Client ACC: Upload receive proof URL & approve receipt
  static async clientReceiveAcc(req, res, next) {
    try {
      const { orderId } = req.params;
      const { client_proof_url } = req.body;

      if (!client_proof_url || typeof client_proof_url !== 'string' || !client_proof_url.trim()) {
        return res.status(400).json({
          statusCode: 400,
          message: 'client_proof_url is required and must be a valid URL string'
        });
      }

      const order = await Order.findByPk(orderId);
      if (!order) {
        return res.status(404).json({
          statusCode: 404,
          message: 'Order not found'
        });
      }

      if (order.status !== 'On_Delivery') {
        return res.status(400).json({
          statusCode: 400,
          message: `Cannot submit client receive ACC. Order status must be 'On_Delivery', currently '${order.status}'`
        });
      }

      if (order.clientId !== req.user.id) {
        return res.status(403).json({
          statusCode: 403,
          message: 'Forbidden: You are not the client who placed this order'
        });
      }

      const isDualAccComplete = order.is_courier_acc === true;
      const newStatus = isDualAccComplete ? 'Waiting_Verification' : 'On_Delivery';

      await order.update({
        is_client_acc: true,
        client_proof_url: client_proof_url.trim(),
        status: newStatus
      });

      const updated = await Order.findByPk(orderId, { include: orderIncludeOptions });

      return res.status(200).json({
        statusCode: 200,
        message: isDualAccComplete
          ? 'Client receipt ACC submitted. Both Courier & Client have ACCed! Order is now Waiting_Verification'
          : 'Client receipt ACC submitted. Waiting for Courier ACC confirmation',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  // 21. Supervisor ACC: Field verification of dual proof -> Verified
  static async supervisorVerifyAcc(req, res, next) {
    try {
      const { orderId } = req.params;

      const order = await Order.findByPk(orderId);
      if (!order) {
        return res.status(404).json({
          statusCode: 404,
          message: 'Order not found'
        });
      }

      if (order.status !== 'Waiting_Verification') {
        return res.status(400).json({
          statusCode: 400,
          message: `Cannot verify. Order status must be 'Waiting_Verification', currently '${order.status}'`
        });
      }

      if (!order.courier_proof_url || !order.client_proof_url) {
        return res.status(400).json({
          statusCode: 400,
          message: 'Both courier_proof_url and client_proof_url must be present before field verification'
        });
      }

      await order.update({
        is_supervisor_acc: true,
        supervisorId: req.user.id,
        status: 'Verified'
      });

      const updated = await Order.findByPk(orderId, { include: orderIncludeOptions });

      return res.status(200).json({
        statusCode: 200,
        message: 'Field delivery verified by Supervisor. Status is now Verified',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  // 22. Manager ACC: Finalize expedition -> Completed
  static async managerFinalizeAcc(req, res, next) {
    try {
      const { orderId } = req.params;

      const order = await Order.findByPk(orderId);
      if (!order) {
        return res.status(404).json({
          statusCode: 404,
          message: 'Order not found'
        });
      }

      if (order.status !== 'Verified') {
        return res.status(400).json({
          statusCode: 400,
          message: `Cannot finalize expedition. Order status must be 'Verified', currently '${order.status}'`
        });
      }

      await order.update({
        is_manager_final_acc: true,
        managerId: req.user.id,
        status: 'Completed'
      });

      const updated = await Order.findByPk(orderId, { include: orderIncludeOptions });

      return res.status(200).json({
        statusCode: 200,
        message: 'Expedition finalized by Manager. Status is now Completed',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  // 23. Analytics: Owner & Manager summary
  static async getAnalytics(req, res, next) {
    try {
      // Total Revenue from 'Completed' orders
      const totalRevenueResult = await Order.sum('price', {
        where: { status: 'Completed' }
      });
      const totalRevenue = totalRevenueResult || 0;

      // Total completed expeditions
      const totalCompleted = await Order.count({
        where: { status: 'Completed' }
      });

      // Total active orders (not Completed, not Cancelled)
      const totalActiveOrders = await Order.count({
        where: {
          status: {
            [Op.notIn]: ['Completed', 'Cancelled']
          }
        }
      });

      // Total orders by status breakdown
      const ordersByStatusRaw = await Order.findAll({
        attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['status']
      });

      // Shipments per vehicle
      const shipmentsPerVehicle = await Vehicle.findAll({
        attributes: [
          'id',
          'name',
          'type',
          [sequelize.fn('COUNT', sequelize.col('orders.id')), 'orderCount']
        ],
        include: [
          {
            model: Order,
            as: 'orders',
            attributes: []
          }
        ],
        group: ['Vehicle.id', 'Vehicle.name', 'Vehicle.type']
      });

      return res.status(200).json({
        statusCode: 200,
        data: {
          totalRevenue,
          totalCompleted,
          totalActiveOrders,
          ordersByStatus: ordersByStatusRaw,
          shipmentsPerVehicle
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AccController;
