const router = require('express').Router();

// M-Pesa credentials - in production, use environment variables
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || 'Ua5uqpyhbrTGNZfArQ75hclSr3h6USkmAi0GAynBPFTjeRt7';
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || 'S7AWKxpj1N3qiAMYvPXPurAO6TDGTDdH6ZlnCct7NA5USH6fasbz4bqMSNBKYECA';
const SHORTCODE = process.env.MPESA_SHORTCODE || 'your_shortcode';
const PASSKEY = process.env.MPESA_PASSKEY || 'your_passkey';
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || 'https://pajoy.onrender.com/api/mpesa/callback';

// Get access token
async function getAccessToken() {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  const response = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`,
    },
  });
  const data = await response.json();
  return data.access_token;
}

// STK Push
router.post('/stkpush', async (req, res) => {
  const { phone, amount } = req.body;
  if (!phone || !amount) return res.status(400).json({ error: 'Phone and amount required' });

  try {
    const accessToken = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

    const payload = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: CALLBACK_URL,
      AccountReference: 'PAJOY Payment',
      TransactionDesc: 'Payment for goods',
    };

    const response = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Callback handler
router.post('/callback', (req, res) => {
  const callbackData = req.body;
  console.log('M-Pesa Callback:', callbackData);
  // Handle the callback data, e.g., update payment status
  res.json({ ok: true });
});

module.exports = router;