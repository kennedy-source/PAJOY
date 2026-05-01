const router = require('express').Router();
const db = require('../db');

// Mock M-Pesa STK Push for testing without sandbox

// Mock M-Pesa STK Push for testing without sandbox
router.post('/stkpush', async (req, res) => {
  const { phone, amount, order_id, customer_name } = req.body;
  if (!phone || !amount) return res.status(400).json({ error: 'Phone and amount required' });

  try {
    const formatPhone = (phone) => {
      if (phone.startsWith('0')) return '254' + phone.slice(1);
      if (phone.startsWith('+')) return phone.slice(1);
      return phone;
    };

    const formattedPhone = formatPhone(phone);
    const transactionRef = order_id ? `PAJOY-${order_id}` : `PAJOY-${Date.now()}`;
    const merchantRequestID = `MOCK-${Date.now()}`;
    const checkoutRequestID = `MOCK-${Date.now()}`;

    console.log(`Mock M-Pesa payment: ${transactionRef} - KES ${amount} from ${formattedPhone}`);

    // Store transaction request for tracking
    try {
      db.prepare(`INSERT INTO mpesa_transactions 
        (merchant_request_id, checkout_request_id, phone, amount, order_id, customer_name, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, 'PENDING', datetime('now'))`)
        .run(merchantRequestID, checkoutRequestID, formattedPhone, amount, order_id || null, customer_name || null);
      console.log(`Mock payment request stored: ${merchantRequestID}`);
    } catch (dbError) {
      console.error('Failed to store transaction:', dbError.message);
    }

    // Simulate successful M-Pesa response
    const mockResponse = {
      ResponseCode: '0',
      ResponseDescription: 'Success',
      MerchantRequestID: merchantRequestID,
      CheckoutRequestID: checkoutRequestID,
      CustomerMessage: 'Success. Request accepted for processing'
    };

    // Simulate callback after 3 seconds
    setTimeout(() => {
      const receiptNumber = `MOCK${Date.now()}`;
      
      try {
        db.prepare(`
          UPDATE mpesa_transactions 
          SET status = 'COMPLETED', 
              mpesa_receipt = ?, 
              result_desc = 'Mock payment successful', 
              transaction_date = datetime('now'),
              completed_at = datetime('now')
          WHERE merchant_request_id = ?
        `).run(receiptNumber, merchantRequestID);

        console.log(`Mock payment completed: ${receiptNumber}`);

        // Update order status if linked
        if (order_id) {
          const orderUpdate = db.prepare(`
            UPDATE sales 
            SET payment_status = 'PAID', 
                mpesa_receipt = ?, 
                paid_at = datetime('now')
            WHERE id = ?
          `).run(receiptNumber, order_id);
          
          console.log(`Mock order ${order_id} marked as paid`);
        }
      } catch (updateError) {
        console.error('Mock update error:', updateError.message);
      }
    }, 3000);

    res.json({
      ...mockResponse,
      transactionRef,
      message: 'Mock payment request sent successfully'
    });

  } catch (error) {
    console.error('Mock STK Push error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Mock callback handler
router.post('/callback', (req, res) => {
  console.log('Mock M-Pesa Callback Received:', req.body);
  res.json({ ok: true });
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

module.exports = router;
