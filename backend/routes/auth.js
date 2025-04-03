const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const router = express.Router();

// Input validation middleware
const validateRegister = (req, res, next) => {
    const { name, email, password, role } = req.body;
    
    // Check required fields
    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Validate role
    if (!['admin', 'candidate', 'voter'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role specified' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Validate password strength
    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    
    // Check for password strength (at least one uppercase, one lowercase, one number)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
            error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
        });
    }
    
    next();
};

// Register
router.post('/register', validateRegister, (req, res) => {
    const { name, email, password, role } = req.body;
    
    console.log('Registration attempt:', { name, email, role });
    
    // Check if email already exists
    db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Database error checking email:', err);
            return res.status(500).json({ error: 'Database error during registration' });
        }
        
        if (results.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        
        // Hash password and create user
        const hashedPassword = bcrypt.hashSync(password, 10);
        
        db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role],
            (err, result) => {
                if (err) {
                    console.error('Registration error:', err);
                    return res.status(500).json({ error: 'Registration failed: ' + err.message });
                }
                
                console.log('User registered successfully with ID:', result.insertId);
                
                res.status(201).json({ 
                    message: 'User registered successfully',
                    userId: result.insertId 
                });
            }
        );
    });
});

// Login validation
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    
    next();
};

// Login
router.post('/login', validateLogin, (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Login error:', err);
            return res.status(500).json({ error: 'Database error during login' });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = results[0];
        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Create token with appropriate expiration
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );
        
        // Don't send password in response
        delete user.password;
        
        res.json({ 
            message: 'Login successful',
            token, 
            user 
        });
    });
});

module.exports = router;
