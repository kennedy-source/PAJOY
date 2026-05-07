const router = require('express').Router();
const db = require('../db');

// Pesapal credentials - Production ready (use environment variables in production)
const CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;
const CALLBACK_URL = process.env.PESAPAL_CALLBACK_URL || `http://localhost:${process.env.PORT || 3000}/api/pesapal/callback`;

// Debug: Log environment variables (remove in production)
console.log('🔍 DEBUG - Environment variables loaded:');
console.log('PESAPAL_CONSUMER_KEY:', CONSUMER_KEY ? '✓ Found' : '✗ Missing');
console.log('PESAPAL_CONSUMER_SECRET:', CONSUMER_SECRET ? '✓ Found' : '✗ Missing');
console.log('PESAPAL_CALLBACK_URL:', CALLBACK_URL);

// Validate required credentials for production
if (!CONSUMER_KEY || !CONSUMER_SECRET) {
  console.error('❌ PESAPAL PRODUCTION ERROR: Missing required credentials');
  console.error('Required environment variables:');
  console.error('- PESAPAL_CONSUMER_KEY');
  console.error('- PESAPAL_CONSUMER_SECRET');
  console.error('- PESAPAL_CALLBACK_URL (optional)');
  console.error('');
  console.error('🔧 SETUP INSTRUCTIONS FOR TOMORROW:');
  console.error('1. Go to https://pesapal.com and get PRODUCTION credentials');
  console.error('2. Replace the placeholder values in .env file');
  console.error('3. Set PESAPAL_CALLBACK_URL to your public domain/IP');
  console.error('4. For local PC deployment, use ngrok: ngrok http 4000');
  console.error('5. Update callback URL with ngrok URL');
  console.error('');
  console.error('🚀 DEPLOYMENT CHECKLIST:');
  console.error('- ✅ Get production Pesapal credentials');
  console.error('- ✅ Update .env with real credentials');
  console.error('- ✅ Set up public callback URL (ngrok/domain)');
  console.error('- ✅ Test with small M-Pesa amount');
  console.error('- ✅ Ensure port 4000 is accessible');
}

// Helper functions
function getTimestamp() {
  return new Date().toISOString();
}

// Get Pesapal access token
async function getPesapalToken() {
  try {
    console.log('🔐 Attempting Pesapal authentication...');
    console.log('Consumer Key:', CONSUMER_KEY ? '✓ Present' : '✗ Missing');
    console.log('Consumer Secret:', CONSUMER_SECRET ? '✓ Present' : '✗ Missing');

    // Try endpoints based on environment
    const isProduction = process.env.NODE_ENV === 'production';
    const endpoints = isProduction 
      ? [
          'https://pay.pesapal.com/v3/api/GetAccessToken',  // Production first
          'https://cybertest.pesapal.com/v3/api/GetAccessToken'  // Sandbox fallback
        ]
      : [
          'https://cybertest.pesapal.com/v3/api/GetAccessToken',  // Sandbox first for development
          'https://pay.pesapal.com/v3/api/GetAccessToken'
        ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            consumer_key: CONSUMER_KEY,
            consumer_secret: CONSUMER_SECRET
          })
        });

        console.log('Response status:', response.status);
        
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        if (response.status === 200 && responseText) {
          try {
            const data = JSON.parse(responseText);
            console.log('Parsed response:', data);
            
            if (data.token) {
              console.log('✅ Pesapal authentication successful');
              return data.token;
            } else {
              console.log('No token in response, trying next endpoint...');
              continue;
            }
          } catch (parseError) {
            console.log('Failed to parse JSON, trying next endpoint...');
            continue;
          }
        } else {
          console.log(`Endpoint returned status ${response.status}, trying next...`);
          continue;
        }
      } catch (error) {
        console.log(`Endpoint failed: ${error.message}, trying next...`);
        continue;
      }
    }

    // Fallback handling based on environment
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
      console.error('❌ PRODUCTION PESAPAL ERROR: All endpoints failed!');
      console.error('This means your production credentials are invalid or account not activated.');
      console.error('Contact Pesapal support to activate your API access.');
      throw new Error('Production Pesapal API authentication failed');
    } else {
      console.log('⚠️ Development mode: Falling back to mock implementation...');
      console.log('To use real Pesapal API:');
      console.log('1. Set NODE_ENV=production in .env');
      console.log('2. Add valid production credentials');
      console.log('3. Ensure your Pesapal account is API-activated');
      
      return 'mock_token_' + Date.now();
    }
    
  } catch (error) {
    console.error('Pesapal token error:', error.message);
    throw error;
  }
}

// Submit Pesapal payment
router.post('/submit', async (req, res) => {
  const { phone, amount, order_id, customer_name, email } = req.body;
  if (!phone || !amount) return res.status(400).json({ error: 'Phone and amount required' });

  try {
    const token = await getPesapalToken();
    const timestamp = getTimestamp();
    
    // Generate unique transaction reference
    const transactionRef = order_id ? `PAJOY-${order_id}` : `PAJOY-${Date.now()}`;

    const payload = {
      id: transactionRef,
      currency: 'KES',
      amount: amount,
      description: customer_name ? `Payment from ${customer_name}` : 'PAJOY Purchase',
      callback_url: CALLBACK_URL,
      redirect_mode: '',
      notification_id: '',
      branch: '',
      email_address: email || '',
      phone_number: phone,
      billing_address: '',
      billing_city: '',
      billing_state: '',
      billing_zipcode: '',
      billing_country: ''
    };

    // Log payment initiation
    console.log(`Initiating Pesapal payment: ${transactionRef} - KES ${amount} from ${phone}`);
    console.log('Pesapal Payload:', JSON.stringify(payload, null, 2));

    // Real Pesapal payment submission
    console.log('📱 Submitting Pesapal payment...');
    console.log('Pesapal Payload:', JSON.stringify(payload, null, 2));

    // Try endpoints based on environment
    const isProduction = process.env.NODE_ENV === 'production';
    const endpoints = isProduction
      ? [
          'https://pay.pesapal.com/v3/api/PostTransaction',  // Production first
          'https://cybertest.pesapal.com/v3/api/PostTransaction'  // Sandbox fallback
        ]
      : [
          'https://cybertest.pesapal.com/v3/api/PostTransaction',  // Sandbox first for development
          'https://pay.pesapal.com/v3/api/PostTransaction'
        ];

    let data = null;
    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying payment endpoint: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        console.log('Payment response status:', response.status);
        
        const responseText = await response.text();
        console.log('Payment response text:', responseText);
        
        if (response.status === 200 && responseText) {
          try {
            data = JSON.parse(responseText);
            console.log('Parsed payment response:', data);
            
            if (data.status === '200' || data.order_tracking_id) {
              console.log('✅ Pesapal payment submission successful');
              break;
            } else {
              console.log('Payment not successful, trying next endpoint...');
              continue;
            }
          } catch (parseError) {
            console.log('Failed to parse JSON, trying next endpoint...');
            lastError = parseError;
            continue;
          }
        } else {
          console.log(`Payment endpoint returned status ${response.status}, trying next...`);
          lastError = new Error(`HTTP ${response.status}: ${responseText}`);
          continue;
        }
      } catch (error) {
        console.log(`Payment endpoint failed: ${error.message}, trying next...`);
        lastError = error;
        continue;
      }
    }

    if (!data) {
      // Fallback handling based on environment
      const isProduction = process.env.NODE_ENV === 'production';
      if (isProduction) {
        console.error('❌ PRODUCTION PESAPAL ERROR: Payment submission failed on all endpoints!');
        console.error('This means your production credentials are invalid or account not activated.');
        console.error('Contact Pesapal support to activate your API access.');
        throw new Error('Production Pesapal payment submission failed');
      } else {
        console.log('⚠️ Development mode: Falling back to mock payment for testing...');
        console.log('To use real Pesapal API:');
        console.log('1. Set NODE_ENV=production in .env');
        console.log('2. Add valid production credentials');
        console.log('3. Ensure your Pesapal account is API-activated');
        
        data = {
          status: '200',
          order_tracking_id: 'mock_order_' + Date.now(),
          redirect_url: 'https://mock.pesapal.com/redirect/' + Date.now(),
          message: 'Payment request submitted successfully (mock)'
        };
      }
    }
    
    console.log('Pesapal Response:', JSON.stringify(data, null, 2));
    
    // Store transaction request for tracking
    if (data.status === '200' || data.status === 'pending') {
      try {
        db.prepare(`INSERT INTO pesapal_transactions 
          (merchant_request_id, phone, amount, order_id, customer_name, email, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, 'PENDING', datetime('now'))`)
          .run(transactionRef, phone, amount, order_id || null, customer_name || null, email || null);
        console.log(`Payment request stored: ${transactionRef}`);
      } catch (dbError) {
        console.error('Failed to store transaction:', dbError.message);
      }
    }

    res.json({
      ...data,
      transactionRef,
      message: data.status === '200' || data.status === 'pending' ? 'Payment request sent successfully' : 'Payment request failed'
    });
  } catch (error) {
    console.error('Pesapal payment error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET handler for Pesapal callback (for testing and verification)
// Enhanced callback handler for payment confirmation
router.get('/callback', async (req, res) => {
  const callbackData = req.query;
  console.log('📡 Pesapal callback accessed via GET request');
  console.log('Query parameters:', callbackData);

  try {
    const {
      pesapal_transaction_id,
      transaction_tracking_id,
      payment_method,
      payment_status,
      payment_account,
      merchant_reference,
      amount,
      created_date,
      payment_description
    } = callbackData;

    if (payment_status === 'completed' || payment_status === 'COMPLETED') {
      console.log(`Payment Successful: ${pesapal_transaction_id} - KES ${amount} from ${payment_account}`);

      // Update transaction status in database
      try {
        const updateResult = db.prepare(`
          UPDATE pesapal_transactions
          SET status = 'COMPLETED',
              pesapal_receipt = ?,
              payment_method = ?,
              payment_account = ?,
              amount = ?,
              transaction_date = ?,
              completed_at = datetime('now')
          WHERE merchant_request_id = ?
        `).run(pesapal_transaction_id, payment_method, payment_account, amount, created_date, merchant_reference);

        console.log(`Transaction updated: ${updateResult.changes} rows affected`);

        // Get transaction details for order processing
        const transaction = db.prepare(`
          SELECT * FROM pesapal_transactions
          WHERE merchant_request_id = ?
        `).get(merchant_reference);

        if (transaction && transaction.order_id) {
          // Update order status if linked to an order
          const orderUpdate = db.prepare(`
            UPDATE sales
            SET payment_status = 'PAID',
                pesapal_receipt = ?,
                paid_at = datetime('now')
            WHERE id = ?
          `).run(pesapal_transaction_id, transaction.order_id);

          console.log(`Order ${transaction.order_id} marked as paid`);
        }

        // Send success response
        res.json({
          success: true,
          message: 'Payment processed successfully',
          paymentDetails: {
            receiptNumber: pesapal_transaction_id,
            trackingId: transaction_tracking_id,
            amount: amount,
            paymentMethod: payment_method,
            paymentAccount: payment_account,
            merchantReference: merchant_reference,
            transactionDate: created_date,
            description: payment_description,
            orderId: transaction?.order_id || null,
            customerName: transaction?.customer_name || null
          }
        });

      } catch (dbError) {
        console.error('Database update error:', dbError.message);
        res.status(500).json({
          success: false,
          error: 'Database update failed',
          message: dbError.message
        });
      }

    } else if (payment_status === 'failed' || payment_status === 'cancelled') {
      console.log(`Payment Failed/Cancelled: ${merchant_reference}`);

      // Update transaction status to failed
      db.prepare(`
        UPDATE pesapal_transactions
        SET status = 'FAILED',
            completed_at = datetime('now')
        WHERE merchant_request_id = ?
      `).run(merchant_reference);

      res.json({
        success: false,
        message: 'Payment was cancelled or failed',
        merchantReference: merchant_reference
      });

    } else {
      // Payment is still pending
      console.log(`Payment Pending: ${merchant_reference}`);
      res.json({
        success: true,
        message: 'Payment is still being processed',
        status: 'pending',
        merchantReference: merchant_reference
      });
    }

  } catch (error) {
    console.error('Callback processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Callback processing failed',
      message: error.message
    });
  }
});

// Enhanced callback handler for payment confirmation
router.post('/callback', async (req, res) => {
  const callbackData = req.body;
  console.log('Pesapal Callback Received:', callbackData);

  try {
    const { 
      pesapal_transaction_id, 
      transaction_tracking_id, 
      payment_method, 
      payment_status, 
      payment_account, 
      merchant_reference,
      amount,
      created_date,
      payment_description
    } = callbackData;

    if (payment_status === 'completed') {
      console.log(`Payment Successful: ${pesapal_transaction_id} - KES ${amount} from ${payment_account}`);

      // Update transaction status in database
      try {
        const updateResult = db.prepare(`
          UPDATE pesapal_transactions 
          SET status = 'COMPLETED', 
              pesapal_receipt = ?, 
              payment_method = ?, 
              payment_account = ?, 
              amount = ?, 
              transaction_date = ?, 
              completed_at = datetime('now')
          WHERE merchant_request_id = ?
        `).run(pesapal_transaction_id, payment_method, payment_account, amount, created_date, merchant_reference);

        console.log(`Transaction updated: ${updateResult.changes} rows affected`);

        // Get transaction details for order processing
        const transaction = db.prepare(`
          SELECT * FROM pesapal_transactions 
          WHERE merchant_request_id = ?
        `).get(merchant_reference);

        if (transaction && transaction.order_id) {
          // Update order status if linked to an order
          const orderUpdate = db.prepare(`
            UPDATE sales 
            SET payment_status = 'PAID', 
                pesapal_receipt = ?, 
                paid_at = datetime('now')
            WHERE id = ?
          `).run(pesapal_transaction_id, transaction.order_id);
          
          console.log(`Order ${transaction.order_id} marked as paid`);
        }

        // Send comprehensive response
        res.json({
          success: true,
          message: 'Payment processed successfully',
          paymentDetails: {
            receiptNumber: pesapal_transaction_id,
            trackingId: transaction_tracking_id,
            amount: amount,
            paymentMethod: payment_method,
            paymentAccount: payment_account,
            merchantReference: merchant_reference,
            transactionDate: created_date,
            description: payment_description,
            orderId: transaction?.order_id || null,
            customerName: transaction?.customer_name || null
          }
        });

      } catch (dbError) {
        console.error('Database update error:', dbError.message);
        res.status(500).json({ 
          success: false, 
          error: 'Failed to update payment records',
          details: dbError.message 
        });
      }

    } else if (payment_status === 'failed') {
      // Handle failed payment
      try {
        db.prepare(`
          UPDATE pesapal_transactions 
          SET status = 'FAILED', completed_at = datetime('now')
          WHERE merchant_request_id = ?
        `).run(merchant_reference);

        res.json({
          success: false,
          message: 'Payment failed',
          merchantReference: merchant_reference
        });
      } catch (dbError) {
        res.status(500).json({ 
          success: false, 
          error: 'Failed to update failed payment',
          details: dbError.message 
        });
      }

    } else {
      // Handle other callback types
      res.json({ 
        success: true, 
        message: 'Callback received',
        callbackData: callbackData 
      });
    }

  } catch (error) {
    console.error('Callback processing error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process callback',
      details: error.message 
    });
  }
});

// Check transaction status
router.get('/status/:merchantRequestId', async (req, res) => {
  const { merchantRequestId } = req.params;
  
  try {
    const transaction = db.prepare(`
      SELECT * FROM pesapal_transactions 
        WHERE merchant_request_id = ?
    `).get(merchantRequestId);
    
    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        error: 'Transaction not found' 
      });
    }

    res.json({
      success: true,
      transaction: {
        id: transaction.id,
        merchantRequestId: transaction.merchant_request_id,
        phone: transaction.phone,
        amount: transaction.amount,
        orderId: transaction.order_id,
        customerName: transaction.customer_name,
        email: transaction.email,
        status: transaction.status,
        pesapalReceipt: transaction.pesapal_receipt,
        paymentMethod: transaction.payment_method,
        paymentAccount: transaction.payment_account,
        transactionDate: transaction.transaction_date,
        createdAt: transaction.created_at,
        completedAt: transaction.completed_at
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check transaction status',
      details: error.message 
    });
  }
});

// Get payment history for an order
router.get('/order/:orderId', async (req, res) => {
  const { orderId } = req.params;
  
  try {
    const transactions = db.prepare(`
      SELECT * FROM pesapal_transactions 
        WHERE order_id = ? 
        ORDER BY created_at DESC
    `).all(orderId);

    res.json({
      success: true,
      orderId,
      transactions: transactions.map(t => ({
        id: t.id,
        merchantRequestId: t.merchant_request_id,
        phone: t.phone,
        amount: t.amount,
        customerName: t.customer_name,
        email: t.email,
        status: t.status,
        pesapalReceipt: t.pesapal_receipt,
        paymentMethod: t.payment_method,
        paymentAccount: t.payment_account,
        transactionDate: t.transaction_date,
        createdAt: t.created_at,
        completedAt: t.completed_at
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get payment history',
      details: error.message 
    });
  }
});

// Get all transactions (for admin reporting)
router.get('/transactions', async (req, res) => {
  const { page = 1, limit = 50, status } = req.query;
  const offset = (page - 1) * limit;
  
  try {
    let query = `
      SELECT t.*, s.receipt_no 
      FROM pesapal_transactions t
      LEFT JOIN sales s ON t.order_id = s.id
    `;
    let params = [];

    if (status) {
      query += ' WHERE t.status = ?';
      params.push(status);
    }

    query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const transactions = db.prepare(query).all(...params);

    const totalCount = db.prepare(`
      SELECT COUNT(*) as total FROM pesapal_transactions
      ${status ? ' WHERE status = ?' : ''}
    `).get(...(status ? [status] : []));

    res.json({
      success: true,
      transactions: transactions.map(t => ({
        id: t.id,
        merchantRequestId: t.merchant_request_id,
        phone: t.phone,
        amount: t.amount,
        orderId: t.order_id,
        orderReceipt: t.receipt_no,
        customerName: t.customer_name,
        email: t.email,
        status: t.status,
        pesapalReceipt: t.pesapal_receipt,
        paymentMethod: t.payment_method,
        paymentAccount: t.payment_account,
        transactionDate: t.transaction_date,
        createdAt: t.created_at,
        completedAt: t.completed_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount.total,
        pages: Math.ceil(totalCount.total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get transactions',
      details: error.message 
    });
  }
});

module.exports = router;
