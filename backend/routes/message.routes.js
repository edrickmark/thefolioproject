// backend/routes/message.routes.js
const express = require('express');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly, memberOrAdmin } = require('../middleware/role.middleware');
const router = express.Router();

// POST /api/messages - Send a message (for registered users and guests)
router.post('/', async (req, res) => {
  try {
    const { subject, message, senderName, senderEmail } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }
    
    // For authenticated users, use their info; for guests, use provided info
    const name = req.user?.name || senderName;
    const email = req.user?.email || senderEmail;
    const senderId = req.user?._id || null;
    
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    
    const newMessage = await Message.create({
      sender: senderId,
      senderName: name,
      senderEmail: email,
      subject: subject.trim(),
      message: message.trim(),
      status: 'unread'
    });
    
    res.status(201).json({ 
      message: 'Message sent successfully!',
      data: newMessage 
    });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/messages - Get all messages (admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('sender', 'name email profilePic')
      .sort({ createdAt: -1 });
    
    // Get counts
    const unreadCount = messages.filter(m => m.status === 'unread').length;
    
    res.json({
      messages,
      unreadCount,
      total: messages.length
    });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/messages/unread-count - Get unread messages count (admin only)
router.get('/unread-count', protect, adminOnly, async (req, res) => {
  try {
    const count = await Message.countDocuments({ status: 'unread' });
    res.json({ unreadCount: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/messages/:id/read - Mark message as read (admin only)
router.put('/:id/read', protect, adminOnly, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    message.status = 'read';
    await message.save();
    
    res.json({ message: 'Message marked as read', data: message });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/messages/:id/reply - Reply to message (admin only)
router.put('/:id/reply', protect, adminOnly, async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply) {
      return res.status(400).json({ message: 'Reply is required' });
    }
    
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    message.reply = reply;
    message.status = 'replied';
    message.repliedAt = new Date();
    await message.save();
    
    res.json({ message: 'Reply sent successfully', data: message });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/messages/:id - Delete message (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    await message.deleteOne();
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;