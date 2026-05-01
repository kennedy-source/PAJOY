// Test updated M-Pesa credentials
console.log('=== TESTING UPDATED M-PESA CREDENTIALS ===');

// Set updated environment variables
process.env.MPESA_CONSUMER_KEY = 'bqQ1J3s9hArXGhM5axC9R0WJ3QGWj';
process.env.MPESA_CONSUMER_SECRET = 'YourConsumerSecret';
process.env.MPESA_SHORTCODE = '174379';
process.env.MPESA_PASSKEY = 'bfb279c960876734623e57d8d7e1df2da1f0709f1f8e367a3c72c97c0323ed7';
process.env.MPESA_CALLBACK_URL = 'https://pajoy.onrender.com/api/mpesa/callback';

console.log('Updated credentials set:');
console.log('Consumer Key:', process.env.MPESA_CONSUMER_KEY ? 'SET' : 'NOT SET');
console.log('Consumer Secret:', process.env.MPESA_CONSUMER_SECRET ? 'SET' : 'NOT SET');
console.log('Short Code:', process.env.MPESA_SHORTCODE);
console.log('Pass Key:', process.env.MPESA_PASSKEY ? 'SET' : 'NOT SET');
console.log('Callback URL:', process.env.MPESA_CALLBACK_URL);

// Test M-Pesa access token
async function testAccessToken() {
  try {
    const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
    console.log('Auth string:', auth.substring(0, 20) + '...');
    
    const response = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });

    const data = await response.json();
    console.log('Access Token Response:', data);
    console.log('Access Token:', data.access_token ? 'SUCCESS' : 'FAILED');
    return data.access_token;
  } catch (error) {
    console.error('Access Token Error:', error.message);
    return null;
  }
}

// Test M-Pesa STK Push
async function testStkPush() {
  const accessToken = await testAccessToken();
  if (!accessToken) {
    console.error('Cannot test STK Push - no access token');
    return;
  }

  const getTimestamp = () => {
    const d = new Date();
    return d.getFullYear() +
      String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0') +
      String(d.getHours()).padStart(2, '0') +
      String(d.getMinutes()).padStart(2, '0') +
      String(d.getSeconds()).padStart(2, '0');
  };

  const formatPhone = (phone) => {
    if (phone.startsWith('0')) return '254' + phone.slice(1);
    if (phone.startsWith('+')) return phone.slice(1);
    return phone;
  };

  const timestamp = getTimestamp();
  const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64');
  const formattedPhone = formatPhone('0712345678');
  const transactionRef = 'PAJOY-TEST-456';

  const payload = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: 10,
    PartyA: formattedPhone,
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: formattedPhone,
    CallBackURL: process.env.MPESA_CALLBACK_URL,
    AccountReference: transactionRef,
    TransactionDesc: 'Test Payment from Updated Credentials',
  };

  console.log('STK Push Payload:', JSON.stringify(payload, null, 2));
  console.log('Password:', password);
  console.log('Timestamp:', timestamp);
  console.log('Formatted Phone:', formattedPhone);

  try {
    const response = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('STK Push Response:', JSON.stringify(data, null, 2));
    
    if (data.ResponseCode === '0') {
      console.log('✅ STK Push sent successfully!');
      console.log('MerchantRequestID:', data.MerchantRequestID);
      console.log('CheckoutRequestID:', data.CheckoutRequestID);
      console.log('CustomerMessage:', data.CustomerMessage);
    } else {
      console.log('❌ STK Push failed!');
      console.log('Error:', data);
    }
  } catch (error) {
    console.error('STK Push Error:', error.message);
  }
}

// Run tests
console.log('=== RUNNING UPDATED CREDENTIALS TEST ===');
testAccessToken().then(() => {
  testStkPush();
});
