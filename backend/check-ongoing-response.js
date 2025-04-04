const http = require('http');

// Create a simple HTTP request to check the response
function checkEndpoint() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/polls/debug/ongoing',
      method: 'GET'
    };
    
    console.log(`Checking endpoint: ${options.hostname}:${options.port}${options.path}`);
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status code: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          try {
            const jsonData = JSON.parse(data);
            console.log('Response structure:');
            console.log(JSON.stringify(jsonData, null, 2));
            
            // Check if the response has a 'polls' property
            if (jsonData.polls) {
              console.log(`'polls' property exists with ${jsonData.polls.length} polls`);
            } else {
              console.log("'polls' property NOT FOUND in response");
              
              // If the response is an array directly
              if (Array.isArray(jsonData)) {
                console.log(`Response is a direct array with ${jsonData.length} polls`);
              }
            }
            
            resolve(jsonData);
          } catch (e) {
            console.error('Error parsing JSON:', e);
            console.log('Raw response:', data);
            reject(e);
          }
        } else {
          console.error(`Error response: ${res.statusCode}`);
          reject(new Error(`HTTP Status ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`Request error: ${error.message}`);
      reject(error);
    });
    
    req.end();
  });
}

// Run the check
async function run() {
  try {
    await checkEndpoint();
  } catch (error) {
    console.error('Failed to check endpoint:', error);
  }
}

run(); 