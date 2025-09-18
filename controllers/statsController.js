const db = require('../config/database');

// Get user statistics
const getUserStats = (req, res) => {
  const userId = req.user.id;
  
  // Get vault items count
  db.get('SELECT COUNT(*) as count FROM vault_items WHERE user_id = ?', [userId], (err, vaultResult) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    
    // Get resolved tickets count
    db.get('SELECT COUNT(*) as count FROM tickets WHERE user_id = ? AND status = "resolved"', [userId], (err, resolvedResult) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      
      // Get open tickets count
      db.get('SELECT COUNT(*) as count FROM tickets WHERE user_id = ? AND status IN ("open", "processing")', [userId], (err, openResult) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' });
        }
        
        res.json({
          vaultItems: vaultResult.count,
          resolvedTickets: resolvedResult.count,
          openTickets: openResult.count
        });
      });
    });
  });
};

module.exports = {
  getUserStats
};
