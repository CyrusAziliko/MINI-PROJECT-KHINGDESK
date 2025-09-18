const bcrypt = require('bcryptjs');
const db = require('../config/database');

// Create new user (admin only)
const createUser = async (req, res) => {
  try {
    const { username, password, name, department, isAdmin } = req.body;

    // Validate required fields
    if (!username || !password || !name || !department) {
      return res.status(400).json({
        success: false,
        message: 'Username, password, name, and department are required'
      });
    }

    // Validate username format
    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters long'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if username already exists
    const existingUser = await db.get(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await db.run(
      'INSERT INTO users (username, password, name, department, is_admin, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))',
      [username, hashedPassword, name, department, isAdmin ? 1 : 0]
    );

    if (result.lastID) {
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        userId: result.lastID
      });
    } else {
      throw new Error('Failed to create user');
    }
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await db.get(
      'SELECT id, username, email, name, department, avatar, is_admin FROM users WHERE id = ?',
      [userId]
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        department: user.department,
        avatar: user.avatar,
        isAdmin: user.is_admin
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, name, department } = req.body;

    // Validate input
    if (!username || !email) {
      return res.status(400).json({ message: 'Username and email are required' });
    }

    // Check if username or email already exists (excluding current user)
    const existingUser = await db.get(
      'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
      [username, email, userId]
    );

    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already taken' });
    }

    // Update user
    await db.run(
      'UPDATE users SET username = ?, email = ?, name = ?, department = ? WHERE id = ?',
      [username, email, name || null, department || null, userId]
    );

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All password fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Get current user
    const user = await db.get(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.run(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await db.all(
      'SELECT id, username, name, department, avatar, is_admin, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        name: user.name,
        department: user.department,
        avatar: user.avatar,
        isAdmin: user.is_admin,
        createdAt: user.created_at
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// Update user (admin only)
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, department, isAdmin } = req.body;

    // Validate required fields
    if (!name || !department) {
      return res.status(400).json({
        success: false,
        message: 'Name and department are required'
      });
    }

    // Check if user exists
    const existingUser = await db.get(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user
    await db.run(
      'UPDATE users SET name = ?, department = ?, is_admin = ? WHERE id = ?',
      [name, department, isAdmin ? 1 : 0, userId]
    );

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const existingUser = await db.get(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting the last admin user
    const adminCount = await db.get(
      'SELECT COUNT(*) as count FROM users WHERE is_admin = 1'
    );

    if (existingUser.is_admin && adminCount.count <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the last admin user'
      });
    }

    // Delete user's related data first
    await db.run('DELETE FROM vault_items WHERE user_id = ?', [userId]);
    await db.run('DELETE FROM tickets WHERE user_id = ?', [userId]);
    await db.run('DELETE FROM chat_history WHERE user_id = ?', [userId]);
    await db.run('DELETE FROM biometric_logs WHERE user_id = ?', [userId]);

    // Delete user
    await db.run('DELETE FROM users WHERE id = ?', [userId]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

module.exports = {
  createUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  getAllUsers,
  updateUser,
  deleteUser
};
