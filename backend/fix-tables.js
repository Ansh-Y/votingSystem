require('dotenv').config();
const mysql = require('mysql2');

// Create a connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Connect to MySQL
connection.connect(err => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
  console.log('Connected to database');

  // Check if poll_options table exists
  console.log('Checking if poll_options table exists...');
  connection.query(
    "SHOW TABLES LIKE 'poll_options'",
    (err, results) => {
      if (err) {
        console.error('Error checking for poll_options table:', err);
        connection.end();
        process.exit(1);
      }

      if (results.length === 0) {
        console.log('poll_options table does not exist. Creating it now...');
        connection.query(
          `CREATE TABLE poll_options (
            id INT PRIMARY KEY AUTO_INCREMENT,
            poll_id INT NOT NULL,
            option_text VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
          )`,
          (err) => {
            if (err) {
              console.error('Error creating poll_options table:', err);
              connection.end();
              process.exit(1);
            }
            console.log('Successfully created poll_options table!');
            
            // Check if votes table exists too
            checkVotesTable();
          }
        );
      } else {
        console.log('poll_options table already exists.');
        // Check if votes table exists too
        checkVotesTable();
      }
    }
  );
  
  // Function to check and create votes table if needed
  function checkVotesTable() {
    console.log('Checking if votes table exists...');
    connection.query(
      "SHOW TABLES LIKE 'votes'",
      (err, results) => {
        if (err) {
          console.error('Error checking for votes table:', err);
          connection.end();
          process.exit(1);
        }

        if (results.length === 0) {
          console.log('votes table does not exist. Creating it now...');
          connection.query(
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
            )`,
            (err) => {
              if (err) {
                console.error('Error creating votes table:', err);
              } else {
                console.log('Successfully created votes table!');
              }
              connection.end();
            }
          );
        } else {
          console.log('votes table already exists.');
          connection.end();
        }
      }
    );
  }
}); 