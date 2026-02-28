// Seed an admin user into the database
// Run: node scripts/seedAdmin.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const existing = await User.findOne({ email: 'admin@drivehire.com' });
        if (existing) {
            console.log('Admin already exists:', existing.email);
            process.exit(0);
        }

        const admin = await User.create({
            name: 'Admin',
            email: 'admin@drivehire.com',
            password: 'Admin@123',
            phone: '9999999999',
            role: 'admin',
            isVerified: true
        });

        console.log('✅ Admin user created:');
        console.log('   Email: admin@drivehire.com');
        console.log('   Password: Admin@123');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

seedAdmin();
