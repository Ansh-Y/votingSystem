require('dotenv').config();
const mysql = require('mysql2');

// Create a connection to the database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Connect to the database
db.connect(err => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
  console.log('Connected to database');
  
  // Check if poll #3 exists
  db.query('SELECT * FROM polls WHERE id = 3', (err, pollResults) => {
    if (err) {
      console.error('Error checking for poll #3:', err);
      db.end();
      return;
    }
    
    if (pollResults.length === 0) {
      console.log('Poll #3 does not exist. Creating it...');
      
      // Create poll #3 (Class Monitor)
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      
      db.query(
        'INSERT INTO polls (id, title, description, question, start_date, end_date, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [3, 'Class Monitor', 'Test poll', 'Who should be the class monitor?', now, endDate, 'ongoing', 1],
        (err, result) => {
          if (err) {
            console.error('Error creating poll #3:', err);
            db.end();
            return;
          }
          
          console.log('Successfully created poll #3');
          addOptions();
        }
      );
    } else {
      console.log('Poll #3 already exists:', pollResults[0].title);
      addOptions();
    }
  });
  
  function addOptions() {
    // Check if poll #3 already has options
    db.query('SELECT * FROM poll_options WHERE poll_id = 3', (err, optionResults) => {
      if (err) {
        console.error('Error checking for existing options:', err);
        db.end();
        return;
      }
      
      if (optionResults.length > 0) {
        console.log(`Poll #3 already has ${optionResults.length} options:`);
        optionResults.forEach(option => {
          console.log(`- Option ${option.id}: ${option.option_text}`);
        });
        db.end();
        return;
      }
      
      console.log('No options found for poll #3. Adding options...');
      
      // Add options for poll #3
      const options = [
        "Option 1 (Ankit)",
        "Option 2 (Raj)"
      ];
      
      let completed = 0;
      options.forEach((optionText, index) => {
        db.query(
          'INSERT INTO poll_options (poll_id, option_text) VALUES (?, ?)',
          [3, optionText],
          (err, result) => {
            if (err) {
              console.error(`Error adding option ${index + 1}:`, err);
            } else {
              console.log(`Added option ${index + 1}: ${optionText}`);
            }
            
            completed++;
            if (completed === options.length) {
              console.log('All options added successfully!');
              db.end();
            }
          }
        );
      });
    });
  }
}); 