const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const db = require('../config/database');

// User login
const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    bcrypt.compare(password, user.password, (err, result) => {
      if (err || !result) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Create JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, is_admin: user.is_admin },
        process.env.ACCESS_TOKEN_SECRET || 'vaultdesk_secret_key',
        { expiresIn: '24h' }
      );

      // Log successful login
      db.run(`INSERT INTO biometric_logs (user_id, success, ip_address, user_agent) VALUES (?, ?, ?, ?)`, 
        [user.id, 1, req.ip, req.get('User-Agent')], (err) => {
          if (err) console.error('Error logging biometric access:', err.message);
        });

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          department: user.department,
          avatar: user.avatar,
          is_admin: user.is_admin
        }
      });
    });
  });
};

// Get user profile
const getProfile = (req, res) => {
  db.get('SELECT id, username, name, department, avatar, is_admin FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  });
};

module.exports = {
  login,
  getProfile
};
