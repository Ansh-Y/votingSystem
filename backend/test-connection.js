const http = require('http');

console.log('Testing direct connection to backend API...');

// Test the root endpoint
function testRoot() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`API Root: Status ${res.statusCode}`);
        resolve(true);
      });
    });
    
    req.on('error', (e) => {
      console.error('Connection failed:', e.message);
      resolve(false);
    });
    
    req.end();
  });
}

// Test debug ongoing polls endpoint
function testDebugOngoing() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/polls/debug/ongoing',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Debug Ongoing: Status ${res.statusCode}`);
        try {
          const parsed = JSON.parse(data);
          console.log(`Found ${Array.isArray(parsed) ? parsed.length : 'unknown number of'} polls`);
          console.log('Sample data:', JSON.stringify(parsed).substring(0, 200) + '...');
          resolve(true);
        } catch (e) {
          console.error('Error parsing response:', e.message);
          console.log('Raw response:', data);
          resolve(false);
        }
      });
    });
    
    req.on('error', (e) => {
      console.error('Connection failed:', e.message);
      resolve(false);
    });
    
    req.end();
  });
}

// Test poll #3 (Class Monitor) specifically
function testPoll3() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/polls/debug/3',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Poll #3: Status ${res.statusCode}`);
        try {
          if (res.statusCode === 200) {
            const parsed = JSON.parse(data);
            console.log('Poll title:', parsed.title);
            console.log('Has options:', parsed.options ? `Yes (${parsed.options.length})` : 'No');
            resolve(true);
          } else {
            console.log('Failed to get poll #3');
            resolve(false);
          }
        } catch (e) {
          console.error('Error parsing response:', e.message);
          console.log('Raw response:', data);
          resolve(false);
        }
      });
    });
    
    req.on('error', (e) => {
      console.error('Connection failed:', e.message);
      resolve(false);
    });
    
    req.end();
  });
}

async function runTests() {
  console.log('-'.repeat(50));
  console.log('CONNECTIVITY TESTS');
  console.log('-'.repeat(50));
  
  const rootResult = await testRoot();
  const debugOngoingResult = await testDebugOngoing();
  const poll3Result = await testPoll3();
  
  console.log('-'.repeat(50));
  console.log('TEST RESULTS:');
  console.log('API Root:', rootResult ? '✅ PASS' : '❌ FAIL');
  console.log('Debug Ongoing:', debugOngoingResult ? '✅ PASS' : '❌ FAIL');
  console.log('Poll #3:', poll3Result ? '✅ PASS' : '❌ FAIL');
  console.log('-'.repeat(50));
  
  if (!rootResult || !debugOngoingResult || !poll3Result) {
    console.log('DIAGNOSIS:');
    if (!rootResult) {
      console.log('• The API server is not responding at all. Ensure it is running.');
    }
    if (rootResult && !debugOngoingResult) {
      console.log('• The API server is running but the debug/ongoing endpoint is not working.');
    }
    if (rootResult && !poll3Result) {
      console.log('• Poll #3 (Class Monitor) cannot be accessed via the debug endpoint.');
    }
    
    console.log('\nRECOMMENDATIONS:');
    console.log('1. Make sure the backend server is running: cd backend; node server.js');
    console.log('2. Check for any errors in the backend server console');
    console.log('3. Ensure there are no firewall issues blocking localhost connections');
    console.log('4. Try restarting both the backend and frontend servers');
  } else {
    console.log('All tests passed! The API should be accessible from the frontend.');
  }
}

runTests(); 