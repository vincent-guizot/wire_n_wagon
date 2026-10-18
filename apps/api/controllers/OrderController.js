const { Order, User, Vehicle } = require('../models');

const orderIncludeOptions = [
  { model: User, as: 'client', attributes: ['id', 'username', 'email'] },
  { model: User, as: 'courier', attributes: ['id', 'username', 'email'] },
  { model: User, as: 'supervisor', attributes: ['id', 'username', 'email'] },
  { model: User, as: 'manager', attributes: ['id', 'username', 'email'] },
  { model: Vehicle, as: 'vehicle', attributes: ['id', 'name', 'type', 'capacity_kg', 'cost_per_km', 'is_available'] }
];

class OrderController {
  static async createOrder(req, res, next) {
    try {
      const { origin, destination, route_type, item_name, weight_kg } = req.body;

      if (!origin || !destination || !route_type || !item_name || !weight_kg) {
        return res.status(400).json({
          statusCode: 400,
          message: 'Origin, destination, route_type, item_name, and weight_kg are required'
        });
      }

      const order = await Order.create({
        clientId: req.user.id,
        origin,
        destination,
        route_type,
        item_name,
        weight_kg: parseInt(weight_kg, 10),
        status: 'Pending',
        is_paid: false,
        price: 0
      });

      const detailedOrder = await Order.findByPk(order.id, {
        include: orderIncludeOptions
      });

      return res.status(201).json({
        statusCode: 201,
        message: 'Order created successfully with status Pending',
        data: detailedOrder
      });
    } catch (err) {
      if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
          statusCode: 400,
          message: err.errors[0]?.message || 'Validation error'
        });
      }
      next(err);
    }
  }

  static async getOrders(req, res, next) {
    try {
      const { role, id: userId } = req.user;
      const whereCondition = {};

      if (role === 'client') {
        whereCondition.clientId = userId;
      } else if (role === 'courier') {
        whereCondition.courierId = userId;
      }
      // For admin, supervisor, manager, owner: return all orders

      const orders = await Order.findAll({
        where: whereCondition,
        include: orderIncludeOptions,
        order: [['id', 'DESC']]
      });

      return res.status(200).json({
        statusCode: 200,
        data: orders
      });
    } catch (err) {
      next(err);
    }
  }

  static async getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const { role, id: userId } = req.user;

      const order = await Order.findByPk(id, {
        include: orderIncludeOptions
      });

      if (!order) {
        return res.status(404).json({
          statusCode: 404,
          message: 'Order not found'
        });
      }

      // Role authorization check for single order access
      if (role === 'client' && order.clientId !== userId) {
        return res.status(403).json({
          statusCode: 403,
          message: 'Forbidden: You do not have permission to view this order'
        });
      }

      if (role === 'courier' && order.courierId !== userId) {
        return res.status(403).json({
          statusCode: 403,
          message: 'Forbidden: You are not assigned to this order'
        });
      }

      return res.status(200).json({
        statusCode: 200,
        data: order
      });
    } catch (err) {
      next(err);
    }
  }

  static async verifyPayment(req, res, next) {
    try {
      const { id } = req.params;

      const order = await Order.findByPk(id);
      if (!order) {
        return res.status(404).json({
          statusCode: 404,
          message: 'Order not found'
        });
      }

      if (order.status !== 'Pending') {
        return res.status(400).json({
          statusCode: 400,
          message: `Cannot verify payment for order with status '${order.status}'. Must be 'Pending'.`
        });
      }

      await order.update({
        is_paid: true,
        status: 'Payment_Verified'
      });

      const updated = await Order.findByPk(id, { include: orderIncludeOptions });

      return res.status(200).json({
        statusCode: 200,
        message: 'Payment verified successfully. Status changed to Payment_Verified',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  static async addIssue(req, res, next) {
    try {
      const { id } = req.params;
      const { issue_notes } = req.body;

      if (!issue_notes) {
        return res.status(400).json({
          statusCode: 400,
          message: 'issue_notes is required'
        });
      }

      const order = await Order.findByPk(id);
      if (!order) {
        return res.status(404).json({
          statusCode: 404,
          message: 'Order not found'
        });
      }

      await order.update({ issue_notes });

      const updated = await Order.findByPk(id, { include: orderIncludeOptions });

      return res.status(200).json({
        statusCode: 200,
        message: 'Issue note recorded successfully',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  static async cancelOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { role, id: userId } = req.user;

      const order = await Order.findByPk(id);
      if (!order) {
        return res.status(404).json({
          statusCode: 404,
          message: 'Order not found'
        });
      }

      if (role === 'client' && order.clientId !== userId) {
        return res.status(403).json({
          statusCode: 403,
          message: 'Forbidden: You can only cancel your own orders'
        });
      }

      if (order.status !== 'Pending') {
        return res.status(400).json({
          statusCode: 400,
          message: `Cannot cancel order with status '${order.status}'. Only 'Pending' orders can be cancelled.`
        });
      }

      await order.update({ status: 'Cancelled' });

      const updated = await Order.findByPk(id, { include: orderIncludeOptions });

      return res.status(200).json({
        statusCode: 200,
        message: 'Order cancelled successfully',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = OrderController;
