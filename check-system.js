const http = require('http');

// Test a specific endpoint
async function testEndpoint(path, expectedStatus = 200) {
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

    console.log(`Testing endpoint: ${options.hostname}:${options.port}${options.path}`);
    
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`Status Code: ${res.statusCode} (Expected: ${expectedStatus})`);
        try {
          const result = {
            success: res.statusCode === expectedStatus,
            statusCode: res.statusCode,
            path: path
          };
          
          if (data) {
            try {
              result.data = JSON.parse(data);
            } catch (e) {
              result.rawData = data.substring(0, 500); // Truncate long responses
            }
          }
          
          resolve(result);
        } catch (e) {
          reject(e);
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

// Test different poll-related endpoints
async function runTests() {
  const results = {
    passed: [],
    failed: []
  };
  
  try {
    console.log('\n==== SYSTEM DIAGNOSTIC TESTS ====\n');
    
    // Test server root
    try {
      const rootResult = await testEndpoint('');
      if (rootResult.success) {
        results.passed.push('API root endpoint');
      } else {
        results.failed.push('API root endpoint');
      }
    } catch (error) {
      results.failed.push('API root endpoint');
      console.error('Root endpoint test failed:', error.message);
    }
    
    // Test ongoing polls debug endpoint
    try {
      const ongoingResult = await testEndpoint('/polls/debug/ongoing');
      if (ongoingResult.success) {
        results.passed.push('Debug ongoing polls endpoint');
        console.log(`Found ${ongoingResult.data?.length || 0} ongoing polls`);
      } else {
        results.failed.push('Debug ongoing polls endpoint');
      }
    } catch (error) {
      results.failed.push('Debug ongoing polls endpoint');
      console.error('Ongoing polls test failed:', error.message);
    }
    
    // Test debug poll details endpoint
    try {
      // Try poll ID 1 as a test
      const pollDetailsResult = await testEndpoint('/polls/debug/1', 200);
      if (pollDetailsResult.success) {
        results.passed.push('Debug poll details endpoint');
        console.log(`Poll details retrieved for ID 1: ${pollDetailsResult.data?.title || 'Unknown'}`);
      } else {
        results.failed.push('Debug poll details endpoint (This could be normal if poll ID 1 doesn\'t exist)');
      }
    } catch (error) {
      results.failed.push('Debug poll details endpoint');
      console.error('Poll details test failed:', error.message);
    }
    
    // Print summary
    console.log('\n==== TEST RESULTS ====\n');
    console.log(`PASSED: ${results.passed.length} tests`);
    results.passed.forEach(test => console.log(`✓ ${test}`));
    
    console.log(`\nFAILED: ${results.failed.length} tests`);
    results.failed.forEach(test => console.log(`✗ ${test}`));
    
    console.log('\n==== RECOMMENDATIONS ====\n');
    if (results.failed.includes('API root endpoint')) {
      console.log('✗ The backend server is not running or is not accessible.');
      console.log('  - Start the backend server with: cd backend && node server.js');
    }
    
    if (results.failed.includes('Debug ongoing polls endpoint')) {
      console.log('✗ The polls debug endpoint is not working.');
      console.log('  - Check the backend/routes/polls.js file for the correct route implementation');
    }
    
    if (results.failed.includes('Debug poll details endpoint')) {
      console.log('✗ The poll details debug endpoint is not working or poll ID 1 doesn\'t exist.');
      console.log('  - Make sure the debug/:id route is defined BEFORE the /:id route in backend/routes/polls.js');
      console.log('  - Check if any polls exist in the database');
    }
    
    if (results.passed.length === 3) {
      console.log('✓ All core endpoints are working correctly!');
      console.log('  - If you\'re still experiencing issues, check the browser console for errors');
      console.log('  - Verify your user has the proper permissions for the actions you\'re trying to perform');
    }
    
  } catch (error) {
    console.error('Test run failed:', error);
  }
}

// Run the tests
runTests(); 