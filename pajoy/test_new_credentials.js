// Test the new M-Pesa credentials
console.log('=== TESTING NEW M-PESA CREDENTIALS ===');

// Set new environment variables
process.env.MPESA_CONSUMER_KEY = 'SbCazXNhMDF0q3UuGhM5axC9R0WJ3QGWj';
process.env.MPESA_CONSUMER_SECRET = 'qHgWOSl9Jk8QbM5qNjRHZl8nT6rMmN3d4Q';
process.env.MPESA_SHORTCODE = '174379';
process.env.MPESA_PASSKEY = 'bfb279c960876734623e57d8d7e1df2da1f0709f1f8e367a3c72c97c0323ed7';
process.env.MPESA_CALLBACK_URL = 'https://pajoy.onrender.com/api/mpesa/callback';

console.log('New credentials set:');
console.log('Consumer Key:', process.env.MPESA_CONSUMER_KEY ? 'SET' : 'NOT SET');
console.log('Consumer Secret:', process.env.MPESA_CONSUMER_SECRET ? 'SET' : 'NOT SET');
console.log('Short Code:', process.env.MPESA_SHORTCODE);
console.log('Pass Key:', process.env.MPESA_PASSKEY ? 'SET' : 'NOT SET');
console.log('Callback URL:', process.env.MPESA_CALLBACK_URL);

// Test M-Pesa access token
async function testNewCredentials() {
  try {
    const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
    console.log('Auth string:', auth.substring(0, 30) + '...');
    
    const response = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });

    const responseText = await response.text();
    console.log('Raw Response:', responseText);
    console.log('Response status:', response.status);
    
    if (responseText.length > 0) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ JSON parse successful');
        console.log('Access Token:', data.access_token ? 'SUCCESS' : 'FAILED');
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

// Run test
console.log('=== RUNNING NEW CREDENTIALS TEST ===');
testNewCredentials().then(token => {
  if (token) {
    console.log('✅ New credentials work!');
    console.log('Access token:', token.substring(0, 20) + '...');
  } else {
    console.log('❌ New credentials failed');
  }
});
