const CONSUMER_KEY = 'bqQ1J3s9hArXGhM5axC9R0WJ3QGWj';
const CONSUMER_SECRET = 'YourConsumerSecret';

const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
console.log('Testing M-Pesa authentication...');
console.log('Auth string:', auth);

fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
  method: 'GET',
  headers: {
    'Authorization': `Basic ${auth}`,
  },
})
.then(response => {
  console.log('Response status:', response.status);
  return response.text();
})
.then(text => {
  console.log('Response text:', text);
  try {
    const data = JSON.parse(text);
    console.log('✅ Access token:', data.access_token ? 'SUCCESS' : 'FAILED');
  } catch (e) {
    console.log('❌ JSON parse error:', e.message);
  }
})
.catch(error => {
  console.error('❌ Auth error:', error.message);
});
