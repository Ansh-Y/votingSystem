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

  // Check if question column exists in polls table and add it if it doesn't
  function checkAndAddQuestionColumn() {
    return new Promise((resolve, reject) => {
      connection.query("SHOW COLUMNS FROM polls LIKE 'question'", (err, results) => {
        if (err) {
          return reject(err);
        }
        
        if (results.length === 0) {
          console.log('Question column does not exist. Adding it now...');
          
          // Adding without a default value
          connection.query("ALTER TABLE polls ADD COLUMN question TEXT NULL", (err) => {
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

  checkAndAddQuestionColumn()
    .then(() => {
      connection.end();
    })
    .catch(err => {
      console.error('Error checking or adding question column:', err);
      connection.end();
      process.exit(1);
    });
}); 