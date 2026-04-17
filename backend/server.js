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
// Allow multiple origins: local React (dev) + Vercel frontends (prod)
const allowedOrigins = [
  'http://localhost:3000',                                                           // local React dev
  'https://thefolioproject-dm5pn0t0n-edrickmarks-projects.vercel.app',              // old Vercel URL
  'https://thefolioproject-9necqrp04-edrickmarks-projects.vercel.app'               // your current Vercel URL
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed from this origin'));
    }
  },
  credentials: true,
}));

// ✅ SIMPLER ALTERNATIVE (use if you keep getting new Vercel preview URLs):
// app.use(cors({ origin: true, credentials: true }));

// Parse incoming JSON request bodies
app.use(express.json());

// Serve uploaded image files as public URLs
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