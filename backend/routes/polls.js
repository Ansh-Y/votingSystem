const express = require('express');
const db = require('../config/db');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Poll validation
const validatePoll = (req, res, next) => {
    const { title, description, startDate, endDate, candidates } = req.body;
    
    // Basic validation
    if (!title || title.length < 5) {
        return res.status(400).json({ error: 'Poll title must be at least 5 characters' });
    }
    
    if (!description) {
        return res.status(400).json({ error: 'Poll description is required' });
    }
    
    // Date validation
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
    }
    
    if (start < now) {
        return res.status(400).json({ error: 'Start date cannot be in the past' });
    }
    
    if (end <= start) {
        return res.status(400).json({ error: 'End date must be after start date' });
    }
    
    // Candidate validation
    if (!candidates || !Array.isArray(candidates) || candidates.length < 2) {
        return res.status(400).json({ error: 'At least two candidates are required' });
    }
    
    next();
};

// Create Poll (Admin only)
router.post('/create', authenticate, authorize(['admin']), validatePoll, (req, res) => {
    const { title, description, startDate, endDate, candidates } = req.body;
    
    // Start a transaction to ensure all operations succeed or fail together
    db.getConnection((err, connection) => {
        if (err) {
            console.error('Database connection error:', err);
            return res.status(500).json({ error: 'Failed to create poll' });
        }
        
        connection.beginTransaction(err => {
            if (err) {
                connection.release();
                return res.status(500).json({ error: 'Transaction failed' });
            }
            
            // Insert poll
            connection.query(
                'INSERT INTO polls (title, description, start_date, end_date, status, created_by) VALUES (?, ?, ?, ?, ?, ?)',
                [title, description, startDate, endDate, 'pending', req.user.id],
                (err, result) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).json({ error: 'Failed to create poll' });
                        });
                    }
                    
                    const pollId = result.insertId;
                    
                    // Insert candidates
                    const candidateValues = candidates.map(candidateId => [pollId, candidateId]);
                    
                    connection.query(
                        'INSERT INTO poll_candidates (poll_id, candidate_id) VALUES ?',
                        [candidateValues],
                        (err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    res.status(500).json({ error: 'Failed to add candidates' });
                                });
                            }
                            
                            connection.commit(err => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        res.status(500).json({ error: 'Failed to commit transaction' });
                                    });
                                }
                                
                                connection.release();
                                res.status(201).json({ 
                                    message: 'Poll created successfully',
                                    pollId
                                });
                            });
                        }
                    );
                }
            );
        });
    });
});

// Get Ongoing Polls
router.get('/ongoing', authenticate, (req, res) => {
    db.query(
        `SELECT p.*, 
         (SELECT COUNT(*) FROM votes WHERE poll_id = p.id) as vote_count
         FROM polls p 
         WHERE p.status = "ongoing"
         ORDER BY p.created_at DESC`,
        (err, results) => {
            if (err) {
                console.error('Failed to fetch polls:', err);
                return res.status(500).json({ error: 'Failed to fetch polls' });
            }
            res.json(results);
        }
    );
});

// Get Poll Details with Candidates
router.get('/:id', authenticate, (req, res) => {
    const pollId = req.params.id;
    
    // Get poll details
    db.query(
        `SELECT p.*, 
         (SELECT COUNT(*) FROM votes WHERE poll_id = p.id) as vote_count
         FROM polls p 
         WHERE p.id = ?`,
        [pollId],
        (err, pollResults) => {
            if (err) {
                console.error('Failed to fetch poll:', err);
                return res.status(500).json({ error: 'Failed to fetch poll details' });
            }
            
            if (pollResults.length === 0) {
                return res.status(404).json({ error: 'Poll not found' });
            }
            
            const poll = pollResults[0];
            
            // Get candidates for this poll
            db.query(
                `SELECT u.id, u.name, 
                 (SELECT COUNT(*) FROM votes WHERE candidate_id = pc.candidate_id AND poll_id = ?) as votes
                 FROM poll_candidates pc
                 JOIN users u ON pc.candidate_id = u.id
                 WHERE pc.poll_id = ?`,
                [pollId, pollId],
                (err, candidates) => {
                    if (err) {
                        console.error('Failed to fetch candidates:', err);
                        return res.status(500).json({ error: 'Failed to fetch candidates' });
                    }
                    
                    // Check if user already voted
                    db.query(
                        'SELECT * FROM votes WHERE poll_id = ? AND voter_id = ?',
                        [pollId, req.user.id],
                        (err, voteResults) => {
                            if (err) {
                                console.error('Failed to check vote status:', err);
                                return res.status(500).json({ error: 'Failed to check vote status' });
                            }
                            
                            res.json({
                                ...poll,
                                candidates,
                                hasVoted: voteResults.length > 0
                            });
                        }
                    );
                }
            );
        }
    );
});

// Vote in a Poll (Voters only)
router.post('/:id/vote', authenticate, authorize(['voter']), (req, res) => {
    const pollId = req.params.id;
    const { candidateId } = req.body;
    const voterId = req.user.id;
    
    if (!candidateId) {
        return res.status(400).json({ error: 'Candidate ID is required' });
    }
    
    // Check if poll exists and is ongoing
    db.query(
        'SELECT * FROM polls WHERE id = ? AND status = "ongoing"',
        [pollId],
        (err, pollResults) => {
            if (err) {
                console.error('Poll check error:', err);
                return res.status(500).json({ error: 'Failed to verify poll' });
            }
            
            if (pollResults.length === 0) {
                return res.status(404).json({ error: 'Poll not found or not active' });
            }
            
            // Check if user already voted
            db.query(
                'SELECT * FROM votes WHERE poll_id = ? AND voter_id = ?',
                [pollId, voterId],
                (err, voteResults) => {
                    if (err) {
                        console.error('Vote check error:', err);
                        return res.status(500).json({ error: 'Failed to verify vote status' });
                    }
                    
                    if (voteResults.length > 0) {
                        return res.status(400).json({ error: 'You have already voted in this poll' });
                    }
                    
                    // Verify candidate is in this poll
                    db.query(
                        'SELECT * FROM poll_candidates WHERE poll_id = ? AND candidate_id = ?',
                        [pollId, candidateId],
                        (err, candidateResults) => {
                            if (err) {
                                console.error('Candidate check error:', err);
                                return res.status(500).json({ error: 'Failed to verify candidate' });
                            }
                            
                            if (candidateResults.length === 0) {
                                return res.status(400).json({ error: 'Invalid candidate for this poll' });
                            }
                            
                            // Record the vote
                            db.query(
                                'INSERT INTO votes (poll_id, voter_id, candidate_id) VALUES (?, ?, ?)',
                                [pollId, voterId, candidateId],
                                (err, result) => {
                                    if (err) {
                                        console.error('Vote recording error:', err);
                                        return res.status(500).json({ error: 'Failed to record vote' });
                                    }
                                    
                                    res.status(201).json({ message: 'Vote recorded successfully' });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});

// End Poll (Admin only)
router.put('/:id/end', authenticate, authorize(['admin']), (req, res) => {
    const pollId = req.params.id;
    
    db.query(
        'UPDATE polls SET status = "ended", end_date = NOW() WHERE id = ?',
        [pollId],
        (err, result) => {
            if (err) {
                console.error('Error ending poll:', err);
                return res.status(500).json({ error: 'Failed to end poll' });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Poll not found' });
            }
            
            res.json({ message: 'Poll ended successfully' });
        }
    );
});

// Get Poll Results
router.get('/:id/results', authenticate, (req, res) => {
    const pollId = req.params.id;
    
    db.query(
        `SELECT p.title, p.status, 
         (SELECT COUNT(*) FROM votes WHERE poll_id = p.id) as total_votes
         FROM polls p 
         WHERE p.id = ?`,
        [pollId],
        (err, pollResults) => {
            if (err) {
                console.error('Error fetching poll results:', err);
                return res.status(500).json({ error: 'Failed to fetch poll results' });
            }
            
            if (pollResults.length === 0) {
                return res.status(404).json({ error: 'Poll not found' });
            }
            
            const poll = pollResults[0];
            
            // Get candidate results
            db.query(
                `SELECT u.id, u.name, 
                 COUNT(v.id) as vote_count, 
                 ROUND((COUNT(v.id) / (SELECT COUNT(*) FROM votes WHERE poll_id = ?)) * 100, 2) as percentage
                 FROM poll_candidates pc
                 JOIN users u ON pc.candidate_id = u.id
                 LEFT JOIN votes v ON v.candidate_id = pc.candidate_id AND v.poll_id = ?
                 WHERE pc.poll_id = ?
                 GROUP BY u.id
                 ORDER BY vote_count DESC`,
                [pollId, pollId, pollId],
                (err, candidates) => {
                    if (err) {
                        console.error('Error fetching candidate results:', err);
                        return res.status(500).json({ error: 'Failed to fetch candidate results' });
                    }
                    
                    res.json({
                        ...poll,
                        candidates
                    });
                }
            );
        }
    );
});

module.exports = router;
