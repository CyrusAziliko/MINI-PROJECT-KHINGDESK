# VaultDesk Backend

This is the backend implementation for the VaultDesk - Biometric-Secured Worker Support Portal.

## Features

1. **Processes Logic**
   - Handles user password reset
   - Checks user admin status
   - Sends alerts to IT support

2. **Stores and Retrieves Data**
   - Connects to SQLite database
   - Saves tickets
   - Fetches user info
   - Logs chat history
   - Records biometric access attempts

3. **Security & Authentication**
   - Verifies passwords, PINs, or biometric inputs
   - Ensures only authorized users see or do certain things
   - Encrypts sensitive data (e.g., AES-256)

4. **API Gateway**
   - Acts as a middleman between:
     - Frontend ↔ AI/chatbot (like OpenAI)
     - Frontend ↔ Database
     - Frontend ↔ File storage

5. **Handles Background Tasks**
   - Sending emails or SMS alerts
   - Logging analytics
   - Processing scheduled maintenance alerts

## Project Structure

```
vaultdesk-backend/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   ├── authController.js    # Authentication endpoints
│   ├── vaultController.js   # Vault item management
│   ├── ticketController.js  # Ticket management
│   ├── chatbotController.js # Chatbot functionality
│   ├── statsController.js   # User statistics
│   └── biometricController.js # Biometric access logging
├── middleware/
│   └── auth.js              # Authentication middleware
├── utils/
│   ├── helpers.js           # Helper functions
│   ├── security.js          # Security functions
│   ├── backgroundTasks.js   # Background task processing
│   └── apiGateway.js        # API gateway for external services
├── public/                  # Frontend files
├── .env                     # Environment variables
├── package.json             # Project dependencies
└── server.js                # Main server file
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/users/profile` - Get user profile

### Vault Items
- `GET /api/vault/items` - Get user's vault items
- `POST /api/vault/items` - Add a new vault item
- `DELETE /api/vault/items/:id` - Delete a vault item

### Tickets
- `GET /api/tickets` - Get user's tickets
- `POST /api/tickets` - Create a new ticket
- `GET /api/tickets/all` - Get all tickets (admin only)
- `PUT /api/tickets/:id/status` - Update ticket status (admin only)

### Chatbot
- `POST /api/chatbot/query` - Send a message to the chatbot
- `GET /api/chatbot/history` - Get chat history

### Biometric Access
- `POST /api/biometric/log` - Log biometric access attempt
- `GET /api/biometric/history` - Get biometric access history

### Statistics
- `GET /api/stats` - Get user statistics

### Health Check
- `GET /api/health` - Health check endpoint

## Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Start the production server:
   ```
   npm start
   ```

## Environment Variables

Create a `.env` file with the following variables:

```
PORT=3000
NODE_ENV=development
ACCESS_TOKEN_SECRET=your_jwt_secret_key
DB_PATH=./vaultdesk.db
EMAIL_SERVICE=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
ENCRYPTION_KEY=your_encryption_key
```

## Database Schema

The application uses SQLite with the following tables:

1. **users** - User accounts
2. **vault_items** - User's secure vault items
3. **tickets** - Help desk tickets
4. **chat_history** - Chatbot conversation history
5. **biometric_logs** - Biometric access logs

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- AES-256 encryption for sensitive data
- Rate limiting to prevent abuse
- Helmet.js for HTTP security headers
- CORS protection

## Background Tasks

- Email notifications
- Analytics logging
- Maintenance alerts
- Database cleanup
- Password reset processing

## API Gateway

- Chatbot service integration
- File storage service
- External database queries
