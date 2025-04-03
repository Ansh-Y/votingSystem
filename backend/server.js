require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
    origin: '*', // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', apiLimiter);

// Authentication rate limiting (more strict)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // 10 attempts per 15 minutes
    message: 'Too many login attempts, please try again later.'
});
app.use('/api/auth/login', authLimiter);

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Voting System API Running');
});

const authRoutes = require('./routes/auth');
const pollRoutes = require('./routes/polls');

app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Use environment variable for port or default to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
