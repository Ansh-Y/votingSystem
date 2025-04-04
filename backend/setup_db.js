require('dotenv').config();
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

// Create a connection for database setup
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// SQL statements to set up the database
const setupDB = [
  `DROP DATABASE IF EXISTS ${process.env.DB_NAME}`,
  `CREATE DATABASE ${process.env.DB_NAME}`,
  `USE ${process.env.DB_NAME}`,

  // Users table
  `CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'candidate', 'voter') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // Polls table
  `CREATE TABLE polls (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    question TEXT NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME,
    status ENUM('pending', 'ongoing', 'ended') DEFAULT 'ongoing',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
  )`,

  // Poll options table
  `CREATE TABLE poll_options (
    id INT PRIMARY KEY AUTO_INCREMENT,
    poll_id INT NOT NULL,
    option_text VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
  )`,

  // Votes table
  `CREATE TABLE votes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    poll_id INT NOT NULL,
    voter_id INT NOT NULL,
    option_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    FOREIGN KEY (voter_id) REFERENCES users(id),
    FOREIGN KEY (option_id) REFERENCES poll_options(id),
    UNIQUE (poll_id, voter_id)
  )`
];

// Admin user password (Admin123)
const adminPassword = bcrypt.hashSync('Admin123', 10);
// Voter password (Voter123)
const voterPassword = bcrypt.hashSync('Voter123', 10);
// Candidate password (Candidate123)
const candidatePassword = bcrypt.hashSync('Candidate123', 10);

// Insert test data
const testData = [
  // Add admin user
  `INSERT INTO users (name, email, password, role)
   VALUES ('Admin User', 'admin@example.com', '${adminPassword}', 'admin')`,

  // Add voters
  `INSERT INTO users (name, email, password, role)
   VALUES ('Voter One', 'voter1@example.com', '${voterPassword}', 'voter'),
          ('Voter Two', 'voter2@example.com', '${voterPassword}', 'voter')`,

  // Add candidates
  `INSERT INTO users (name, email, password, role)
   VALUES ('Candidate One', 'candidate1@example.com', '${candidatePassword}', 'candidate'),
          ('Candidate Two', 'candidate2@example.com', '${candidatePassword}', 'candidate'),
          ('Candidate Three', 'candidate3@example.com', '${candidatePassword}', 'candidate')`
];

// Connect to MySQL server
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL server');

  // Execute each SQL statement in sequence
  function executeStatements(statements, index = 0) {
    if (index >= statements.length) {
      console.log('Database setup completed successfully!');
      
      // Execute test data after schema is created
      if (statements === setupDB) {
        console.log('Now inserting test data...');
        executeStatements(testData, 0);
      } else {
        connection.end();
      }
      return;
    }

    const statement = statements[index];
    connection.query(statement, (err, result) => {
      if (err) {
        console.error(`Error executing SQL: ${statement}`);
        console.error(err);
        connection.end();
        process.exit(1);
      }
      
      console.log(`Executed: ${statement.substring(0, 50)}...`);
      executeStatements(statements, index + 1);
    });
  }

  // Setup database schema first
  executeStatements(setupDB, 0);
}); 