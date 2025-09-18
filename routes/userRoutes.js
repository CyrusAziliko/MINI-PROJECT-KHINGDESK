const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// User profile routes
router.get('/profile', authenticateToken, userController.getUserProfile);
router.put('/profile', authenticateToken, userController.updateUserProfile);
router.put('/password', authenticateToken, userController.changePassword);

// Admin routes
router.post('/create', authenticateToken, authorizeAdmin, userController.createUser);
router.get('/all', authenticateToken, authorizeAdmin, userController.getAllUsers);
router.put('/:userId', authenticateToken, authorizeAdmin, userController.updateUser);
router.delete('/:userId', authenticateToken, authorizeAdmin, userController.deleteUser);

module.exports = router;
