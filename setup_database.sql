-- Drop database if exists and create a new one
DROP DATABASE IF EXISTS voting_db;
CREATE DATABASE voting_db;
USE voting_db;

-- Users table for storing all users (admin, candidates, voters)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'candidate', 'voter') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Polls table for storing voting polls
CREATE TABLE polls (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    status ENUM('pending', 'ongoing', 'ended') DEFAULT 'pending',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Poll candidates table (linking poll with candidate users)
CREATE TABLE poll_candidates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    poll_id INT NOT NULL,
    candidate_id INT NOT NULL,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES users(id),
    UNIQUE (poll_id, candidate_id)
);

-- Votes table to record each vote
CREATE TABLE votes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    poll_id INT NOT NULL,
    voter_id INT NOT NULL,
    candidate_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    FOREIGN KEY (voter_id) REFERENCES users(id),
    FOREIGN KEY (candidate_id) REFERENCES users(id),
    UNIQUE (poll_id, voter_id) -- Ensure one vote per poll per voter
);

-- Add an initial admin user
INSERT INTO users (name, email, password, role)
VALUES (
    'Admin User', 
    'admin@example.com', 
    '$2a$10$b9yA1qLXBguwO9DFeDRyI.nWv8J6ZeP3BvyKxQ3yAHJQOd.cHN22e', -- password: Admin123
    'admin'
);

-- Add some example voters
INSERT INTO users (name, email, password, role)
VALUES 
    ('Voter One', 'voter1@example.com', '$2a$10$cCXazKfL6MrBbJaJzN56EejAvj92TxiXpQpVuGFqLJmJWFVKYzZHu', 'voter'), -- password: Voter123
    ('Voter Two', 'voter2@example.com', '$2a$10$cCXazKfL6MrBbJaJzN56EejAvj92TxiXpQpVuGFqLJmJWFVKYzZHu', 'voter'); -- password: Voter123

-- Add some example candidates
INSERT INTO users (name, email, password, role)
VALUES
    ('Candidate One', 'candidate1@example.com', '$2a$10$JbRXw95B.zn1IbBm2X5cK.jcHGaFIorfHxv5MQHUDSgbOGLnvGU/u', 'candidate'), -- password: Candidate123
    ('Candidate Two', 'candidate2@example.com', '$2a$10$JbRXw95B.zn1IbBm2X5cK.jcHGaFIorfHxv5MQHUDSgbOGLnvGU/u', 'candidate'), -- password: Candidate123
    ('Candidate Three', 'candidate3@example.com', '$2a$10$JbRXw95B.zn1IbBm2X5cK.jcHGaFIorfHxv5MQHUDSgbOGLnvGU/u', 'candidate'); -- password: Candidate123 

USE voting_db;
DESCRIBE users; 