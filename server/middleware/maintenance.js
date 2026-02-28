/**
 * Maintenance Mode Middleware
 * 
 * Uses an in-memory flag (in production, use Redis or a DB flag).
 * When maintenance is ON, all requests except admin and health-check are blocked.
 */

let maintenanceMode = false;
let maintenanceMessage = 'DriveHire is under maintenance. We\'ll be back shortly! 🔧';

const maintenanceCheck = (req, res, next) => {
    if (!maintenanceMode) return next();

    // Always allow: health check, admin routes, auth routes (so admin can log in)
    const allowedPaths = ['/api/health', '/api/auth', '/api/admin'];
    const isAllowed = allowedPaths.some(p => req.path.startsWith(p));
    if (isAllowed) return next();

    // Block all other API requests
    return res.status(503).json({
        success: false,
        maintenance: true,
        message: maintenanceMessage
    });
};

const setMaintenance = (enabled, message) => {
    maintenanceMode = enabled;
    if (message) maintenanceMessage = message;
};

const getMaintenance = () => ({
    enabled: maintenanceMode,
    message: maintenanceMessage
});

module.exports = { maintenanceCheck, setMaintenance, getMaintenance };
