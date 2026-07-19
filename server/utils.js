// Higher-order function to wrap async route handlers and catch errors
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error class for operational errors
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Simple, dependency-free validation helpers shared by the auth routes.
const isValidEmail = (email) => typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPassword = (password) => typeof password === 'string' && password.length >= 8;

// Parses simple duration strings ("1d", "15m", "30s", "2h") the same way
// jsonwebtoken's `expiresIn` option does, returning milliseconds. Falls back
// to 1 day if the value can't be parsed (e.g. a bare number of seconds).
const UNIT_MS = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
const ttlToMs = (value) => {
    if (typeof value === 'number') return value * 1000;
    const match = /^(\d+)\s*(s|m|h|d)$/.exec(String(value).trim());
    if (!match) return 24 * 60 * 60 * 1000; // default: 1 day
    const [, amount, unit] = match;
    return Number(amount) * UNIT_MS[unit];
};

export { asyncHandler, AppError, isValidEmail, isValidPassword, ttlToMs };
