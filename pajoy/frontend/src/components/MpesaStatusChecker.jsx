import React, { useState, useEffect } from 'react';

const MpesaStatusChecker = ({ merchantRequestId }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!merchantRequestId) {
      setError('No merchant request ID provided');
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Properly encode the merchant request ID
        const encodedId = encodeURIComponent(merchantRequestId);
        const response = await fetch(`/api/mpesa/status/${encodedId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setStatus(data);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [merchantRequestId]);

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner"></div>
        <p>Checking M-Pesa status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <p><strong>Error:</strong> {error}</p>
      </div>
    );
  }

  if (status && status.success) {
    const { transaction } = status;
    
    return (
      <div className="card">
        <h4>M-Pesa Payment Status</h4>
        <div className="row">
          <div className="col">
            <p><strong>Transaction ID:</strong> {transaction.merchantRequestId}</p>
            <p><strong>Status:</strong> 
              <span className={`badge ${transaction.status.toLowerCase()}`}>
                {transaction.status}
              </span>
            </p>
            <p><strong>Amount:</strong> KES {transaction.amount}</p>
            <p><strong>Phone:</strong> {transaction.phone}</p>
            {transaction.orderId && (
              <p><strong>Order ID:</strong> {transaction.orderId}</p>
            )}
            {transaction.customerName && (
              <p><strong>Customer:</strong> {transaction.customerName}</p>
            )}
          </div>
          <div className="col">
            {transaction.mpesaReceipt && (
              <div>
                <p><strong>M-Pesa Receipt:</strong> {transaction.mpesaReceipt}</p>
                <p><strong>Completed:</strong> {new Date(transaction.completedAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
        <div className="text-center mt-4">
          <button className="btn" onClick={() => window.location.href = '/sales'}>
            Back to Sales
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default MpesaStatusChecker;
