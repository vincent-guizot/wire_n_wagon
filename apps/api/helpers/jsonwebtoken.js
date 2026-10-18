const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'wire_n_wagon_secret_1900_key';

const signToken = (payload) => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' });
};

const verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY);
};

module.exports = {
  signToken,
  verifyToken,
  SECRET_KEY
};
