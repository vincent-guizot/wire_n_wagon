const { Vehicle } = require('../models');

class VehicleController {
  static async getAllVehicles(req, res, next) {
    try {
      const vehicles = await Vehicle.findAll({
        order: [['id', 'ASC']]
      });

      return res.status(200).json({
        statusCode: 200,
        data: vehicles
      });
    } catch (err) {
      next(err);
    }
  }

  static async createVehicle(req, res, next) {
    try {
      const { name, type, capacity_kg, cost_per_km, is_available } = req.body;

      if (!name || !type || capacity_kg === undefined || cost_per_km === undefined) {
        return res.status(400).json({
          statusCode: 400,
          message: 'Name, type, capacity_kg, and cost_per_km are required'
        });
      }

      const vehicle = await Vehicle.create({
        name,
        type,
        capacity_kg: parseInt(capacity_kg, 10),
        cost_per_km: parseInt(cost_per_km, 10),
        is_available: is_available !== undefined ? Boolean(is_available) : true
      });

      return res.status(201).json({
        statusCode: 201,
        message: 'Vehicle added to fleet successfully',
        data: vehicle
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

  static async updateVehicle(req, res, next) {
    try {
      const { id } = req.params;
      const { name, type, capacity_kg, cost_per_km, is_available } = req.body;

      const vehicle = await Vehicle.findByPk(id);
      if (!vehicle) {
        return res.status(404).json({
          statusCode: 404,
          message: 'Vehicle not found'
        });
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (type !== undefined) updateData.type = type;
      if (capacity_kg !== undefined) updateData.capacity_kg = parseInt(capacity_kg, 10);
      if (cost_per_km !== undefined) updateData.cost_per_km = parseInt(cost_per_km, 10);
      if (is_available !== undefined) updateData.is_available = Boolean(is_available);

      await vehicle.update(updateData);

      return res.status(200).json({
        statusCode: 200,
        message: 'Vehicle fleet updated successfully',
        data: vehicle
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

  static async deleteVehicle(req, res, next) {
    try {
      const { id } = req.params;

      const vehicle = await Vehicle.findByPk(id);
      if (!vehicle) {
        return res.status(404).json({
          statusCode: 404,
          message: 'Vehicle not found'
        });
      }

      await vehicle.destroy();

      return res.status(200).json({
        statusCode: 200,
        message: `Vehicle ${vehicle.name} (id: ${id}) deleted from fleet`
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = VehicleController;
