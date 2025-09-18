const db = require('../config/database');
const { sendEmailNotification, sendInAppNotification } = require('../utils/notifications');

const getUserNotifications = (req, res) => {
    const userId = req.user.id;

    db.all(
        `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
        [userId],
        (err, notifications) => {
            if (err) {
                console.error('Error fetching notifications:', err);
                return res.status(500).json({ error: 'Failed to fetch notifications' });
            }
            res.json(notifications);
        }
    );
};

const markNotificationAsRead = (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    db.run(
        `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
        [id, userId],
        function(err) {
            if (err) {
                console.error('Error marking notification as read:', err);
                return res.status(500).json({ error: 'Failed to mark notification as read' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Notification not found' });
            }
            res.json({ message: 'Notification marked as read' });
        }
    );
};

const markAllNotificationsAsRead = (req, res) => {
    const userId = req.user.id;

    db.run(
        `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`,
        [userId],
        function(err) {
            if (err) {
                console.error('Error marking all notifications as read:', err);
                return res.status(500).json({ error: 'Failed to mark notifications as read' });
            }
            res.json({ message: `${this.changes} notifications marked as read` });
        }
    );
};

const updateNotificationPreferences = (req, res) => {
    const { emailNotifications, inAppNotifications } = req.body;
    const userId = req.user.id;

    db.run(
        `UPDATE users SET email_notifications = ?, in_app_notifications = ? WHERE id = ?`,
        [emailNotifications ? 1 : 0, inAppNotifications ? 1 : 0, userId],
        function(err) {
            if (err) {
                console.error('Error updating notification preferences:', err);
                return res.status(500).json({ error: 'Failed to update preferences' });
            }
            res.json({ message: 'Notification preferences updated' });
        }
    );
};

const getNotificationPreferences = (req, res) => {
    const userId = req.user.id;

    db.get(
        `SELECT email_notifications, in_app_notifications FROM users WHERE id = ?`,
        [userId],
        (err, row) => {
            if (err) {
                console.error('Error fetching notification preferences:', err);
                return res.status(500).json({ error: 'Failed to fetch preferences' });
            }
            res.json({
                emailNotifications: row.email_notifications === 1,
                inAppNotifications: row.in_app_notifications === 1
            });
        }
    );
};

const createNotification = (userId, type, title, message, data = {}) => {
    return new Promise((resolve, reject) => {
        if (userId) {
            // Send to specific user
            db.run(
                `INSERT INTO notifications (user_id, type, title, message, data, created_at)
                 VALUES (?, ?, ?, ?, ?, datetime('now'))`,
                [userId, type, title, message, JSON.stringify(data)],
                function(err) {
                    if (err) {
                        console.error('Error creating notification:', err);
                        reject(err);
                        return;
                    }

                    // Get user preferences and send notifications
                    db.get(
                        `SELECT email, email_notifications, in_app_notifications FROM users WHERE id = ?`,
                        [userId],
                        (err, user) => {
                            if (err) {
                                console.error('Error fetching user for notifications:', err);
                                resolve();
                                return;
                            }

                            // Send in-app notification via WebSocket
                            if (user.in_app_notifications) {
                                sendInAppNotification(userId, {
                                    id: this.lastID,
                                    type,
                                    title,
                                    message,
                                    data,
                                    created_at: new Date().toISOString()
                                });
                            }

                            // Send email notification
                            if (user.email_notifications) {
                                sendEmailNotification(user.email, title, message);
                            }

                            resolve();
                        }
                    );
                }
            );
        } else {
            // Send to all admins
            db.all(
                `SELECT id, email, email_notifications, in_app_notifications FROM users WHERE is_admin = 1`,
                [],
                (err, admins) => {
                    if (err) {
                        console.error('Error fetching admins for notification:', err);
                        reject(err);
                        return;
                    }

                    const promises = admins.map(admin => {
                        return new Promise((resolveAdmin) => {
                            db.run(
                                `INSERT INTO notifications (user_id, type, title, message, data, created_at)
                                 VALUES (?, ?, ?, ?, ?, datetime('now'))`,
                                [admin.id, type, title, message, JSON.stringify(data)],
                                function(err) {
                                    if (err) {
                                        console.error('Error creating admin notification:', err);
                                        resolveAdmin();
                                        return;
                                    }

                                    // Send in-app notification via WebSocket
                                    if (admin.in_app_notifications) {
                                        sendInAppNotification(admin.id, {
                                            id: this.lastID,
                                            type,
                                            title,
                                            message,
                                            data,
                                            created_at: new Date().toISOString()
                                        });
                                    }

                                    // Send email notification
                                    if (admin.email_notifications) {
                                        sendEmailNotification(admin.email, title, message);
                                    }

                                    resolveAdmin();
                                }
                            );
                        });
                    });

                    Promise.all(promises).then(resolve).catch(reject);
                }
            );
        }
    });
};

module.exports = {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    updateNotificationPreferences,
    getNotificationPreferences,
    createNotification
};
