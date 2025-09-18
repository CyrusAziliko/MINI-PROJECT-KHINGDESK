const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// Database setup
const db = new sqlite3.Database('./vaultdesk.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      department TEXT NOT NULL,
      avatar TEXT,
      is_admin BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      }
    });

    // Vault items table
    db.run(`CREATE TABLE IF NOT EXISTS vault_items (
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
    )`, (err) => {
      if (err) {
        console.error('Error creating vault_items table:', err.message);
      }
    });

    // Tickets table
    db.run(`CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      priority TEXT DEFAULT 'medium',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`, (err) => {
      if (err) {
        console.error('Error creating tickets table:', err.message);
      }
    });

    // Chat history table
    db.run(`CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      sender TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`, (err) => {
      if (err) {
        console.error('Error creating chat_history table:', err.message);
      }
    });

    // Biometric access logs table
    db.run(`CREATE TABLE IF NOT EXISTS biometric_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      access_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      success BOOLEAN NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`, (err) => {
      if (err) {
        console.error('Error creating biometric_logs table:', err.message);
      }
    });

    // Notifications table
    db.run(`CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      data TEXT,
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`, (err) => {
      if (err) {
        console.error('Error creating notifications table:', err.message);
      }
    });

    // Add MFA and notification columns to users table
    db.run(`ALTER TABLE users ADD COLUMN mfa_secret TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding mfa_secret column:', err.message);
      }
    });
    db.run(`ALTER TABLE users ADD COLUMN mfa_enabled BOOLEAN DEFAULT 0`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding mfa_enabled column:', err.message);
      }
    });
    db.run(`ALTER TABLE users ADD COLUMN email_notifications BOOLEAN DEFAULT 1`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding email_notifications column:', err.message);
      }
    });
    db.run(`ALTER TABLE users ADD COLUMN in_app_notifications BOOLEAN DEFAULT 1`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding in_app_notifications column:', err.message);
      }
    });

    // Add file columns to vault_items table
    db.run(`ALTER TABLE vault_items ADD COLUMN file_size INTEGER`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding file_size column:', err.message);
      }
    });
    db.run(`ALTER TABLE vault_items ADD COLUMN file_type TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding file_type column:', err.message);
      }
    });

    // Create admin user (for demo purposes)
    const createAdminUser = () => {
      const adminPassword = bcrypt.hashSync('admin123', 10);
      db.get("SELECT * FROM users WHERE username = 'admin'", (err, row) => {
        if (err) {
          console.error('Error checking admin user:', err.message);
        } else if (!row) {
          db.run(`INSERT INTO users (username, password, name, department, is_admin) VALUES (?, ?, ?, ?, ?)`,
            ['admin', adminPassword, 'Administrator', 'IT', 1], (err) => {
              if (err) {
                console.error('Error creating admin user:', err.message);
              } else {
                console.log('Admin user created successfully');
              }
            });
        }
      });
    };

    // Call the function to create admin user
    createAdminUser();
  });
}

module.exports = db;
