const http = require('http');

// Test the reports API endpoint
const options = {
  hostname: '127.0.0.1',
  port: 5179,
  path: '/api/reports/summary',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
  
  res.on('end', () => {
    console.log('API connection test successful!');
  });
});

req.on('error', (e) => {
  console.error(`API connection test failed: ${e.message}`);
});

req.end();
