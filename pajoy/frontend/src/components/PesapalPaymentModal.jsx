import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api.js';
import Modal from './Modal.jsx';

const PesapalPaymentModal = ({ 
  isOpen, 
  onClose, 
  amount, 
  customerInfo, 
  onPaymentSuccess,
  onPaymentError 
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [pollingInterval, setPollingInterval] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const iframeRef = useRef(null);

  const paymentMethods = [
    { code: 'MPESA', name: 'M-Pesa', icon: '📱', description: 'Pay with M-Pesa mobile money' },
    { code: 'CARD', name: 'Credit/Debit Card', icon: '💳', description: 'Pay with Visa, Mastercard' },
    { code: 'BANK', name: 'Bank Transfer', icon: '🏦', description: 'Direct bank transfer' },
    { code: 'WALLET', name: 'Mobile Wallet', icon: '👛', description: 'Other mobile wallet services' }
  ];

  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
      setPaymentStatus('timeout');
      setError('Payment session timed out. Please try again.');
    }
  }, [countdown, pollingInterval]);

  const initiatePayment = async () => {
    setLoading(true);
    setError('');
    setPaymentStatus('initiating');

    try {
      const response = await api.post('/api/payments/pesapal/initiate', {
        amount: amount,
        phone: customerInfo.phone,
        email: customerInfo.email,
        customerName: customerInfo.name,
        description: 'PAJOY Uniforms Purchase'
      });

      if (response.success) {
        setPaymentData(response);
        setPaymentStatus('pending');
        setCountdown(300); // 5 minutes timeout
        startPaymentPolling(response.orderTrackingId);
        
        // Load Pesapal payment page in iframe
        if (iframeRef.current) {
          iframeRef.current.src = response.redirectUrl;
        }
      } else {
        throw new Error(response.error || 'Payment initiation failed');
      }
    } catch (err) {
      setError(err.message);
      setPaymentStatus('error');
      onPaymentError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const startPaymentPolling = (trackingId) => {
    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/api/payments/pesapal/status/${trackingId}`);
        
        if (response.success) {
          if (response.status === 'completed') {
            clearInterval(interval);
            setPollingInterval(null);
            setPaymentStatus('success');
            setCountdown(0);
            onPaymentSuccess?.(response);
          } else if (response.status === 'failed') {
            clearInterval(interval);
            setPollingInterval(null);
            setPaymentStatus('failed');
            setError('Payment failed. Please try again.');
            onPaymentError?.(new Error('Payment failed'));
          }
        }
      } catch (err) {
        console.error('Payment status check error:', err);
      }
    }, 3000); // Poll every 3 seconds

    setPollingInterval(interval);
  };

  const retryPayment = () => {
    setPaymentStatus('idle');
    setPaymentData(null);
    setError('');
    setCountdown(0);
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderContent = () => {
    switch (paymentStatus) {
      case 'idle':
        return (
          <div className="pesapal-initiate">
            <h3>Complete Your Payment</h3>
            <div className="payment-amount">
              <span className="amount-label">Amount:</span>
              <span className="amount-value">KES {parseFloat(amount).toLocaleString()}</span>
            </div>
            
            <div className="payment-methods">
              <h4>Choose Payment Method:</h4>
              <div className="methods-grid">
                {paymentMethods.map(method => (
                  <button
                    key={method.code}
                    className={`method-card ${selectedMethod === method.code ? 'selected' : ''}`}
                    onClick={() => setSelectedMethod(method.code)}
                  >
                    <div className="method-icon">{method.icon}</div>
                    <div className="method-info">
                      <div className="method-name">{method.name}</div>
                      <div className="method-desc">{method.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="customer-info">
              <h4>Customer Information:</h4>
              <div className="info-grid">
                <div className="info-item">
                  <label>Name:</label>
                  <span>{customerInfo.name || 'Walk-in Customer'}</span>
                </div>
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{customerInfo.phone || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{customerInfo.email || 'Not provided'}</span>
                </div>
              </div>
            </div>

            <button
              className="btn primary large"
              onClick={initiatePayment}
              disabled={loading || !selectedMethod}
              style={{ width: '100%', padding: '16px' }}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Processing Payment...
                </>
              ) : (
                `Pay KES ${parseFloat(amount).toLocaleString()}`
              )}
            </button>
          </div>
        );

      case 'initiating':
        return (
          <div className="pesapal-loading">
            <div className="loading-animation">
              <div className="spinner large"></div>
            </div>
            <h3>Initiating Payment...</h3>
            <p>Please wait while we connect to Pesapal payment gateway.</p>
          </div>
        );

      case 'pending':
        return (
          <div className="pesapal-pending">
            <div className="payment-header">
              <h3>Payment in Progress</h3>
              <div className="countdown">
                <span className="countdown-label">Time remaining:</span>
                <span className="countdown-time">{formatTime(countdown)}</span>
              </div>
            </div>

            <div className="payment-iframe-container">
              <iframe
                ref={iframeRef}
                src=""
                className="pesapal-iframe"
                title="Pesapal Payment"
                sandbox="allow-same-origin allow-scripts allow-forms allow-top-navigation"
              />
            </div>

            <div className="payment-instructions">
              <h4>Payment Instructions:</h4>
              <ul>
                <li>Complete the payment in the window above</li>
                <li>Do not close this window until payment is complete</li>
                <li>You will be automatically redirected when payment is successful</li>
                <li>If payment fails, you can try again</li>
              </ul>
            </div>

            <div className="payment-actions">
              <button className="btn secondary" onClick={retryPayment}>
                Cancel Payment
              </button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="pesapal-success">
            <div className="success-animation">
              <div className="success-icon">✓</div>
            </div>
            <h3>Payment Successful!</h3>
            <div className="payment-details">
              <div className="detail-item">
                <label>Amount:</label>
                <span>KES {parseFloat(amount).toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <label>Transaction ID:</label>
                <span>{paymentData?.orderTrackingId || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Confirmation:</label>
                <span>Payment completed successfully</span>
              </div>
            </div>
            <button
              className="btn primary"
              onClick={onClose}
              style={{ width: '100%', padding: '16px' }}
            >
              Complete Transaction
            </button>
          </div>
        );

      case 'failed':
        return (
          <div className="pesapal-failed">
            <div className="error-animation">
              <div className="error-icon">✕</div>
            </div>
            <h3>Payment Failed</h3>
            <p>{error || 'Payment could not be completed. Please try again.'}</p>
            <div className="payment-actions">
              <button className="btn primary" onClick={retryPayment}>
                Try Again
              </button>
              <button className="btn secondary" onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
        );

      case 'timeout':
        return (
          <div className="pesapal-timeout">
            <div className="timeout-animation">
              <div className="timeout-icon">⏰</div>
            </div>
            <h3>Payment Timeout</h3>
            <p>The payment session has expired. Please try again.</p>
            <div className="payment-actions">
              <button className="btn primary" onClick={retryPayment}>
                Try Again
              </button>
              <button className="btn secondary" onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="lg"
      className="pesapal-payment-modal"
    >
      <div className="pesapal-payment-container">
        <div className="pesapal-header">
          <div className="pesapal-logo">
            <h2>Pesapal Payment</h2>
            <p>Secure payment gateway</p>
          </div>
        </div>

        <div className="pesapal-content">
          {error && paymentStatus !== 'failed' && paymentStatus !== 'timeout' && (
            <div className="error-message">
              {error}
            </div>
          )}

          {renderContent()}
        </div>
      </div>

      <style jsx>{`
        .pesapal-payment-modal .modal-content {
          max-width: 800px;
          width: 100%;
        }

        .pesapal-payment-container {
          padding: 24px;
        }

        .pesapal-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .pesapal-logo h2 {
          color: var(--accent);
          margin: 0 0 8px 0;
        }

        .pesapal-logo p {
          color: var(--text-muted);
          margin: 0;
        }

        .payment-amount {
          background: var(--bg-soft);
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .amount-label {
          font-weight: 500;
        }

        .amount-value {
          font-size: 24px;
          font-weight: bold;
          color: var(--accent);
        }

        .payment-methods h4 {
          margin: 0 0 16px 0;
        }

        .methods-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-bottom: 24px;
        }

        .method-card {
          display: flex;
          align-items: center;
          padding: 16px;
          border: 2px solid var(--border);
          border-radius: 8px;
          background: var(--bg);
          cursor: pointer;
          transition: all 0.2s;
        }

        .method-card:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
        }

        .method-card.selected {
          border-color: var(--accent);
          background: var(--accent-soft);
        }

        .method-icon {
          font-size: 24px;
          margin-right: 12px;
        }

        .method-info {
          flex: 1;
        }

        .method-name {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .method-desc {
          font-size: 12px;
          color: var(--text-muted);
        }

        .customer-info h4 {
          margin: 0 0 12px 0;
        }

        .info-grid {
          display: grid;
          gap: 8px;
          margin-bottom: 24px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
        }

        .info-item label {
          font-weight: 500;
          color: var(--text-muted);
        }

        .loading-animation, .success-animation, .error-animation, .timeout-animation {
          text-align: center;
          margin-bottom: 24px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border);
          border-top: 4px solid var(--accent);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .spinner.large {
          width: 60px;
          height: 60px;
          border-width: 6px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .success-icon, .error-icon, .timeout-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: bold;
          margin: 0 auto;
        }

        .success-icon {
          background: #10b981;
          color: white;
        }

        .error-icon {
          background: #ef4444;
          color: white;
        }

        .timeout-icon {
          background: #f59e0b;
          color: white;
        }

        .payment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .countdown {
          text-align: right;
        }

        .countdown-label {
          display: block;
          font-size: 12px;
          color: var(--text-muted);
        }

        .countdown-time {
          font-size: 18px;
          font-weight: bold;
          color: var(--accent);
        }

        .payment-iframe-container {
          width: 100%;
          height: 500px;
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .pesapal-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .payment-instructions h4 {
          margin: 0 0 12px 0;
        }

        .payment-instructions ul {
          margin: 0 0 16px 0;
          padding-left: 20px;
        }

        .payment-instructions li {
          margin-bottom: 8px;
        }

        .payment-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .payment-details {
          background: var(--bg-soft);
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .detail-item:last-child {
          margin-bottom: 0;
        }

        .detail-item label {
          font-weight: 500;
          color: var(--text-muted);
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
        }
      `}</style>
    </Modal>
  );
};

export default PesapalPaymentModal;
