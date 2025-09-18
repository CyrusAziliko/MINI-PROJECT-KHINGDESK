const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import controllers
const authController = require('./controllers/authController');
const vaultController = require('./controllers/vaultController');
const ticketController = require('./controllers/ticketController');
const chatbotController = require('./controllers/chatbotController');
const statsController = require('./controllers/statsController');
const biometricController = require('./controllers/biometricController');
const userController = require('./controllers/userController');
const mfaController = require('./controllers/mfaController');

// Import routes
const userRoutes = require('./routes/userRoutes');
const mfaRoutes = require('./routes/mfaRoutes');
const notificationsRoutes = require('./routes/notificationsRoutes');

// Import middleware
const { authenticateToken, authorizeAdmin } = require('./middleware/auth');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});
const PORT = process.env.PORT || 3000;

// Set io on app for access from other modules
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user authentication for notifications
  socket.on('authenticate', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS for all origins
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

// Serve static files from public directory
app.use(express.static('public'));

// API Routes

// User authentication
app.post('/api/auth/login', authController.login);

// Get user profile
app.get('/api/users/profile', authenticateToken, authController.getProfile);

// Vault items
app.get('/api/vault/items', authenticateToken, vaultController.getVaultItems);
app.post('/api/vault/items', authenticateToken, vaultController.addVaultItem);
app.delete('/api/vault/items/:id', authenticateToken, vaultController.deleteVaultItem);

// Tickets
app.get('/api/tickets', authenticateToken, ticketController.getUserTickets);
app.post('/api/tickets', authenticateToken, ticketController.createTicket);
app.get('/api/tickets/all', authenticateToken, authorizeAdmin, ticketController.getAllTickets);
app.put('/api/tickets/:id/status', authenticateToken, authorizeAdmin, ticketController.updateTicketStatus);

// Chatbot
app.post('/api/chatbot/query', authenticateToken, chatbotController.handleChatbotQuery);
app.get('/api/chatbot/history', authenticateToken, chatbotController.getChatHistory);

// Biometric access
app.post('/api/biometric/log', authenticateToken, biometricController.logBiometricAccess);
app.get('/api/biometric/history', authenticateToken, biometricController.getBiometricHistory);

// Statistics
app.get('/api/stats', authenticateToken, statsController.getUserStats);

// User management routes
app.use('/api/users', userRoutes);

// MFA routes
app.use('/api/mfa', mfaRoutes);

// Notifications routes
app.use('/api/notifications', notificationsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve frontend files
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
server.listen(PORT, () => {
  console.log(`VaultDesk backend server running on port ${PORT}`);
});

module.exports = app;
