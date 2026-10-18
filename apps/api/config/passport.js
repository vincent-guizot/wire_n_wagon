const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { Op } = require('sequelize');
const { User } = require('../models');
const { comparePassword } = require('../helpers/bcrypt');
const { SECRET_KEY } = require('../helpers/jsonwebtoken');

// 1. Local Strategy for Login
passport.use(
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
      session: false
    },
    async (username, password, done) => {
      try {
        if (!username || !password) {
          return done(null, false, { message: 'Username and password are required' });
        }

        const user = await User.findOne({
          where: {
            [Op.or]: [
              { username: username },
              { email: username }
            ]
          }
        });

        if (!user) {
          return done(null, false, { message: 'Invalid username/email or password' });
        }

        const isMatch = comparePassword(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid username/email or password' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// 2. JWT Strategy for Protected API Routes
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET_KEY
};

passport.use(
  new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
      const user = await User.findByPk(jwtPayload.id, {
        attributes: { exclude: ['password'] }
      });

      if (user) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'User not found or token expired' });
      }
    } catch (err) {
      return done(err, false);
    }
  })
);

module.exports = passport;
