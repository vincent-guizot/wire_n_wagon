'use strict';
const { Model } = require('sequelize');
const { hashPassword } = require('../helpers/bcrypt');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Order, { foreignKey: 'clientId', as: 'clientOrders' });
      User.hasMany(models.Order, { foreignKey: 'courierId', as: 'courierOrders' });
      User.hasMany(models.Order, { foreignKey: 'supervisorId', as: 'supervisorOrders' });
      User.hasMany(models.Order, { foreignKey: 'managerId', as: 'managerOrders' });
    }
  }

  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: 'Username already in use'
        },
        validate: {
          notEmpty: { msg: 'Username cannot be empty' },
          notNull: { msg: 'Username is required' }
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: 'Email already in use'
        },
        validate: {
          isEmail: { msg: 'Invalid email format' },
          notEmpty: { msg: 'Email cannot be empty' },
          notNull: { msg: 'Email is required' }
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Password cannot be empty' },
          notNull: { msg: 'Password is required' },
          len: {
            args: [6, 100],
            msg: 'Password must be between 6 and 100 characters'
          }
        }
      },
      role: {
        type: DataTypes.ENUM('client', 'courier', 'admin', 'supervisor', 'manager', 'owner'),
        allowNull: false,
        defaultValue: 'client',
        validate: {
          isIn: {
            args: [['client', 'courier', 'admin', 'supervisor', 'manager', 'owner']],
            msg: 'Role must be one of: client, courier, admin, supervisor, manager, owner'
          }
        }
      }
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'Users',
      hooks: {
        beforeCreate: (user) => {
          if (user.password) {
            user.password = hashPassword(user.password);
          }
        },
        beforeUpdate: (user) => {
          if (user.changed('password')) {
            user.password = hashPassword(user.password);
          }
        }
      }
    }
  );

  return User;
};
