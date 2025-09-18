const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const db = require('../config/database');

// Generate MFA secret and QR code for user
const setupMFA = (req, res) => {
  const userId = req.user.id;

  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `VaultDesk (${req.user.username})`,
    issuer: 'VaultDesk'
  });

  // Store secret in database
  db.run(`UPDATE users SET mfa_secret = ?, mfa_enabled = 0 WHERE id = ?`,
    [secret.base32, userId], (err) => {
      if (err) {
        console.error('Error updating MFA secret:', err.message);
        return res.status(500).json({ error: 'Failed to setup MFA' });
      }

      // Generate QR code
      qrcode.toDataURL(secret.otpauth_url, (err, qrCodeUrl) => {
        if (err) {
          console.error('Error generating QR code:', err);
          return res.status(500).json({ error: 'Failed to generate QR code' });
        }

        res.json({
          secret: secret.base32,
          qrCodeUrl,
          message: 'Scan the QR code with your authenticator app'
        });
      });
    });
};

// Verify MFA token and enable MFA
const verifyMFA = (req, res) => {
  const userId = req.user.id;
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'MFA token is required' });
  }

  // Get user's MFA secret
  db.get(`SELECT mfa_secret FROM users WHERE id = ?`, [userId], (err, row) => {
    if (err) {
      console.error('Error fetching MFA secret:', err.message);
      return res.status(500).json({ error: 'Failed to verify MFA' });
    }

    if (!row || !row.mfa_secret) {
      return res.status(400).json({ error: 'MFA not set up' });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: row.mfa_secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time windows (30 seconds each)
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid MFA token' });
    }

    // Enable MFA
    db.run(`UPDATE users SET mfa_enabled = 1 WHERE id = ?`, [userId], (err) => {
      if (err) {
        console.error('Error enabling MFA:', err.message);
        return res.status(500).json({ error: 'Failed to enable MFA' });
      }

      res.json({ message: 'MFA enabled successfully' });
    });
  });
};

// Disable MFA for user
const disableMFA = (req, res) => {
  const userId = req.user.id;
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'MFA token is required to disable' });
  }

  // Get user's MFA secret
  db.get(`SELECT mfa_secret FROM users WHERE id = ?`, [userId], (err, row) => {
    if (err) {
      console.error('Error fetching MFA secret:', err.message);
      return res.status(500).json({ error: 'Failed to disable MFA' });
    }

    if (!row || !row.mfa_secret) {
      return res.status(400).json({ error: 'MFA not set up' });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: row.mfa_secret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid MFA token' });
    }

    // Disable MFA
    db.run(`UPDATE users SET mfa_secret = NULL, mfa_enabled = 0 WHERE id = ?`, [userId], (err) => {
      if (err) {
        console.error('Error disabling MFA:', err.message);
        return res.status(500).json({ error: 'Failed to disable MFA' });
      }

      res.json({ message: 'MFA disabled successfully' });
    });
  });
};

// Get MFA status for user
const getMFAStatus = (req, res) => {
  const userId = req.user.id;

  db.get(`SELECT mfa_enabled FROM users WHERE id = ?`, [userId], (err, row) => {
    if (err) {
      console.error('Error fetching MFA status:', err.message);
      return res.status(500).json({ error: 'Failed to get MFA status' });
    }

    res.json({
      enabled: row ? row.mfa_enabled === 1 : false
    });
  });
};

module.exports = {
  setupMFA,
  verifyMFA,
  disableMFA,
  getMFAStatus
};
