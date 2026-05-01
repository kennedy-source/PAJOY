const router = require('express').Router();
const db = require('../db');

// Pesapal credentials - Production ready (use environment variables in production)
const CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;
const SHORTCODE = process.env.PESAPAL_SHORTCODE;
const PASSKEY = process.env.PESAPAL_PASSKEY;
const CALLBACK_URL = process.env.PESAPAL_CALLBACK_URL || 'https://pajoy.onrender.com/api/pesapal/callback';

// Validate required credentials for production
if (!CONSUMER_KEY || !CONSUMER_SECRET || !SHORTCODE || !PASSKEY) {
  console.error(' PESAPAL PRODUCTION ERROR: Missing required credentials');
  console.error('Required environment variables:');
  console.error('- PESAPAL_CONSUMER_KEY');
  console.error('- PESAPAL_CONSUMER_SECRET');
  console.error('- PESAPAL_SHORTCODE');
  console.error('- PESAPAL_PASSKEY');
  console.error('- PESAPAL_CALLBACK_URL (optional)');
  console.error('');
  console.error(' SETUP INSTRUCTIONS:');
  console.error('1. Get live credentials from Pesapal Portal');
  console.error('2. Set environment variables in your deployment');
  console.error('3. For local testing, set sandbox credentials:');
  console.error('   PESAPAL_CONSUMER_KEY=SbCazXNhMDF0q3UuGhM5axC9R0WJ3QGWj');
  console.error('   PESAPAL_CONSUMER_SECRET=qHgWOSl9Jk8QbM5qNjRHZl8nT6rMmN3d4Q');
  console.error('   PESAPAL_SHORTCODE=174379');
  console.error('   PESAPAL_PASSKEY=bfb279c960876734623e57d8d7e1df2da1f0709f1f8e367a3c72c97c0323ed7');
  console.error('   PESAPAL_CALLBACK_URL=https://pajoy.onrender.com/api/pesapal/callback');
  console.error('');
  console.error(' DEPLOYMENT:');
  console.error('- Render.com (or your hosting provider)');
  console.error('- Set environment variables in dashboard');
  console.error('- Restart application');
  console.error('');
  console.error(' TESTING:');
  console.error('- Use real M-Pesa number for testing');
  console.error('- Small amounts (KES 10, 50, 100)');
  console.error('- Check logs for transaction status');
}

// Helper functions
function getTimestamp() {
  const d = new Date();
  return d.getFullYear() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0') +
    String(d.getHours()).padStart(2, '0') +
    String(d.getMinutes()).padStart(2, '0') +
    String(d.getSeconds()).padStart(2, '0');
}

function formatPhone(phone) {
  if (phone.startsWith('0')) return '254' + phone.slice(1);
  if (phone.startsWith('+')) return phone.slice(1);
  return phone;
}

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

// STK Push with order tracking
router.post('/stkpush', async (req, res) => {
  const { phone, amount, order_id, customer_name } = req.body;
  if (!phone || !amount) return res.status(400).json({ error: 'Phone and amount required' });

  try {
    const accessToken = await getAccessToken();
    const timestamp = getTimestamp();
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');
    const formattedPhone = formatPhone(phone);

    // Generate unique transaction reference
    const transactionRef = order_id ? `PAJOY-${order_id}` : `PAJOY-${Date.now()}`;

    const payload = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: SHORTCODE, // Use SHORTCODE for STK Push (NOT Till number)
      PhoneNumber: formattedPhone,
      CallBackURL: CALLBACK_URL,
      AccountReference: transactionRef,
      TransactionDesc: customer_name ? `Payment from ${customer_name}` : 'PAJOY Purchase',
    };

    // Log payment initiation
    console.log(`Initiating Pesapal payment: ${transactionRef} - KES ${amount} from ${formattedPhone}`);
    console.log('Pesapal Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('Pesapal Response:', JSON.stringify(data, null, 2));
    
    // Store transaction request for tracking
    if (data.ResponseCode === '0') {
      try {
        db.prepare(`INSERT INTO pesapal_transactions 
          (merchant_request_id, checkout_request_id, phone, amount, order_id, customer_name, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, 'PENDING', datetime('now')`)
          .run(data.MerchantRequestID, data.CheckoutRequestID, formattedPhone, amount, order_id || null, customer_name || null);
        console.log(`Payment request stored: ${data.MerchantRequestID}`);
      } catch (dbError) {
        console.error('Failed to store transaction:', dbError.message);
      }
    }

    res.json({
      ...data,
      transactionRef,
      message: data.ResponseCode === '0' ? 'Payment request sent successfully' : 'Payment request failed'
    });
  } catch (error) {
    console.error('STK Push error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Enhanced callback handler for payment confirmation
router.post('/callback', async (req, res) => {
  const callbackData = req.body;
  console.log('Pesapal Callback Received:', callbackData);

  try {
    const { Body } = callbackData;
    const { stkCallback } = Body;

    if (stkCallback && stkCallback.ResultCode === '0') {
      const { MerchantRequestID, CheckoutRequestID, ResultDesc, CallbackMetadata } = stkCallback;
      
      // Parse metadata array correctly
      const getValue = (name) => {
        const item = CallbackMetadata.Item.find(i => i.Name === name);
        return item ? item.Value : null;
      };

      const Amount = getValue('Amount');
      const MpesaReceiptNumber = getValue('MpesaReceiptNumber');
      const TransactionDate = getValue('TransactionDate');
      const PhoneNumber = getValue('PhoneNumber');

      console.log(`Payment Successful: ${MpesaReceiptNumber} - KES ${Amount} from ${PhoneNumber}`);

      // Update transaction status in database
      try {
        const updateResult = db.prepare(`
          UPDATE pesapal_transactions 
          SET status = 'COMPLETED', 
              mpesa_receipt = ?, 
              result_desc = ?, 
              transaction_date = ?, 
              completed_at = datetime('now')
          WHERE merchant_request_id = ?
        `).run(MpesaReceiptNumber, ResultDesc, TransactionDate, MerchantRequestID);

        console.log(`Transaction updated: ${updateResult.changes} rows affected`);

        // Get transaction details for order processing
        const transaction = db.prepare(`
          SELECT * FROM pesapal_transactions 
          WHERE merchant_request_id = ?
        `).get(MerchantRequestID);

        if (transaction && transaction.order_id) {
          // Update order status if linked to an order
          const orderUpdate = db.prepare(`
            UPDATE sales 
            SET payment_status = 'PAID', 
                mpesa_receipt = ?, 
                paid_at = datetime('now')
            WHERE id = ?
          `).run(MpesaReceiptNumber, transaction.order_id);
          
          console.log(`Order ${transaction.order_id} marked as paid`);
        }

        // Send comprehensive response
        res.json({
          success: true,
          message: 'Payment processed successfully',
          paymentDetails: {
            receiptNumber: MpesaReceiptNumber,
            amount: Amount,
            phoneNumber: PhoneNumber,
            transactionDate: TransactionDate,
            merchantRequestID: MerchantRequestID,
            checkoutRequestID: CheckoutRequestID,
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

    } else if (stkCallback && stkCallback.ResultCode !== '0') {
      // Handle failed payment
      const { MerchantRequestID, ResultDesc } = stkCallback;
      
      try {
        db.prepare(`
          UPDATE pesapal_transactions 
          SET status = 'FAILED', result_desc = ?, completed_at = datetime('now')
          WHERE merchant_request_id = ?
        `).run(ResultDesc, MerchantRequestID);

        res.json({
          success: false,
          message: 'Payment failed',
          error: ResultDesc,
          merchantRequestID: MerchantRequestID
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
      SELECT * FROM mpesa_transactions 
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
        checkoutRequestId: transaction.checkout_request_id,
        phone: transaction.phone,
        amount: transaction.amount,
        orderId: transaction.order_id,
        customerName: transaction.customer_name,
        status: transaction.status,
        mpesaReceipt: transaction.mpesa_receipt,
        resultDesc: transaction.result_desc,
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
      SELECT * FROM mpesa_transactions 
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
        status: t.status,
        mpesaReceipt: t.mpesa_receipt,
        resultDesc: t.result_desc,
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
      FROM mpesa_transactions t
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
        status: t.status,
        mpesaReceipt: t.mpesa_receipt,
        resultDesc: t.result_desc,
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