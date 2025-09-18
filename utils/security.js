// Security utilities for VaultDesk

const crypto = require('crypto');

// Encrypt data using AES-256
const encryptData = (data, key = process.env.ENCRYPTION_KEY || 'vaultdesk_default_key') => {
  try {
    const algorithm = 'aes-256-cbc';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
};

// Decrypt data using AES-256
const decryptData = (encryptedObj, key = process.env.ENCRYPTION_KEY || 'vaultdesk_default_key') => {
  try {
    const algorithm = 'aes-256-cbc';
    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encryptedObj.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
};

// Hash password using bcrypt
const hashPassword = (password, saltRounds = 10) => {
  const bcrypt = require('bcryptjs');
  return bcrypt.hashSync(password, saltRounds);
};

// Verify password
const verifyPassword = (password, hash) => {
  const bcrypt = require('bcryptjs');
  return bcrypt.compareSync(password, hash);
};

// Generate JWT token
const generateToken = (payload, secret = process.env.ACCESS_TOKEN_SECRET || 'vaultdesk_secret_key') => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(payload, secret, { expiresIn: '24h' });
};

// Verify JWT token
const verifyToken = (token, secret = process.env.ACCESS_TOKEN_SECRET || 'vaultdesk_secret_key') => {
  const jwt = require('jsonwebtoken');
  return jwt.verify(token, secret);
};

// Generate random password
const generateRandomPassword = (length = 12) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

module.exports = {
  encryptData,
  decryptData,
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  generateRandomPassword
};
