require('dotenv').config();
const mysql = require('mysql2');

// Create a connection for database setup
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Connect to the database
db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
  console.log('Connected to database');
  
  fixTables();
});

async function fixTables() {
  try {
    // Check and create poll_options table if it doesn't exist
    await checkAndCreatePollOptionsTable();
    
    // Check and create votes table if it doesn't exist
    await checkAndCreateVotesTable();
    
    // Check and add question column to polls table if it doesn't exist
    await checkAndAddQuestionColumn();
    
    console.log('All tables and columns checked and fixed!');
    db.end();
  } catch (error) {
    console.error('Error fixing tables:', error);
    db.end();
  }
}

// Check if poll_options table exists and create it if it doesn't
function checkAndCreatePollOptionsTable() {
  return new Promise((resolve, reject) => {
    db.query("SHOW TABLES LIKE 'poll_options'", (err, results) => {
      if (err) {
        return reject(err);
      }
      
      if (results.length === 0) {
        console.log('poll_options table does not exist. Creating it now...');
        
        const createTableSQL = `
          CREATE TABLE poll_options (
            id INT PRIMARY KEY AUTO_INCREMENT,
            poll_id INT NOT NULL,
            option_text VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
          )
        `;
        
        db.query(createTableSQL, (err) => {
          if (err) {
            return reject(err);
          }
          console.log('poll_options table created successfully!');
          resolve();
        });
      } else {
        console.log('poll_options table already exists.');
        resolve();
      }
    });
  });
}

// Check if votes table exists and create it if it doesn't
function checkAndCreateVotesTable() {
  return new Promise((resolve, reject) => {
    db.query("SHOW TABLES LIKE 'votes'", (err, results) => {
      if (err) {
        return reject(err);
      }
      
      if (results.length === 0) {
        console.log('votes table does not exist. Creating it now...');
        
        const createTableSQL = `
          CREATE TABLE votes (
            id INT PRIMARY KEY AUTO_INCREMENT,
            poll_id INT NOT NULL,
            voter_id INT NOT NULL,
            option_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
            FOREIGN KEY (voter_id) REFERENCES users(id),
            FOREIGN KEY (option_id) REFERENCES poll_options(id),
            UNIQUE (poll_id, voter_id)
          )
        `;
        
        db.query(createTableSQL, (err) => {
          if (err) {
            return reject(err);
          }
          console.log('votes table created successfully!');
          resolve();
        });
      } else {
        console.log('votes table already exists.');
        resolve();
      }
    });
  });
}

// Check if question column exists in polls table and add it if it doesn't
function checkAndAddQuestionColumn() {
  return new Promise((resolve, reject) => {
    db.query("SHOW COLUMNS FROM polls LIKE 'question'", (err, results) => {
      if (err) {
        return reject(err);
      }
      
      if (results.length === 0) {
        console.log('Question column does not exist. Adding it now...');
        
        db.query("ALTER TABLE polls ADD COLUMN question TEXT NULL", (err) => {
          if (err) {
            return reject(err);
          }
          console.log('Successfully added question column to polls table!');
          resolve();
        });
      } else {
        console.log('Question column already exists in polls table.');
        resolve();
      }
    });
  });
} 