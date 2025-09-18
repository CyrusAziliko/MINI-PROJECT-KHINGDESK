const express = require('express');
const router = express.Router();
const mfaController = require('../controllers/mfaController');
const { authenticateToken } = require('../middleware/auth');

// All MFA routes require authentication
router.use(authenticateToken);

// Setup MFA - generate secret and QR code
router.post('/setup', mfaController.setupMFA);

// Verify MFA token and enable
router.post('/verify', mfaController.verifyMFA);

// Disable MFA
router.post('/disable', mfaController.disableMFA);

// Get MFA status
router.get('/status', mfaController.getMFAStatus);

module.exports = router;
