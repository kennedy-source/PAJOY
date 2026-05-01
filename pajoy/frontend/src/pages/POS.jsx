import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import Modal from '../components/Modal.jsx';
import PesapalPaymentModal from '../components/PesapalPaymentModal.jsx';

const fmt = (n) => 'KES ' + Number(n || 0).toLocaleString();

export default function POS({ user }) {
  const [products, setProducts] = useState([]);
  const [schools, setSchools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ q: '', sku: '', school_id: '', category_id: '' });
  const [activeProduct, setActiveProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashAmount, setCashAmount] = useState(0);
  const [pesapalAmount, setPesapalAmount] = useState(0);
  const [pesapalRef, setPesapalRef] = useState('');
  const [phone, setPhone] = useState('');
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [completed, setCompleted] = useState(null);
  const [showPesapalModal, setShowPesapalModal] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');

  const [searchTimeout, setSearchTimeout] = useState(null);

  function load() {
    const qs = new URLSearchParams();
    if (filters.q) qs.set('q', filters.q);
    if (filters.sku) qs.set('sku', filters.sku);
    if (filters.school_id) qs.set('school_id', filters.school_id);
    if (filters.category_id) qs.set('category_id', filters.category_id);
    api.get('/api/products?' + qs.toString()).then(setProducts);
  }

  function debouncedLoad() {
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(load, 300));
  }

  useEffect(() => { debouncedLoad(); }, [filters]);
  useEffect(() => {
    api.get('/api/schools').then(setSchools);
    api.get('/api/categories').then(setCategories);
    api.get('/api/customers').then(setCustomers);
  }, []);

  useEffect(() => {
    if (customerId) {
      const customer = customers.find(c => c.id === customerId);
      if (customer) setPhone(customer.phone || '');
    } else {
      setPhone('');
    }
  }, [customerId, customers]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        const input = document.querySelector('input[placeholder="Product name…"]');
        if (input) input.focus();
      }
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        const input = document.querySelector('input[placeholder="SKU / Barcode…"]');
        if (input) input.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  function openProduct(p) {
    api.get('/api/products/' + p.id).then(d => {
      setActiveProduct(d);
      setVariants(d.variants || []);
    });
  }

  function addToCart(v, p) {
    setCart(prev => {
      const ix = prev.findIndex(x => x.variant_id === v.id);
      if (ix >= 0) {
        const copy = [...prev]; copy[ix] = { ...copy[ix], qty: copy[ix].qty + 1 }; return copy;
      }
      return [...prev, {
        variant_id: v.id, product_id: p.id,
        name: `${p.name} · ${v.size_label || ''}${v.colour_name ? ' · ' + v.colour_name : ''}`.trim(),
        unit_price: v.price || p.base_price, qty: 1, stock: v.stock_qty
      }];
    });
    setActiveProduct(null);
  }

  function setQty(i, q) {
    if (q <= 0) return setCart(c => c.filter((_, ix) => ix !== i));
    setCart(c => c.map((x, ix) => ix === i ? { ...x, qty: q } : x));
  }
  function removeLine(i) { setCart(c => c.filter((_, ix) => ix !== i)); }

  const subtotal = useMemo(() => cart.reduce((s, it) => s + it.qty * it.unit_price, 0), [cart]);
  const total = Math.max(0, subtotal - (Number(discount) || 0));

  async function checkout() {
    if (!cart.length) return;
    
    // For Pesapal payments, use the modal instead of direct checkout
    if (paymentMethod === 'pesapal') {
      handlePesapalPayment();
      return;
    }
    
    // For mixed payments, handle Pesapal portion first
    if (paymentMethod === 'mixed' && pesapalAmount > 0) {
      handlePesapalPayment();
      return;
    }
    
    // For cash payments or mixed with only cash, proceed normally
    completeSale();
  }

  function handlePesapalPayment() {
    const customerInfo = {
      name: customerName || (customers.find(c => c.id === customerId)?.name) || 'Walk-in Customer',
      phone: phone || (customers.find(c => c.id === customerId)?.phone) || '',
      email: customerEmail || (customers.find(c => c.id === customerId)?.email) || ''
    };

    setShowPesapalModal(true);
  }

  function handlePesapalSuccess(paymentResponse) {
    // Update payment status and complete the sale
    setPesapalRef(paymentResponse.confirmationCode || paymentResponse.orderTrackingId);
    setShowPesapalModal(false);
    
    // Complete the sale automatically
    completeSale();
  }

  function handlePesapalError(error) {
    setShowPesapalModal(false);
    console.error('Pesapal payment error:', error);
  }

  function completeSale() {
    if (!cart.length) return;
    let cash = 0, pesapal = 0;
    if (paymentMethod === 'cash') cash = total;
    else if (paymentMethod === 'pesapal') pesapal = total;
    else { cash = Number(cashAmount) || 0; pesapal = Number(pesapalAmount) || 0; }
    
    api.post('/api/sales', {
      items: cart, discount: Number(discount) || 0, payment_method: paymentMethod,
      cash_amount: cash, pesapal_amount: pesapal, pesapal_ref: pesapalRef || null,
      customer_id: customerId || null, cashier_id: user.id
    }).then(res => {
      setCompleted(res);
      setCart([]); setDiscount(0); setCashAmount(0); setPesapalAmount(0); setPesapalRef(''); setCustomerId('');
      load();
    }).catch(error => {
      console.error('Sale completion error:', error);
      alert('Error completing sale: ' + error.message);
    });
  }

  function printReceipt(sale) {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${sale.receipt_no}</title>
      <style>body{font-family:monospace;width:280px;margin:0 auto;padding:12px;color:#000}h2{margin:0;text-align:center}hr{border:0;border-top:1px dashed #000;margin:8px 0}table{width:100%;font-size:12px}td{padding:2px 0}.r{text-align:right}.c{text-align:center}</style>
      </head><body>
      <h2>PAJOY SYSTEM</h2>
      <div class="c">Nairobi, Kenya</div><hr/>
      <div>Receipt: <b>${sale.receipt_no}</b></div>
      <div>Date: ${new Date().toLocaleString()}</div>
      <div>Cashier: ${user.full_name || user.username}</div>
      <hr/>
      <table>${cart.map(i => `<tr><td>${i.name}</td></tr><tr><td>${i.qty} x ${i.unit_price}</td><td class="r">${i.qty * i.unit_price}</td></tr>`).join('')}</table>
      <hr/>
      <table>
        <tr><td>Subtotal</td><td class="r">${subtotal}</td></tr>
        <tr><td>Discount</td><td class="r">-${discount || 0}</td></tr>
        <tr><td><b>TOTAL</b></td><td class="r"><b>KES ${sale.total}</b></td></tr>
        <tr><td>Payment</td><td class="r">${paymentMethod}</td></tr>
      </table>
      <hr/><div class="c">Thank you!</div>
      </body></html>`;
    if (window.pajoy?.printReceipt) window.pajoy.printReceipt(html);
    else { const w = window.open('', '_blank'); w.document.write(html); w.document.close(); w.print(); }
  }

  return (
    <>
      <h1>Point of Sale</h1>
      <div className="page-sub">Search a product, pick a variant, take payment.</div>

      <div className="pos-grid">
        <div>
          <div className="card mb-12">
            <div className="row mb-8">
              <input className="input" placeholder="Product name…" value={filters.q} onChange={e => setFilters(f => ({ ...f, q: e.target.value }))} />
              <input className="input" placeholder="SKU / Barcode…" value={filters.sku} onChange={e => setFilters(f => ({ ...f, sku: e.target.value }))} />
            </div>
            <div className="row">
              <select className="select" value={filters.school_id} onChange={e => setFilters(f => ({ ...f, school_id: e.target.value }))}>
                <option value="">All schools</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select className="select" value={filters.category_id} onChange={e => setFilters(f => ({ ...f, category_id: e.target.value }))}>
                <option value="">All categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="text-mute" style={{ fontSize: 12, marginTop: 8 }}>Keyboard shortcuts: Ctrl+F (name), Ctrl+B (SKU)</div>
          </div>
          <div className="pos-products">
            {products.map(p => (
              <div key={p.id} className="product-tile" onClick={() => openProduct(p)} style={{ 
                borderLeft: `4px solid ${p.primary_color || '#1c4dd1'}`,
                transition: 'all 0.2s ease'
              }}>
                <div className="pname">{p.name}</div>
                <div className="pmeta" style={{ fontSize: '11px', color: p.primary_color || '#666' }}>🏫 {p.school_name || 'General'}</div>
                <div className="pprice">{fmt(p.base_price)}</div>
                <div className="pmeta" style={{ fontSize: '11px' }}>📦 Stock: {p.total_stock}</div>
              </div>
            ))}
            {!products.length && <div className="text-mute">No products match.</div>}
          </div>
        </div>

        <div className="cart card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>🛒 Cart ({cart.length})</h3>
          {cart.map((it, i) => (
            <div key={i} className="cart-item" style={{ borderLeft: '3px solid #1c4dd1' }}>
              <div>
                <div className="ci-name">{it.name}</div>
                <div className="ci-meta">{fmt(it.unit_price)} × {it.qty} = <strong>{fmt(it.qty * it.unit_price)}</strong></div>
              </div>
              <div className="qty-ctl">
                <button className="btn sm" onClick={() => setQty(i, it.qty - 1)}>−</button>
                <span style={{ minWidth: '24px', textAlign: 'center' }}>{it.qty}</span>
                <button className="btn sm" onClick={() => setQty(i, it.qty + 1)}>+</button>
              </div>
              <button className="btn sm ghost" onClick={() => removeLine(i)} title="Remove">✕</button>
            </div>
          ))}
          {!cart.length && <div className="text-mute" style={{ padding: '20px 0', textAlign: 'center', fontSize: '14px' }}>🛍️ Your cart is empty</div>}

          <div className="mt-12">
            <div className="field">
              <label className="label">Customer (optional)</label>
              <select className="select" value={customerId} onChange={e => setCustomerId(e.target.value)}>
                <option value="">Walk-in</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="row">
              <div className="field">
                <label className="label">Discount (KES)</label>
                <input className="input" type="number" value={discount} onChange={e => setDiscount(e.target.value)} />
              </div>
              <div className="field">
                <label className="label">Payment Method</label>
                <select className="select" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ fontSize: '16px' }}>
                  <option value="cash">💰 Cash</option>
                  <option value="pesapal">📱 Pesapal (STK Push)</option>
                  <option value="mixed">🔄 Cash + Pesapal (Mixed)</option>
                </select>
              </div>
            </div>
            {paymentMethod === 'pesapal' && (
              <div style={{ background: 'linear-gradient(135deg, #1c4dd1 0%, #0c4a3a 100%)', padding: '16px', borderRadius: '8px', color: 'white' }}>
                <div className="field" style={{ marginBottom: 12 }}>
                  <label className="label" style={{ color: 'rgba(255,255,255,0.9)' }}>📱 Phone Number</label>
                  <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g., 254712345678" style={{ fontSize: '16px' }} />
                </div>
                <div className="field" style={{ marginBottom: 12 }}>
                  <label className="label" style={{ color: 'rgba(255,255,255,0.9)' }}>� Email</label>
                  <input className="input" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="customer@example.com" style={{ fontSize: '16px' }} />
                </div>
                <div className="field" style={{ marginBottom: 12 }}>
                  <label className="label" style={{ color: 'rgba(255,255,255,0.9)' }}>👤 Customer Name</label>
                  <input className="input" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Customer name" style={{ fontSize: '16px' }} />
                </div>
                <button className="btn" onClick={handlePesapalPayment} style={{ width: '100%', marginBottom: 0, background: '#f6c700', color: '#000', fontWeight: 'bold', padding: '14px' }}>
                  💳 Pay with Pesapal
                </button>
                <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>Secure payment via Pesapal gateway</div>
              </div>
            )}
            {paymentMethod === 'mixed' && (
              <div className="row">
                <div className="field"><label className="label">Cash</label><input type="number" className="input" value={cashAmount} onChange={e => setCashAmount(e.target.value)} /></div>
                <div className="field"><label className="label">Pesapal</label><input type="number" className="input" value={pesapalAmount} onChange={e => setPesapalAmount(e.target.value)} /></div>
              </div>
            )}
            <div className="flex between mt-12" style={{ borderTop: '1px solid var(--border-soft)', paddingTop: 12 }}>
              <span className="text-mute">Subtotal</span><b>{fmt(subtotal)}</b>
            </div>
            {discount > 0 && (
              <div className="flex between mt-8" style={{ color: '#c0252b' }}>
                <span>Discount</span><b>-{fmt(discount)}</b>
              </div>
            )}
            <div className="flex between mt-12" style={{ paddingTop: 12, borderTop: '2px solid var(--border-soft)' }}>
              <span style={{ fontSize: 18, fontWeight: 'bold' }}>💰 Total</span>
              <b style={{ fontSize: 24, color: '#1c4dd1' }}>{fmt(total)}</b>
            </div>
            <button className="btn primary mt-16" style={{ 
              width: '100%', 
              justifyContent: 'center', 
              padding: 16,
              fontSize: '16px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #1c4dd1 0%, #0c4a3a 100%)',
              boxShadow: '0 4px 12px rgba(28, 77, 209, 0.3)'
            }} disabled={!cart.length} onClick={checkout}>
              ✓ Complete Sale
            </button>
          </div>
        </div>
      </div>

      <Modal open={!!activeProduct} title={activeProduct?.name} onClose={() => setActiveProduct(null)} size="lg">
        {activeProduct && (
          <>
            <div className="text-mute mb-12" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🏫 {activeProduct.school_name || 'General'} · SKU: {activeProduct.sku}</span>
              {activeProduct.primary_color && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ width: '20px', height: '20px', background: activeProduct.primary_color, border: '1px solid #ddd', borderRadius: '4px' }} title={activeProduct.primary_color}></div>
                  {activeProduct.secondary_color && <div style={{ width: '20px', height: '20px', background: activeProduct.secondary_color, border: '1px solid #ddd', borderRadius: '4px' }} title={activeProduct.secondary_color}></div>}
                </div>
              )}
            </div>
            <table className="table">
              <thead><tr><th>Size</th><th>Colour</th><th>Stock</th><th>Price</th><th></th></tr></thead>
              <tbody>
                {variants.map(v => (
                  <tr key={v.id}>
                    <td><strong>{v.size_label || '—'}</strong></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {v.colour_hex && <div style={{ width: '16px', height: '16px', background: v.colour_hex, border: '1px solid #999', borderRadius: '3px' }}></div>}
                        {v.colour_name || '—'}
                      </div>
                    </td>
                    <td><span className={'badge ' + (v.stock_qty > 0 ? 'success' : 'danger')}>{v.stock_qty}</span></td>
                    <td>{fmt(v.price || activeProduct.base_price)}</td>
                    <td><button className="btn primary sm" disabled={v.stock_qty <= 0} onClick={() => addToCart(v, activeProduct)}>Add</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Modal>

      <Modal open={!!completed} title="✅ Sale Completed Successfully!" onClose={() => setCompleted(null)}
        actions={<>
          <button className="btn" onClick={() => setCompleted(null)}>Close</button>
          <button className="btn primary" onClick={() => { printReceipt(completed); setCompleted(null); }} style={{ background: '#0c4a3a' }}>Print Receipt</button>
        </>}>
        {completed && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✓</div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Receipt #:</strong> <span style={{ fontSize: '18px', color: '#1c4dd1', fontFamily: 'monospace' }}>{completed.receipt_no}</span>
            </div>
            <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ fontSize: '28px', color: '#0c4a3a', fontWeight: 'bold' }}>
                {fmt(completed.total)}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Payment: {completed.payment_method}</div>
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {new Date().toLocaleString('en-KE')}
            </div>
          </div>
        )}
      </Modal>

      <PesapalPaymentModal
        isOpen={showPesapalModal}
        onClose={() => setShowPesapalModal(false)}
        amount={total}
        customerInfo={{
          name: customerName || (customers.find(c => c.id === customerId)?.name) || 'Walk-in Customer',
          phone: phone || (customers.find(c => c.id === customerId)?.phone) || '',
          email: customerEmail || (customers.find(c => c.id === customerId)?.email) || ''
        }}
        onPaymentSuccess={handlePesapalSuccess}
        onPaymentError={handlePesapalError}
      />
    </>
  );
}
