/**
 * Format a date as a relative string ("2 hours ago", "3 days ago", etc.)
 */
export function timeAgo(date) {
    const now = new Date();
    const d = new Date(date);
    const seconds = Math.floor((now - d) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(days / 365);
    return `${years}y ago`;
}

/**
 * Format number in Indian numbering system (₹1,23,456)
 */
export function formatINR(amount) {
    if (amount == null || isNaN(amount)) return '₹0';
    const num = Number(amount);
    const formatted = num.toLocaleString('en-IN');
    return `₹${formatted}`;
}

/**
 * Validate Indian phone number (+91 or 10-digit)
 */
export function validatePhone(phone) {
    if (!phone) return { valid: false, message: 'Phone number is required' };
    const cleaned = phone.replace(/[\s\-()]/g, '');
    // Accept +91XXXXXXXXXX or 10-digit
    const pattern = /^(\+91)?[6-9]\d{9}$/;
    if (!pattern.test(cleaned)) {
        return { valid: false, message: 'Enter a valid Indian phone number (10 digits starting with 6-9)' };
    }
    return { valid: true, message: '' };
}

/**
 * Get driver badges based on stats
 */
export function getDriverBadges(driver) {
    const badges = [];
    if (!driver) return badges;

    if (driver.rating >= 4.5) badges.push({ label: '⭐ Top Rated', color: 'warning' });
    if (driver.completedJobs >= 100) badges.push({ label: '🏆 100+ Jobs', color: 'success' });
    else if (driver.completedJobs >= 50) badges.push({ label: '🎯 50+ Jobs', color: 'info' });
    if (driver.experience >= 10) badges.push({ label: '🛡️ Veteran', color: 'primary' });
    else if (driver.experience >= 5) badges.push({ label: '💪 Experienced', color: 'info' });
    if (driver.completedJobs === 0) badges.push({ label: '🆕 New Driver', color: 'secondary' });
    if (driver.documentStatus === 'verified') badges.push({ label: '✅ Verified', color: 'success' });

    return badges;
}

/**
 * Password strength calculator
 */
export function getPasswordStrength(password) {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
        { label: '', color: '' },
        { label: 'Weak', color: 'var(--danger)' },
        { label: 'Fair', color: 'var(--warning)' },
        { label: 'Good', color: 'var(--info)' },
        { label: 'Strong', color: 'var(--success)' },
        { label: 'Very Strong', color: 'var(--success)' }
    ];
    return { score, ...levels[score] };
}
