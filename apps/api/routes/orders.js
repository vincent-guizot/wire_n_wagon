const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const { authenticateJWT, authorizeRoles } = require('../middlewares/auth');

router.use(authenticateJWT);

// 11. Create order (Role: client)
router.post('/', authorizeRoles('client'), OrderController.createOrder);

// 12. List orders (Filtered by role: client, courier, or all for staff)
router.get('/', OrderController.getOrders);

// 13. Detail single order
router.get('/:id', OrderController.getOrderById);

// 14. Verify payment (Role: admin)
router.put('/:id/verify-payment', authorizeRoles('admin'), OrderController.verifyPayment);

// 15. Record issue/complaint note (Role: admin)
router.put('/:id/issue', authorizeRoles('admin'), OrderController.addIssue);

// 16. Cancel pending order (Role: client, admin)
router.put('/:id/cancel', authorizeRoles('client', 'admin'), OrderController.cancelOrder);

module.exports = router;
