// Test with current working sandbox credentials from our earlier test
console.log('=== TESTING CURRENT WORKING SANDBOX ===');

// These credentials worked in our simple test
const CONSUMER_KEY = 'bqQ1J3s9hArXGhM5axC9R0WJ3QGWj';
const CONSUMER_SECRET = 'YourConsumerSecret';
const SHORTCODE = '174379';

console.log('Using working credentials:');
console.log('Consumer Key:', CONSUMER_KEY);
console.log('Consumer Secret:', CONSUMER_SECRET);

async function testCurrentSandbox() {
  try {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    console.log('Auth string:', auth.substring(0, 30) + '...');
    
    const response = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Raw response text:', responseText);
    console.log('Response text length:', responseText.length);
    
    if (responseText.length > 0) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ JSON parse successful');
        console.log('Access token:', data.access_token ? 'SUCCESS' : 'FAILED');
        return data.access_token;
      } catch (parseError) {
        console.error('❌ JSON parse failed:', parseError.message);
        return null;
      }
    } else {
      console.error('❌ Empty response from sandbox');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Fetch failed:', error.message);
    return null;
  }
}

testCurrentSandbox().then(token => {
  if (token) {
    console.log('✅ Current sandbox credentials work!');
    console.log('Access token:', token.substring(0, 20) + '...');
  } else {
    console.log('❌ Current sandbox credentials failed');
  }
});
