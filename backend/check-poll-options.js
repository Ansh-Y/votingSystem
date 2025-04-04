require('dotenv').config();
const mysql = require('mysql2');

// Create a connection
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
  
  console.log('Checking poll_options table...');
  
  // Check if the poll_options table has any records
  db.query('SELECT COUNT(*) as optionCount FROM poll_options', (err, results) => {
    if (err) {
      console.error('Error checking poll_options table:', err);
      db.end();
      return;
    }
    
    const optionCount = results[0].optionCount;
    console.log(`Found ${optionCount} options in poll_options table`);
    
    if (optionCount === 0) {
      console.log('No options found. The table exists but is empty.');
    } else {
      // Check how many polls have options
      db.query('SELECT poll_id, COUNT(*) as optionCount FROM poll_options GROUP BY poll_id', (err, pollResults) => {
        if (err) {
          console.error('Error checking poll options:', err);
          db.end();
          return;
        }
        
        console.log(`Found options for ${pollResults.length} different polls:`);
        pollResults.forEach(poll => {
          console.log(`Poll ID ${poll.poll_id}: ${poll.optionCount} options`);
        });
        
        // Get details for each poll
        const pollIds = pollResults.map(p => p.poll_id);
        
        if (pollIds.length > 0) {
          const placeholders = pollIds.map(() => '?').join(',');
          db.query(
            `SELECT id, title, status FROM polls WHERE id IN (${placeholders})`, 
            pollIds,
            (err, pollDetailResults) => {
              if (err) {
                console.error('Error fetching poll details:', err);
                db.end();
                return;
              }
              
              console.log('\nPoll Details:');
              pollDetailResults.forEach(poll => {
                console.log(`Poll ID ${poll.id}: ${poll.title} (${poll.status})`);
              });
              
              db.end();
            }
          );
        } else {
          db.end();
        }
      });
    }
  });
}); 