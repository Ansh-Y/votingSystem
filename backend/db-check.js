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
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
  console.log('Connected to database');

  // Check polls table
  connection.query('SELECT * FROM polls', (err, polls) => {
    if (err) {
      console.error('Error querying polls:', err);
    } else {
      console.log('Found', polls.length, 'polls:');
      polls.forEach(poll => {
        console.log(`ID: ${poll.id}, Title: ${poll.title}, Status: ${poll.status}, Created by: ${poll.created_by}`);
      });
    }

    // Check poll options
    connection.query('SELECT * FROM poll_options', (err, options) => {
      if (err) {
        console.error('Error querying poll options:', err);
      } else {
        console.log('\nFound', options.length, 'poll options:');
        options.forEach(option => {
          console.log(`ID: ${option.id}, Poll ID: ${option.poll_id}, Option Text: ${option.option_text}`);
        });
      }

      // Close connection
      connection.end();
    });
  });
}); 