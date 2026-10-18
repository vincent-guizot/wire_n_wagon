const express = require('express');
const router = express.Router();
const AccController = require('../controllers/AccController');
const { authenticateJWT, authorizeRoles } = require('../middlewares/auth');

router.use(authenticateJWT);

// 23. Analytics summary (Role: owner, manager)
router.get('/analytics', authorizeRoles('owner', 'manager'), AccController.getAnalytics);

// 17. Manager ACC: Select vehicle & set price (Role: manager)
router.put('/:orderId/manager-vehicle', authorizeRoles('manager'), AccController.managerVehicleAcc);

// 18. Supervisor ACC: Assign courier (Role: supervisor)
router.put('/:orderId/supervisor-assign', authorizeRoles('supervisor'), AccController.supervisorAssignCourier);

// 19. Courier ACC: Upload proof & approve delivery (Role: courier)
router.put('/:orderId/courier-deliver', authorizeRoles('courier'), AccController.courierDeliverAcc);

// 20. Client ACC: Upload proof & approve receipt (Role: client)
router.put('/:orderId/client-receive', authorizeRoles('client'), AccController.clientReceiveAcc);

// 21. Supervisor ACC: Field verification of dual proof (Role: supervisor)
router.put('/:orderId/supervisor-verify', authorizeRoles('supervisor'), AccController.supervisorVerifyAcc);

// 22. Manager ACC: Finalize expedition (Role: manager)
router.put('/:orderId/manager-finalize', authorizeRoles('manager'), AccController.managerFinalizeAcc);

module.exports = router;
