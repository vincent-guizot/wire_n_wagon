const { User } = require('../models');

class UserController {
  static async getUsers(req, res, next) {
    try {
      const { role } = req.query;
      const whereCondition = {};
      if (role) {
        whereCondition.role = role;
      }

      const users = await User.findAll({
        where: whereCondition,
        attributes: ['id', 'username', 'email', 'role', 'createdAt', 'updatedAt'],
        order: [['id', 'ASC']]
      });

      return res.status(200).json({
        statusCode: 200,
        data: users
      });
    } catch (err) {
      next(err);
    }
  }

  static async createStaff(req, res, next) {
    try {
      const { username, email, password, role } = req.body;

      if (!username || !email || !password || !role) {
        return res.status(400).json({
          statusCode: 400,
          message: 'Username, email, password, and role are required'
        });
      }

      const allowedRoles = ['courier', 'admin', 'supervisor', 'manager'];
      if (req.user.role === 'owner') {
        allowedRoles.push('owner', 'client');
      }

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          statusCode: 400,
          message: `Invalid role for staff creation. Allowed: ${allowedRoles.join(', ')}`
        });
      }

      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({
          statusCode: 400,
          message: 'Username already in use'
        });
      }

      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({
          statusCode: 400,
          message: 'Email already in use'
        });
      }

      const newStaff = await User.create({
        username,
        email,
        password,
        role
      });

      return res.status(201).json({
        statusCode: 201,
        message: `Staff account (${role}) created successfully`,
        data: {
          id: newStaff.id,
          username: newStaff.username,
          email: newStaff.email,
          role: newStaff.role
        }
      });
    } catch (err) {
      if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          statusCode: 400,
          message: err.errors[0]?.message || 'Validation error'
        });
      }
      next(err);
    }
  }

  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      if (parseInt(id, 10) === req.user.id) {
        return res.status(400).json({
          statusCode: 400,
          message: 'Owner cannot delete their own active account'
        });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          statusCode: 404,
          message: 'User not found'
        });
      }

      await user.destroy();

      return res.status(200).json({
        statusCode: 200,
        message: `User ${user.username} (id: ${id}) deleted successfully`
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = UserController;
