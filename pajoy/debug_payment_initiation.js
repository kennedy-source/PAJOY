const axios = require('axios');

async function debugPaymentInitiation() {
  console.log('🔍 Debugging Payment Initiation Error');
  
  try {
    const paymentData = {
      amount: 1500,
      phone: '254712345678',
      email: 'test@example.com',
      customerName: 'Test Customer',
      description: 'Test Payment'
    };

    console.log('📤 Sending payment data:', JSON.stringify(paymentData, null, 2));
    
    const response = await axios.post('http://127.0.0.1:5179/api/payments/pesapal/initiate', paymentData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });

    console.log('✅ Payment initiation successful:', response.data);
    
  } catch (error) {
    console.log('❌ Payment initiation failed:');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Response Data:', error.response?.data);
    console.log('Headers:', error.response?.headers);
    
    if (error.response?.data?.error) {
      console.log('Error Details:', error.response.data.error);
    }
    
    if (error.response?.data?.details) {
      console.log('Error Details:', error.response.data.details);
    }
  }
}

debugPaymentInitiation();
