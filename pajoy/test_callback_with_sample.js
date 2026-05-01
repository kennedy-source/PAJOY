const http = require('http');

// Test the Pesapal callback endpoint with the sample payment
const options = {
  hostname: '127.0.0.1',
  port: 5179,
  path: '/api/payments/callback?orderTrackingId=test-order-456&reference=TEST-123&payment_method=MPESA&payment_account=254712345678&confirmation_code=ABC123',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers, null, 2)}`);
  
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
  
  res.on('end', () => {
    console.log('Callback endpoint test completed');
  });
});

req.on('error', (e) => {
  console.error(`Callback endpoint test failed: ${e.message}`);
});

req.end();
