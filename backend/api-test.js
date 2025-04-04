const http = require('http');

// Function to make a request
function makeRequest(path, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Add token if provided
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`Making request to: ${options.method} ${options.hostname}:${options.port}${options.path}`);
    
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        try {
          const parsedData = JSON.parse(data);
          resolve({ statusCode: res.statusCode, body: parsedData });
        } catch (e) {
          console.log('Raw response:', data);
          resolve({ statusCode: res.statusCode, body: data });
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

async function runTests() {
  try {
    // Test debug endpoint (no auth required)
    console.log('\n--- Testing debug endpoint ---');
    const debugResult = await makeRequest('/polls/debug/ongoing');
    console.log('Debug result:', JSON.stringify(debugResult, null, 2));

    // Test regular ongoing endpoint (auth required)
    console.log('\n--- Testing regular ongoing endpoint (no token) ---');
    const noAuthResult = await makeRequest('/polls/ongoing');
    console.log('No auth result:', JSON.stringify(noAuthResult, null, 2));

    // You can add a test with a valid token by uncommenting and adding a token:
    /*
    console.log('\n--- Testing with token ---');
    const token = 'YOUR_VALID_TOKEN_HERE';
    const authResult = await makeRequest('/polls/ongoing', token);
    console.log('Auth result:', JSON.stringify(authResult, null, 2));
    */
  } catch (error) {
    console.error('Test run failed:', error);
  }
}

runTests(); 