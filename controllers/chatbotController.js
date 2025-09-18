const db = require('../config/database');

// Handle chatbot queries
const handleChatbotQuery = (req, res) => {
  const { message } = req.body;
  const userId = req.user.id;
  
  // Log the chat message
  db.run(`INSERT INTO chat_history (user_id, message, sender) VALUES (?, ?, ?)`, 
    [userId, message, 'user'], (err) => {
      if (err) {
        console.error('Error logging chat message:', err.message);
      }
    });

  // Simple chatbot responses (in a real app, this would connect to an AI service)
  const responses = {
    'hello': 'Hello! How can I assist you today?',
    'help': 'I can help you with IT issues, safety protocols, equipment, HR questions, and general inquiries.',
    'password': 'To reset your password, please contact IT support through the help desk.',
    'default': 'I\'m sorry, I don\'t have information on that specific topic. Please submit a ticket for further assistance.'
  };

  // Simple response logic (in a real app, this would be more sophisticated)
  const lowerMessage = message.toLowerCase();
  let response = responses.default;

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    response = responses.hello;
  } else if (lowerMessage.includes('help')) {
    response = responses.help;
  } else if (lowerMessage.includes('password')) {
    response = responses.password;
  }

  // Log bot response
  db.run(`INSERT INTO chat_history (user_id, message, sender) VALUES (?, ?, ?)`, 
    [userId, response, 'bot'], (err) => {
      if (err) {
        console.error('Error logging chat response:', err.message);
      }
    });

  res.json({ response });
};

// Get chat history
const getChatHistory = (req, res) => {
  const userId = req.user.id;
  
  db.all(`SELECT * FROM chat_history WHERE user_id = ? ORDER BY created_at ASC`, [userId], (err, messages) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    res.json({ messages });
  });
};

module.exports = {
  handleChatbotQuery,
  getChatHistory
};
