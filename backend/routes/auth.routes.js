// backend/routes/auth.routes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');
const router = express.Router();

// Helper function — generates a JWT token that expires in 7 days
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ── POST /api/auth/register ───────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  console.log('Registration attempt:', { name, email }); // Debug log
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password' });
  }
  
  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email is already registered' });
    }
    
    const user = await User.create({ name, email, password });
    
    res.status(201).json({
      token: generateToken(user._id),
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        profilePic: user.profilePic,
        bio: user.bio
      }
    });
  } catch (err) { 
    console.error('Registration error:', err);
    res.status(500).json({ message: err.message }); 
  }
});

// ── POST /api/auth/login ──────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt for email:', email); // Debug log
  
  if (!email || !password) {
    console.log('Missing email or password');
    return res.status(400).json({ message: 'Please provide email and password' });
  }
  
  try {
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found with email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    console.log('User found:', { email: user.email, role: user.role, status: user.status }); // Debug log
    
    // Check if account is active
    if (user.status === 'inactive') {
      console.log('Account is inactive:', email);
      return res.status(403).json({ message: 'Your account is deactivated. Please contact the admin.' });
    }
    
    // Check password
    const match = await user.matchPassword(password);
    console.log('Password match result:', match); // Debug log
    
    if (!match) {
      console.log('Password mismatch for:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate token
    const token = generateToken(user._id);
    console.log('Login successful for:', email, 'Token generated'); // Debug log
    
    // Send response
    res.json({
      token: token,
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        profilePic: user.profilePic || '',
        bio: user.bio || '',
        status: user.status
      }
    });
  } catch (err) { 
    console.error('Login error:', err);
    res.status(500).json({ message: err.message }); 
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/auth/profile ─────────────────────────────────────
router.put('/profile', protect, upload.single('profilePic'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (req.body.name) user.name = req.body.name.trim();
    if (req.body.bio) user.bio = req.body.bio.trim();
    if (req.file) user.profilePic = req.file.filename;
    
    await user.save();
    
    const updated = await User.findById(user._id).select('-password');
    res.json({ 
      message: 'Profile updated successfully',
      user: updated 
    });
  } catch (err) { 
    console.error('Profile update error:', err);
    res.status(500).json({ message: err.message }); 
  }
});

// ── PUT /api/auth/change-password ────────────────────────────
router.put('/change-password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Please provide current and new password' });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }
  
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const match = await user.matchPassword(currentPassword);
    if (!match) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) { 
    console.error('Password change error:', err);
    res.status(500).json({ message: err.message }); 
  }
});

module.exports = router;