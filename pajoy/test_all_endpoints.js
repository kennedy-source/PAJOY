const http = require('http');

function testEndpoint(path, name) {
  return new Promise((resolve) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5179,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`\n=== ${name} ===`);
        console.log(`Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          console.log(`Response: ${data.substring(0, 200)}...`);
          console.log('✅ Working');
        } else {
          console.log(`❌ Failed with status ${res.statusCode}`);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`\n=== ${name} ===`);
      console.log(`❌ Connection failed: ${e.message}`);
      resolve();
    });

    req.end();
  });
}

async function testAll() {
  console.log('Testing PAJOY System endpoints...');
  
  await testEndpoint('/api/reports/summary', 'Reports Summary');
  await testEndpoint('/api/reports/sales-trend?days=14', 'Sales Trend');
  await testEndpoint('/api/products', 'Products');
  await testEndpoint('/api/sales', 'Sales');
  await testEndpoint('/api/customers', 'Customers');
  await testEndpoint('/api/schools', 'Schools');
  await testEndpoint('/api/categories', 'Categories');
  
  console.log('\n=== Test Complete ===');
}

testAll();
