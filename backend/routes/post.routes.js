// backend/routes/post.routes.js
const express = require('express');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth.middleware');
const { memberOrAdmin } = require('../middleware/role.middleware');
const upload = require('../middleware/upload');
const router = express.Router();

// GET all published posts (public)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' })
      .populate('author', 'name profilePic')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
});

// GET single post (public for published posts)
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name profilePic');
    
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.status === 'removed') return res.status(404).json({ message: 'Post not found' });
    
    res.json(post);
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
});

// CREATE post - FOR MEMBERS AND ADMINS
router.post('/', protect, memberOrAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, body } = req.body;
    
    // Validate required fields
    if (!title || !body) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    
    // Get image filename if uploaded
    const image = req.file ? req.file.filename : '';
    
    // Create the post
    const post = await Post.create({ 
      title: title.trim(), 
      body: body.trim(), 
      image, 
      status: 'published',
      author: req.user._id 
    });

    // Populate author info before sending response
    await post.populate('author', 'name profilePic');
    
    res.status(201).json(post);
  } catch (err) { 
    console.error('Create post error:', err);
    res.status(500).json({ message: err.message }); 
  }
});

// UPDATE post - only author or admin
router.put('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    // Check if user is author or admin
    const isAuthor = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }
    
    const { title, body } = req.body;
    if (title) post.title = title.trim();
    if (body) post.body = body.trim();
    
    await post.save();
    await post.populate('author', 'name profilePic');
    
    res.json(post);
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
});

// DELETE post - only author or admin
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    // Check if user is author or admin
    const isAuthor = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    
    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
});

module.exports = router;