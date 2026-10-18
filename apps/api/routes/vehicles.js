const express = require('express');
const router = express.Router();
const VehicleController = require('../controllers/VehicleController');
const { authenticateJWT, authorizeRoles } = require('../middlewares/auth');

router.use(authenticateJWT);

// 7. Get vehicle list (All authenticated roles)
router.get('/', VehicleController.getAllVehicles);

// 8. Add new vehicle (Role: manager, owner)
router.post('/', authorizeRoles('manager', 'owner'), VehicleController.createVehicle);

// 9. Update vehicle status/capacity (Role: manager, owner)
router.put('/:id', authorizeRoles('manager', 'owner'), VehicleController.updateVehicle);

// 10. Delete vehicle (Role: owner)
router.delete('/:id', authorizeRoles('owner'), VehicleController.deleteVehicle);

module.exports = router;
