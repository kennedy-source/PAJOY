const express = require('express');
const router = express.Router();
const pesapalService = require('../services/pesapalService');
const db = require('../db');
const { v4: uuid } = require('uuid');

/**
 * Health check for payment service
 */
router.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'payments',
    pesapal: !!pesapalService.consumerKey,
    timestamp: new Date().toISOString()
  });
});

/**
 * Initiate Pesapal payment
 */
router.post('/pesapal/initiate', async (req, res) => {
  try {
    const {
      amount,
      phone,
      email,
      customerName,
      orderId: customOrderId,
      description,
      billingAddress,
      billingCity,
      billingState,
      billingZipcode,
      billingCountry
    } = req.body;

    // Validate input
    const validationErrors = pesapalService.validatePaymentData({
      amount,
      phone,
      email
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
    }

    // Generate unique order ID
    const orderId = customOrderId || pesapalService.generateOrderId();
    const merchantReference = orderId;

    // Check for duplicate order
    const existingPayment = db.prepare(`
      SELECT id FROM payments 
      WHERE merchant_reference = ? AND status != 'failed'
    `).get(merchantReference);

    if (existingPayment) {
      return res.status(409).json({
        success: false,
        error: 'Payment already initiated for this order',
        paymentId: existingPayment.id
      });
    }

    // Store payment record
    const paymentId = uuid();
    db.prepare(`
      INSERT INTO payments (
        id, merchant_reference, amount, currency, customer_name, 
        phone, email, status, payment_method, created_at
      ) VALUES (?, ?, ?, 'KES', ?, ?, ?, 'pending', 'pesapal', datetime('now'))
    `).run(
      paymentId, merchantReference, parseFloat(amount), 
      customerName || null, phone || null, email || null
    );

    // Initiate Pesapal payment
    const pesapalResponse = await pesapalService.initiatePayment({
      orderId: merchantReference,
      amount: pesapalService.formatAmount(amount),
      phone,
      email,
      customerName,
      description: description || 'PAJOY Uniforms Purchase',
      billingAddress,
      billingCity,
      billingState,
      billingZipcode,
      billingCountry
    });

    // Update payment with Pesapal details
    db.prepare(`
      UPDATE payments SET 
        order_tracking_id = ?, 
        redirect_url = ?,
        raw_response = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      pesapalResponse.orderTrackingId,
      pesapalResponse.redirectUrl,
      JSON.stringify(pesapalResponse),
      paymentId
    );

    res.json({
      success: true,
      paymentId,
      merchantReference,
      orderTrackingId: pesapalResponse.orderTrackingId,
      redirectUrl: pesapalResponse.redirectUrl,
      status: 'pending',
      supportedMethods: pesapalService.getSupportedMethods()
    });

  } catch (error) {
    console.error("PESAPAL INIT ERROR:", error);
    console.error("Response:", error?.response?.data);
    console.error("Stack:", error?.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate payment',
      message: error.message,
      details: error?.response?.data || null,
      stack: error?.stack || null
    });
  }
});

/**
 * Check payment status
 */
router.get('/pesapal/status/:trackingId', async (req, res) => {
  try {
    const { trackingId } = req.params;

    // Find payment record
    const payment = db.prepare(`
      SELECT * FROM payments WHERE order_tracking_id = ?
    `).get(trackingId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    // Check status from Pesapal
    const statusResponse = await pesapalService.checkPaymentStatus(trackingId);

    // Update payment record
    const newStatus = statusResponse.status.toLowerCase();
    const updateData = {
      status: newStatus,
      payment_method: statusResponse.paymentMethod,
      payment_account: statusResponse.paymentAccount,
      confirmation_code: statusResponse.confirmationCode,
      paid_at: statusResponse.paidDate ? new Date(statusResponse.paidDate).toISOString() : null,
      raw_response: JSON.stringify(statusResponse),
      updated_at: new Date().toISOString()
    };

    db.prepare(`
      UPDATE payments SET 
        status = ?, payment_method = ?, payment_account = ?, 
        confirmation_code = ?, paid_at = ?, raw_response = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(
      newStatus, statusResponse.paymentMethod, statusResponse.paymentAccount,
      statusResponse.confirmationCode, updateData.paid_at, updateData.raw_response, payment.id
    );

    // If payment is completed, update related sale
    if (newStatus === 'completed' && payment.invoice_id) {
      db.prepare(`
        UPDATE sales SET 
          payment_status = 'paid', 
          paid_at = datetime('now'),
          updated_at = datetime('now')
        WHERE id = ?
      `).run(payment.invoice_id);
    }

    res.json({
      success: true,
      paymentId: payment.id,
      merchantReference: payment.merchant_reference,
      status: newStatus,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: statusResponse.paymentMethod,
      confirmationCode: statusResponse.confirmationCode,
      paidAt: updateData.paid_at,
      createdAt: payment.created_at
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check payment status',
      message: error.message
    });
  }
});

/**
 * Pesapal callback handler
 */
router.get('/callback', (req, res) => {
  const { orderTrackingId, reference, payment_method, payment_account, confirmation_code } = req.query;

  console.log('Pesapal callback received:', { orderTrackingId, reference, payment_method });

  // Find payment record
  const payment = db.prepare(`
    SELECT * FROM payments WHERE order_tracking_id = ?
  `).get(orderTrackingId);

  if (!payment) {
    console.error('Payment not found for tracking ID:', orderTrackingId);
    return res.status(404).json({
      success: false,
      error: 'Payment not found'
    });
  }

  // Update payment record
  db.prepare(`
    UPDATE payments SET 
      status = 'completed',
      payment_method = ?,
      payment_account = ?,
      confirmation_code = ?,
      paid_at = datetime('now'),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(payment_method, payment_account, confirmation_code, payment.id);

  // Update related sale
  if (payment.invoice_id) {
    db.prepare(`
      UPDATE sales SET 
        payment_status = 'paid', 
        paid_at = datetime('now'),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(payment.invoice_id);
  }

  // Redirect to success page
  res.redirect(`${process.env.ELECTRON_RENDERER_URL || 'http://localhost:5173'}/payment/success?trackingId=${orderTrackingId}`);
});

/**
 * Pesapal webhook handler
 */
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-pesapal-signature'];
    const payload = req.body;

    // Verify webhook signature
    if (!pesapalService.verifyWebhookSignature(payload, signature)) {
      console.error('Invalid webhook signature');
      return res.status(401).json({
        success: false,
        error: 'Invalid signature'
      });
    }

    const { orderTrackingId, status, payment_method, payment_account, confirmation_code } = payload;

    // Find payment record
    const payment = db.prepare(`
      SELECT * FROM payments WHERE order_tracking_id = ?
    `).get(orderTrackingId);

    if (!payment) {
      console.error('Payment not found for webhook:', orderTrackingId);
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    // Prevent duplicate processing
    if (payment.status === 'completed') {
      return res.json({
        success: true,
        message: 'Payment already processed'
      });
    }

    // Update payment record
    db.prepare(`
      UPDATE payments SET 
        status = ?,
        payment_method = ?,
        payment_account = ?,
        confirmation_code = ?,
        paid_at = datetime('now'),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(status.toLowerCase(), payment_method, payment_account, confirmation_code, payment.id);

    // Update related sale
    if (payment.invoice_id && status.toLowerCase() === 'completed') {
      db.prepare(`
        UPDATE sales SET 
          payment_status = 'paid', 
          paid_at = datetime('now'),
          updated_at = datetime('now')
        WHERE id = ?
      `).run(payment.invoice_id);
    }

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process webhook'
    });
  }
});

/**
 * Get payment history
 */
router.get('/history', (req, res) => {
  try {
    const { page = 1, limit = 50, status, method, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    const params = [];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (method) {
      whereClause += ' AND payment_method = ?';
      params.push(method);
    }

    if (startDate) {
      whereClause += ' AND created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND created_at <= ?';
      params.push(endDate);
    }

    // Get payments
    const payments = db.prepare(`
      SELECT * FROM payments 
      WHERE ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), offset);

    // Get total count
    const totalCount = db.prepare(`
      SELECT COUNT(*) as count FROM payments WHERE ${whereClause}
    `).get(...params).count;

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment history'
    });
  }
});

/**
 * Get payment details
 */
router.get('/:paymentId', (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = db.prepare(`
      SELECT * FROM payments WHERE id = ?
    `).get(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment details'
    });
  }
});

module.exports = router;
