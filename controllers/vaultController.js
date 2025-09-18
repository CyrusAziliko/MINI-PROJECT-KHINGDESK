const db = require('../config/database');

// Get user vault items
const getVaultItems = (req, res) => {
  db.all('SELECT * FROM vault_items WHERE user_id = ?', [req.user.id], (err, items) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    res.json({ items });
  });
};

// Add vault item
const addVaultItem = (req, res) => {
  const { name, type, username, password, url, description, content, file_path } = req.body;
  const user_id = req.user.id;

  db.run(`INSERT INTO vault_items 
    (user_id, name, type, username, password, url, description, content, file_path) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
    [user_id, name, type, username, password, url, description, content, file_path], 
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      res.status(201).json({ 
        message: 'Vault item created successfully', 
        id: this.lastID 
      });
    });
};

// Delete vault item
const deleteVaultItem = (req, res) => {
  const itemId = req.params.id;

  db.run('DELETE FROM vault_items WHERE id = ? AND user_id = ?', [itemId, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
      }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Vault item not found or access denied' });
    }

    res.json({ message: 'Vault item deleted successfully' });
  });
};

module.exports = {
  getVaultItems,
  addVaultItem,
  deleteVaultItem
};
