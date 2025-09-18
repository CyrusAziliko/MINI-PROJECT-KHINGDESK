# VaultDesk Project Documentation
## Biometric-Secured Worker Support Portal

## Project Overview
VaultDesk is a full-stack Node.js application that provides a secure support portal for workers with biometric security features. It combines authentication, secure data storage, help desk functionality, and AI chatbot integration in a single platform.

## Architecture & Technology Stack
- **Backend**: Node.js with Express.js framework
- **Database**: SQLite for data persistence
- **Authentication**: JWT tokens with bcrypt password hashing
- **Security**: AES-256 encryption, Helmet.js, CORS, rate limiting
- **Frontend**: HTML, CSS with Tailwind, vanilla JavaScript
- **Email**: Nodemailer for notifications
- **Dependencies**: express, bcryptjs, jsonwebtoken, sqlite3, cors, helmet, express-rate-limit, nodemailer, crypto, dotenv

## Project Structure
```
vaultdesk-backend/
├── config/
│   └── database.js          # Database configuration and initialization
├── controllers/
│   ├── authController.js    # Authentication endpoints
│   ├── vaultController.js   # Vault item management
│   ├── ticketController.js  # Ticket management
│   ├── chatbotController.js # Chatbot functionality
│   ├── statsController.js   # User statistics
│   ├── userController.js    # User management
│   └── biometricController.js # Biometric access logging
├── middleware/
│   └── auth.js              # Authentication middleware
├── utils/
│   ├── helpers.js           # Helper functions
│   ├── security.js          # Security functions
│   ├── backgroundTasks.js   # Background task processing
│   └── apiGateway.js        # API gateway for external services
├── public/                  # Frontend files
│   ├── index.html          # Landing page
│   ├── Page.html           # Main application page
│   ├── settings.html       # Settings page
│   ├── help-desk-enhanced.html # Help desk interface
│   ├── vault-enhanced-fixed.html # Vault interface
│   ├── vault-enhanced.html # Alternative vault interface
│   ├── dashboard-enhanced.html # Dashboard
│   ├── enhanced-styles.css # Enhanced CSS styles
│   ├── animations-enhanced.css # Animation styles
│   └── background mine.jpg # Background image
├── routes/
│   └── userRoutes.js       # User routes
├── .env                    # Environment variables
├── package.json            # Project dependencies
├── package-lock.json       # Dependency lock file
├── server.js               # Main server file
├── vaultdesk.db           # SQLite database
└── README.md              # Project documentation
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  avatar TEXT,
  is_admin BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Vault Items Table
```sql
CREATE TABLE vault_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  username TEXT,
  password TEXT,
  url TEXT,
  description TEXT,
  content TEXT,
  file_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
)
```

### Tickets Table
```sql
CREATE TABLE tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
)
```

### Chat History Table
```sql
CREATE TABLE chat_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  sender TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
)
```

### Biometric Logs Table
```sql
CREATE TABLE biometric_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  access_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  success BOOLEAN NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users (id)
)
```

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/login` - User login with credentials
- `GET /api/users/profile` - Get authenticated user profile

### Vault Management Endpoints
- `GET /api/vault/items` - Get user's vault items (authenticated)
- `POST /api/vault/items` - Add new vault item (authenticated)
- `DELETE /api/vault/items/:id` - Delete vault item (authenticated)

### Ticket System Endpoints
- `GET /api/tickets` - Get user's tickets (authenticated)
- `POST /api/tickets` - Create new ticket (authenticated)
- `GET /api/tickets/all` - Get all tickets (admin only)
- `PUT /api/tickets/:id/status` - Update ticket status (admin only)

### Chatbot Endpoints
- `POST /api/chatbot/query` - Send message to chatbot (authenticated)
- `GET /api/chatbot/history` - Get chat history (authenticated)

### Biometric Endpoints
- `POST /api/biometric/log` - Log biometric access attempt (authenticated)
- `GET /api/biometric/history` - Get biometric access history (authenticated)

### Statistics Endpoint
- `GET /api/stats` - Get user statistics (authenticated)

### Health Check
- `GET /api/health` - Server health check

## Security Features

### 1. Authentication Security
- Password hashing with bcryptjs (10 rounds)
- JWT tokens with 24-hour expiration
- Token-based authentication middleware
- Admin authorization middleware

### 2. Data Security
- AES-256 encryption for sensitive data
- SQLite database with foreign key constraints
- Input validation and sanitization

### 3. Application Security
- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes per IP)
- Error handling to prevent information leakage

### 4. Biometric Security
- Access attempt logging
- Success/failure tracking
- IP address and user agent recording
- Security auditing capabilities

## Installation & Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation Steps
1. Install dependencies:
   ```bash
   npm install
   ```

2. Create environment file (.env):
   ```env
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

3. Start development server:
   ```bash
   npm run dev
   ```

4. Start production server:
   ```bash
   npm start
   ```

## Default Admin Account
The system automatically creates an admin user:
- Username: `admin`
- Password: `admin123`
- Department: IT
- Admin privileges: Yes

## User Account Creation
New user accounts can be created by an administrator through the user management interface. To create a new user, an admin must provide the following details:
- **Username**: A unique identifier for the user.
- **Password**: A secure password for the user.
- **Name**: The full name of the user.
- **Department**: The department the user belongs to.
- **Admin Privileges**: A flag to determine if the new user should have administrator rights.

This functionality is restricted to users with admin privileges to ensure system security and controlled access. Once an account is created, the new user can log in with their credentials.

## Frontend Features

### Landing Page
- Professional design with gradient background
- Loading animation and redirect to main application
- Dark/light mode support
- Custom scrollbar styling

### Main Application (Page.html)
- Comprehensive user interface
- Navigation between different sections
- Responsive design
- Interactive components

### Enhanced Styling
- Tailwind CSS framework
- Custom animations and transitions
- Professional color scheme
- Mobile-responsive design

## Background Tasks
- Email notifications for important events
- Analytics logging and reporting
- Database maintenance and cleanup
- Scheduled tasks processing

## API Gateway
- Integration with external services
- Chatbot service connectivity
- File storage management
- External database queries

## Error Handling
- Comprehensive error middleware
- Database error logging
- User-friendly error messages
- Security error prevention

## Development Features
- Nodemon for development hot-reload
- Environment-based configuration
- Modular code structure
- Comprehensive documentation

## Usage Scenarios

### 1. User Authentication
- Users login with username/password
- JWT token provides access to protected routes
- Session management with token expiration

### 2. Secure Vault Management
- Store sensitive information securely
- Categorized vault items (passwords, documents, etc.)
- Encrypted storage for sensitive data

### 3. Help Desk Support
- Create and track support tickets
- Priority-based ticket management
- Admin oversight and status updates

### 4. AI Chatbot Integration
- Real-time chat support
- Conversation history
- Intelligent response handling

### 5. Security Monitoring
- Biometric access logging
- Security audit trails
- Access attempt monitoring

## Best Practices Implemented

### Code Quality
- Modular architecture
- Separation of concerns
- Consistent coding style
- Comprehensive documentation

### Security
- Defense in depth strategy
- Principle of least privilege
- Input validation
- Secure defaults

### Performance
- Efficient database queries
- Rate limiting
- Static file serving
- Error handling

## Future Enhancements
- Multi-factor authentication
- Real-time notifications
- Advanced reporting
- Mobile application
- Integration with more external services
- Enhanced biometric support
- Advanced chatbot capabilities

## Support & Maintenance
- Comprehensive logging
- Error tracking
- Database backups
- Regular security updates

This documentation provides a complete overview of the VaultDesk project structure, functionality, and implementation details.
