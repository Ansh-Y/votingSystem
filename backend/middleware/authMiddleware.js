const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate user tokens
 */
const authenticate = (req, res, next) => {
    // Get token from authorization header
    const authHeader = req.header('Authorization');
    console.log('Auth middleware called:', req.path);
    console.log('Authorization header:', authHeader ? `${authHeader.substring(0, 20)}...` : 'not provided');
    
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    if (!token) {
        console.log('No token provided for path:', req.path);
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token verified successfully for user:', decoded.id, decoded.email, decoded.role);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification failed:', err.name, err.message);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired. Please log in again.' });
        }
        res.status(400).json({ error: 'Invalid token.' });
    }
};

/**
 * Middleware to authorize user roles
 */
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            console.log('User not authenticated for role check');
            return res.status(401).json({ error: 'User not authenticated.' });
        }
        
        console.log(`Role check: user role ${req.user.role}, required roles: ${roles.join(', ')}`);
        if (!roles.includes(req.user.role)) {
            console.log('Access denied due to insufficient permissions');
            return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
        }
        next();
    };
};

module.exports = { authenticate, authorize };
