'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Vehicle extends Model {
    static associate(models) {
      Vehicle.hasMany(models.Order, { foreignKey: 'vehicleId', as: 'orders' });
    }
  }

  Vehicle.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Vehicle name cannot be empty' },
          notNull: { msg: 'Vehicle name is required' }
        }
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Vehicle type cannot be empty' },
          notNull: { msg: 'Vehicle type is required' }
        }
      },
      capacity_kg: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: { msg: 'Capacity must be an integer' },
          min: { args: [1], msg: 'Capacity must be at least 1 kg' },
          notNull: { msg: 'Capacity is required' }
        }
      },
      cost_per_km: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: { msg: 'Cost per km must be an integer' },
          min: { args: [1], msg: 'Cost per km must be at least 1' },
          notNull: { msg: 'Cost per km is required' }
        }
      },
      is_available: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      sequelize,
      modelName: 'Vehicle',
      tableName: 'Vehicles'
    }
  );

  return Vehicle;
};
