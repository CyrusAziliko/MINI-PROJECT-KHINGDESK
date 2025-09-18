const db = require('../config/database');
const { createNotification } = require('./notificationsController');

// Get user tickets
const getUserTickets = (req, res) => {
  db.all('SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, tickets) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    res.json({ tickets });
  });
};

// Create ticket
const createTicket = (req, res) => {
  const { subject, description, priority } = req.body;
  const user_id = req.user.id;

  db.run(`INSERT INTO tickets (user_id, subject, description, priority) VALUES (?, ?, ?, ?)`,
    [user_id, subject, description, priority || 'medium'],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      // Send notification to admins
      createNotification(null, 'ticket_created', 'New Support Ticket', `A new support ticket has been created: "${subject}"`, {
        ticketId: this.lastID,
        subject,
        priority: priority || 'medium'
      }).catch(console.error);

      // Emit real-time notification to admins
      const io = req.app.get('io');
      if (io) {
        io.to('admins').emit('notification', {
          type: 'ticket_created',
          title: 'New Support Ticket',
          message: `A new support ticket has been created: "${subject}"`,
          data: { ticketId: this.lastID, subject, priority: priority || 'medium' }
        });
      }

      res.status(201).json({
        message: 'Ticket created successfully',
        id: this.lastID
      });
    });
};

// Get all tickets (admin only)
const getAllTickets = (req, res) => {
  db.all(`SELECT t.*, u.name as user_name, u.department 
           FROM tickets t 
           JOIN users u ON t.user_id = u.id 
           ORDER BY t.created_at DESC`, (err, tickets) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    res.json({ tickets });
  });
};

// Update ticket status (admin only)
const updateTicketStatus = (req, res) => {
  const ticketId = req.params.id;
  const { status } = req.body;

  // First get ticket info to send notification
  db.get('SELECT user_id, subject FROM tickets WHERE id = ?', [ticketId], (err, ticket) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    db.run('UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, ticketId],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Database error' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ message: 'Ticket not found' });
        }

        // Send notification to ticket owner
        createNotification(ticket.user_id, 'ticket_updated', 'Ticket Updated',
          `Your ticket "${ticket.subject}" has been updated to status: ${status}`,
          { ticketId, subject: ticket.subject, status }).catch(console.error);

        // Emit real-time notification to ticket owner
        const io = req.app.get('io');
        if (io) {
          io.to(`user_${ticket.user_id}`).emit('notification', {
            type: 'ticket_updated',
            title: 'Ticket Updated',
            message: `Your ticket "${ticket.subject}" has been updated to status: ${status}`,
            data: { ticketId, subject: ticket.subject, status }
          });
        }

        res.json({ message: 'Ticket status updated successfully' });
      });
  });
};

module.exports = {
  getUserTickets,
  createTicket,
  getAllTickets,
  updateTicketStatus
};
