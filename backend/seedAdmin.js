// backend/seedAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const User = require('./models/User');

        // Check if admin exists
        const exists = await User.findOne({ email: 'admin@thefolio.com' });
        
        if (exists) {
            console.log('Admin account already exists.');
            console.log('Email:', exists.email);
            console.log('Role:', exists.role);
            process.exit(0);
        }

        // Hash password manually
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash('Admin@1234', salt);

        // Create admin with hashed password
        await User.create({
            name: 'TheFolio Admin',
            email: 'admin@thefolio.com',
            password: hashedPassword,
            role: 'admin',
            status: 'active'
        });

        console.log('✅ Admin account created successfully!');
        console.log('Email: admin@thefolio.com');
        console.log('Password: Admin@1234');
        console.log('Role: admin');
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

seedAdmin();