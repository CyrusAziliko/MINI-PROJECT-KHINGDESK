const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    updateNotificationPreferences,
    getNotificationPreferences
} = require('../controllers/notificationsController');

// All notification routes require authentication
router.use(auth.authenticateToken);

// Get user's notifications
router.get('/', getUserNotifications);

// Mark specific notification as read
router.put('/:id/read', markNotificationAsRead);

// Mark all notifications as read
router.put('/read-all', markAllNotificationsAsRead);

// Update notification preferences
router.put('/preferences', updateNotificationPreferences);

// Get notification preferences
router.get('/preferences', getNotificationPreferences);

module.exports = router;
