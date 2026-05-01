// Debug M-Pesa authentication step by step
console.log('=== M-PESA AUTH DEBUG TEST ===');

// Known working sandbox credentials
const CONSUMER_KEY = 'bqQ1J3s9hArXGhM5axC9R0WJ3QGWj';
const CONSUMER_SECRET = 'YourConsumerSecret';
const SHORTCODE = '174379';

console.log('Step 1: Testing basic auth string creation');
const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
console.log('Auth string length:', auth.length);
console.log('Auth string preview:', auth.substring(0, 30) + '...');

console.log('\nStep 2: Testing fetch request');
async function testFetch() {
  try {
    console.log('Making request to: https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials');
    
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
    
    // Try to parse as JSON
    try {
      const data = JSON.parse(responseText);
      console.log('✅ JSON parse successful');
      console.log('Access token:', data.access_token ? 'SUCCESS' : 'FAILED');
      return data.access_token;
    } catch (parseError) {
      console.error('❌ JSON parse failed:', parseError.message);
      console.error('Response might be HTML or malformed');
      return null;
    }
    
  } catch (fetchError) {
    console.error('❌ Fetch failed:', fetchError.message);
    return null;
  }
}

testFetch();
