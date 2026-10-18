const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authenticateJWT } = require('../middlewares/auth');

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', authenticateJWT, AuthController.getMe);

module.exports = router;
