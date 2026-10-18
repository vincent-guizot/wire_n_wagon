'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: 'clientId', as: 'client' });
      Order.belongsTo(models.User, { foreignKey: 'courierId', as: 'courier' });
      Order.belongsTo(models.User, { foreignKey: 'supervisorId', as: 'supervisor' });
      Order.belongsTo(models.User, { foreignKey: 'managerId', as: 'manager' });
      Order.belongsTo(models.Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });
    }
  }

  Order.init(
    {
      receipt_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: 'Receipt number must be unique'
        }
      },
      clientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      courierId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      supervisorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      managerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      vehicleId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Vehicles',
          key: 'id'
        }
      },
      origin: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Origin cannot be empty' },
          notNull: { msg: 'Origin is required' }
        }
      },
      destination: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Destination cannot be empty' },
          notNull: { msg: 'Destination is required' }
        }
      },
      route_type: {
        type: DataTypes.ENUM('in_city', 'inter_city'),
        allowNull: false,
        validate: {
          isIn: {
            args: [['in_city', 'inter_city']],
            msg: "Route type must be 'in_city' or 'inter_city'"
          }
        }
      },
      item_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Item name cannot be empty' },
          notNull: { msg: 'Item name is required' }
        }
      },
      weight_kg: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: { msg: 'Weight must be an integer' },
          min: { args: [1], msg: 'Weight must be at least 1 kg' },
          notNull: { msg: 'Weight is required' }
        }
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      is_paid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_courier_acc: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      courier_proof_url: {
        type: DataTypes.STRING,
        allowNull: true
      },
      is_client_acc: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      client_proof_url: {
        type: DataTypes.STRING,
        allowNull: true
      },
      is_supervisor_acc: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_manager_final_acc: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      status: {
        type: DataTypes.ENUM(
          'Pending',
          'Payment_Verified',
          'Vehicle_Assigned',
          'On_Delivery',
          'Waiting_Verification',
          'Verified',
          'Completed',
          'Cancelled'
        ),
        allowNull: false,
        defaultValue: 'Pending'
      },
      issue_notes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Order',
      tableName: 'Orders',
      hooks: {
        beforeValidate: (order) => {
          if (!order.receipt_number) {
            const randomCode = Math.floor(1000 + Math.random() * 9000);
            order.receipt_number = `WW-1900-${randomCode}`;
          }
        }
      }
    }
  );

  return Order;
};
