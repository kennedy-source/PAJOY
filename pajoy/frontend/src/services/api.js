const BASE = (typeof window !== 'undefined' && window.pajoy?.apiBase) || 'http://127.0.0.1:5179';

async function request(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  get:    (p)    => request('GET', p),
  post:   (p, b) => request('POST', p, b),
  put:    (p, b) => request('PUT', p, b),
  del:    (p)    => request('DELETE', p),
  
  // Pesapal specific methods with proper URL encoding
  pesapal: {
    submitPayment: (phone, amount, orderId, customerName, email) => {
      return request('POST', '/api/pesapal/submit', {
        phone,
        amount,
        order_id: orderId,
        customer_name: customerName,
        email
      });
    },
    checkStatus: (merchantRequestId) => {
      // Properly encode merchant request ID to prevent double-encoding
      const encodedId = encodeURIComponent(merchantRequestId);
      return request('GET', `/api/pesapal/status/${encodedId}`);
    }
  }
};
