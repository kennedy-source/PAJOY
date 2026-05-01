// Test only M-Pesa authentication
console.log('=== M-PESA AUTH TEST ONLY ===');

// Set known working sandbox credentials
const CONSUMER_KEY = 'bqQ1J3s9hArXGhM5axC9R0WJ3QGWj';
const CONSUMER_SECRET = 'YourConsumerSecret';
const SHORTCODE = '174379';

console.log('Testing with:');
console.log('Consumer Key:', CONSUMER_KEY);
console.log('Consumer Secret:', CONSUMER_SECRET);

async function testAuthOnly() {
  try {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    console.log('Auth string:', auth);
    
    const response = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });

    const responseText = await response.text();
    console.log('Raw Response:', responseText);
    
    const data = JSON.parse(responseText);
    console.log('Parsed Response:', data);
    console.log('Access Token:', data.access_token ? 'SUCCESS' : 'FAILED');
    
    return data.access_token;
  } catch (error) {
    console.error('Auth Error:', error.message);
    return null;
  }
}

testAuthOnly();
