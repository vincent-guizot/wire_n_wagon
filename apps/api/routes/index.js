const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./users');
const vehicleRoutes = require('./vehicles');
const orderRoutes = require('./orders');
const accRoutes = require('./acc');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/orders', orderRoutes);
router.use('/acc', accRoutes);

module.exports = router;
