const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authenticateJWT, authorizeRoles } = require('../middlewares/auth');

router.use(authenticateJWT);

// 4. View users list (Role: manager, owner, supervisor)
router.get('/', authorizeRoles('manager', 'owner', 'supervisor'), UserController.getUsers);

// 5. Create new staff account (Role: manager, owner)
router.post('/', authorizeRoles('manager', 'owner'), UserController.createStaff);

// 6. Delete user account (Role: owner)
router.delete('/:id', authorizeRoles('owner'), UserController.deleteUser);

module.exports = router;
