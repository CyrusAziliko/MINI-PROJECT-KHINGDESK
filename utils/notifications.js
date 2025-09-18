const nodemailer = require('nodemailer');
const { io } = require('../server'); // We'll need to export io from server.js

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send email notification
const sendEmailNotification = async (email, subject, message) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `VaultDesk: ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">VaultDesk Notification</h2>
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
                        <p>${message}</p>
                    </div>
                    <p style="color: #666; font-size: 12px; margin-top: 20px;">
                        This is an automated notification from VaultDesk.
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email notification sent to ${email}`);
    } catch (error) {
        console.error('Error sending email notification:', error);
    }
};

// Send in-app notification via WebSocket
const sendInAppNotification = (userId, notification) => {
    try {
        if (io) {
            io.to(`user_${userId}`).emit('notification', notification);
            console.log(`In-app notification sent to user ${userId}`);
        }
    } catch (error) {
        console.error('Error sending in-app notification:', error);
    }
};

// Send notification to all admins
const sendAdminNotification = async (type, title, message, data = {}) => {
    try {
        const db = require('../config/database');

        // Get all admin users
        db.all(
            `SELECT id, email, in_app_notifications, email_notifications FROM users WHERE is_admin = 1`,
            [],
            async (err, admins) => {
                if (err) {
                    console.error('Error fetching admins for notification:', err);
                    return;
                }

                for (const admin of admins) {
                    // Create notification in database
                    db.run(
                        `INSERT INTO notifications (user_id, type, title, message, data, created_at)
                         VALUES (?, ?, ?, ?, ?, datetime('now'))`,
                        [admin.id, type, title, message, JSON.stringify(data)],
                        function(err) {
                            if (err) {
                                console.error('Error creating admin notification:', err);
                                return;
                            }

                            // Send in-app notification
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
                        }
                    );
                }
            }
        );
    } catch (error) {
        console.error('Error sending admin notification:', error);
    }
};

// Notification types and templates
const NOTIFICATION_TYPES = {
    TICKET_CREATED: 'ticket_created',
    TICKET_UPDATED: 'ticket_updated',
    TICKET_ASSIGNED: 'ticket_assigned',
    BIOMETRIC_FAILURE: 'biometric_failure',
    SECURITY_ALERT: 'security_alert',
    SYSTEM_MAINTENANCE: 'system_maintenance',
    PASSWORD_RESET: 'password_reset',
    USER_CREATED: 'user_created'
};

const getNotificationTemplate = (type, data = {}) => {
    const templates = {
        [NOTIFICATION_TYPES.TICKET_CREATED]: {
            title: 'New Support Ticket',
            message: `A new support ticket has been created: "${data.title}"`
        },
        [NOTIFICATION_TYPES.TICKET_UPDATED]: {
            title: 'Ticket Updated',
            message: `Ticket "${data.title}" has been updated to status: ${data.status}`
        },
        [NOTIFICATION_TYPES.TICKET_ASSIGNED]: {
            title: 'Ticket Assigned',
            message: `You have been assigned to ticket: "${data.title}"`
        },
        [NOTIFICATION_TYPES.BIOMETRIC_FAILURE]: {
            title: 'Biometric Access Failed',
            message: `Failed biometric access attempt detected for user: ${data.username}`
        },
        [NOTIFICATION_TYPES.SECURITY_ALERT]: {
            title: 'Security Alert',
            message: `Security alert: ${data.message}`
        },
        [NOTIFICATION_TYPES.SYSTEM_MAINTENANCE]: {
            title: 'System Maintenance',
            message: `Scheduled maintenance: ${data.message}`
        },
        [NOTIFICATION_TYPES.PASSWORD_RESET]: {
            title: 'Password Reset',
            message: 'Your password has been successfully reset'
        },
        [NOTIFICATION_TYPES.USER_CREATED]: {
            title: 'New User Created',
            message: `New user account created: ${data.username}`
        }
    };

    return templates[type] || { title: 'Notification', message: 'You have a new notification' };
};

module.exports = {
    sendEmailNotification,
    sendInAppNotification,
    sendAdminNotification,
    NOTIFICATION_TYPES,
    getNotificationTemplate
};
