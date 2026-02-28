require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests from any localhost port (dev) or the configured CLIENT_URL
        const allowed = [process.env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'];
        if (!origin || allowed.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all in dev — restrict in production
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Maintenance mode — blocks non-admin requests when enabled
const { maintenanceCheck } = require('./middleware/maintenance');
app.use(maintenanceCheck);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/customers', require('./routes/customer'));
app.use('/api/drivers', require('./routes/driver'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/support', require('./routes/support'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'DriveHire API is running 🚗' });
});

// Public maintenance status (no auth needed)
const { getMaintenance } = require('./middleware/maintenance');
app.get('/api/maintenance-status', (req, res) => {
    res.json({ success: true, ...getMaintenance() });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
