// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['member', 'admin'], default: 'member' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  bio: { type: String, default: '' },
  profilePic: { type: String, default: '' },
}, { timestamps: true });

// ✅ PRE-SAVE HOOK: Hash password before saving (async, no `next`)
userSchema.pre('save', async function() {
  // Only hash if password is modified (or new)
  if (!this.isModified('password')) return;
  
  console.log(`Hashing password for user: ${this.email}`);
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    console.error('Password hashing error:', err);
    throw err;  // Mongoose will handle the error
  }
});

// Method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);