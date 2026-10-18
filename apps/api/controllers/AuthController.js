const passport = require('passport');
const { User } = require('../models');
const { signToken } = require('../helpers/jsonwebtoken');

class AuthController {
  static async register(req, res, next) {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({
          statusCode: 400,
          message: 'Username, email, and password are required'
        });
      }

      const existingUser = await User.findOne({
        where: { username }
      });
      if (existingUser) {
        return res.status(400).json({
          statusCode: 400,
          message: 'Username already registered'
        });
      }

      const existingEmail = await User.findOne({
        where: { email }
      });
      if (existingEmail) {
        return res.status(400).json({
          statusCode: 400,
          message: 'Email already registered'
        });
      }

      // Explicitly lock role to 'client' for public registration
      const newUser = await User.create({
        username,
        email,
        password,
        role: 'client'
      });

      const tokenPayload = {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role
      };
      const token = signToken(tokenPayload);

      return res.status(201).json({
        statusCode: 201,
        message: 'Client registered successfully',
        access_token: token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role
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

  static login(req, res, next) {
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({
          statusCode: 401,
          message: info && info.message ? info.message : 'Invalid credentials'
        });
      }

      const tokenPayload = {
        id: user.id,
        username: user.username,
        role: user.role
      };
      const token = signToken(tokenPayload);

      return res.status(200).json({
        statusCode: 200,
        message: 'Login successful',
        access_token: token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    })(req, res, next);
  }

  static async getMe(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: ['id', 'username', 'email', 'role', 'createdAt', 'updatedAt']
      });

      if (!user) {
        return res.status(404).json({
          statusCode: 404,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        statusCode: 200,
        data: user
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
