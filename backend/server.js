// backend/server.js
require('dotenv').config(); // Load .env variables FIRST
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');
const commentRoutes = require('./routes/comment.routes');
const adminRoutes = require('./routes/admin.routes');
const messageRoutes = require('./routes/message.routes');

const app = express();
connectDB(); // Connect to MongoDB

// ── Middleware ─────────────────────────────────────────────────
// Allow multiple origins: local React (dev) + Vercel frontend (prod)
const allowedOrigins = [
  'http://localhost:3000',                                    // local React dev server
  'https://thefolioproject-dm5pn0t0n-edrickmarks-projects.vercel.app', // your Vercel frontend
  // Add any other custom domain you might use later
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,          // allow cookies/auth headers
}));

// Parse incoming JSON request bodies
app.use(express.json());

// Serve uploaded image files as public URLs
// e.g. https://your-backend.onrender.com/uploads/my-image.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});