/**
 * Maintenance Mode Middleware
 * 
 * Uses MongoDB Settings collection for persistence (survives server restarts).
 * Falls back to in-memory flag if DB is unreachable.
 */

const Settings = require('../models/Settings');

// In-memory cache (syncs from DB)
let maintenanceMode = false;
let maintenanceMessage = 'DriveHire is under maintenance. We\'ll be back shortly! 🔧';

// Load maintenance state from DB on startup
const loadFromDB = async () => {
    try {
        const setting = await Settings.findOne({ key: 'maintenance' });
        if (setting) {
            maintenanceMode = setting.value.enabled || false;
            maintenanceMessage = setting.value.message || maintenanceMessage;
        }
    } catch (err) {
        console.error('Could not load maintenance state from DB:', err.message);
    }
};

// Call on startup
setTimeout(loadFromDB, 2000); // Wait for DB connection

const maintenanceCheck = (req, res, next) => {
    if (!maintenanceMode) return next();

    // Always allow: health check, admin routes, auth routes, maintenance-status
    const allowedPaths = ['/api/health', '/api/auth', '/api/admin', '/api/maintenance-status'];
    const isAllowed = allowedPaths.some(p => req.path.startsWith(p));
    if (isAllowed) return next();

    // Block all other API requests
    return res.status(503).json({
        success: false,
        maintenance: true,
        message: maintenanceMessage
    });
};

const setMaintenance = async (enabled, message) => {
    maintenanceMode = enabled;
    if (message) maintenanceMessage = message;

    // Persist to DB
    try {
        await Settings.findOneAndUpdate(
            { key: 'maintenance' },
            { key: 'maintenance', value: { enabled, message: maintenanceMessage } },
            { upsert: true, new: true }
        );
    } catch (err) {
        console.error('Could not persist maintenance state:', err.message);
    }
};

const getMaintenance = () => ({
    enabled: maintenanceMode,
    message: maintenanceMessage
});

module.exports = { maintenanceCheck, setMaintenance, getMaintenance };
