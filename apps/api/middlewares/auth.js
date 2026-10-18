const passport = require('passport');

const authenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        statusCode: 401,
        message: info && info.message ? info.message : 'Unauthorized: Invalid or missing token'
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        statusCode: 401,
        message: 'Unauthorized: Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        statusCode: 403,
        message: `Forbidden: Access denied for role '${req.user.role}'. Required role(s): ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

module.exports = {
  authenticateJWT,
  authorizeRoles
};
