const db = require('../config/database');
const { createNotification } = require('./notificationsController');

// Log biometric access attempt
const logBiometricAccess = (req, res) => {
  const { success } = req.body;
  const userId = req.user.id;

  db.run(`INSERT INTO biometric_logs (user_id, success, ip_address, user_agent) VALUES (?, ?, ?, ?)`,
    [userId, success ? 1 : 0, req.ip, req.get('User-Agent')],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      // Send notification for failed biometric access
      if (!success) {
        db.get('SELECT username FROM users WHERE id = ?', [userId], (err, user) => {
          if (!err && user) {
            createNotification(null, 'biometric_failure', 'Biometric Access Failed',
              `Failed biometric access attempt detected for user: ${user.username}`,
              { userId, username: user.username, ip: req.ip }).catch(console.error);

            // Emit real-time notification to admins
            const io = req.app.get('io');
            if (io) {
              io.to('admins').emit('notification', {
                type: 'biometric_failure',
                title: 'Biometric Access Failed',
                message: `Failed biometric access attempt detected for user: ${user.username}`,
                data: { userId, username: user.username, ip: req.ip }
              });
            }
          }
        });
      }

      res.json({ message: 'Biometric access logged successfully' });
    });
};

// Get biometric access history
const getBiometricHistory = (req, res) => {
  const userId = req.user.id;
  
  db.all(`SELECT * FROM biometric_logs WHERE user_id = ? ORDER BY access_time DESC LIMIT 10`, [userId], (err, logs) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    res.json({ logs });
  });
};

module.exports = {
  logBiometricAccess,
  getBiometricHistory
};
