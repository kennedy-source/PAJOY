import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import Modal from '../components/Modal.jsx';

const fmt = (n) => 'KES ' + Number(n || 0).toLocaleString();

export default function ProductDetail({ user }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [colours, setColours] = useState([]);
  const [schools, setSchools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [variantForm, setVariantForm] = useState({ size_id: '', colour_id: '', gender: 'unisex', price: 0, cost_price: 0, stock_qty: 0, reorder_level: 5 });
  const [adjustVid, setAdjustVid] = useState(null);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustReason, setAdjustReason] = useState('restock');
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({});

  function load() { api.get('/api/products/' + id).then(setProduct); }
  useEffect(() => { 
    load(); 
    api.get('/api/sizes').then(setSizes); 
    api.get('/api/colours').then(setColours);
    api.get('/api/schools').then(setSchools);
    api.get('/api/categories').then(setCategories);
  }, [id]);

  useEffect(() => {
    if (product) setEditForm({
      name: product.name,
      description: product.description || '',
      base_price: product.base_price,
      cost_price: product.cost_price,
      reorder_level: product.reorder_level,
      category_id: product.category_id,
      school_id: product.school_id
    });
  }, [product]);

  async function addVariant() {
    await api.post('/api/variants', { ...variantForm, product_id: id, actor: user.id });
    setShowAdd(false); load();
  }
  async function adjust() {
    await api.post(`/api/variants/${adjustVid}/adjust`, { change_qty: Number(adjustQty), reason: adjustReason, actor: user.id });
    setAdjustVid(null); setAdjustQty(0); load();
  }
  async function saveEdit() {
    try {
      await api.put('/api/products/' + id, editForm);
      setShowEdit(false); load();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  }

  if (!product) return <div className="text-mute">Loading…</div>;

  return (
    <>
      <div className="flex between center mb-16">
        <div>
          <Link to="/inventory" className="text-mute">← Inventory</Link>
          <h1>{product.name}</h1>
          <div className="page-sub">SKU {product.sku}</div>
        </div>
        <div className="flex gap-8">
          {(user.role === 'admin' || user.role === 'manager') && (
            <button className="btn" onClick={() => setShowEdit(true)}>Edit Product</button>
          )}
          <button className="btn primary" onClick={() => setShowAdd(true)}>+ Add variant</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead><tr><th>Size</th><th>Colour</th><th>Gender</th><th className="text-right">Price</th><th className="text-right">Stock</th><th></th></tr></thead>
          <tbody>
            {(product.variants || []).map(v => (
              <tr key={v.id}>
                <td>{v.size_label || '—'}</td>
                <td>
                  {v.colour_name ? <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: v.colour_hex, border: '1px solid #444', marginRight: 6 }}></span>{v.colour_name}</span> : '—'}
                </td>
                <td>{v.gender || '—'}</td>
                <td className="text-right">{fmt(v.price || product.base_price)}</td>
                <td className="text-right"><span className={'badge ' + (v.stock_qty <= v.reorder_level ? 'danger' : 'success')}>{v.stock_qty}</span></td>
                <td><button className="btn sm" onClick={() => { setAdjustVid(v.id); setAdjustQty(0); }}>Adjust stock</button></td>
              </tr>
            ))}
            {!product.variants?.length && <tr><td colSpan={6} className="text-mute" style={{ textAlign: 'center', padding: 30 }}>No variants yet</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={showAdd} title="Add variant" onClose={() => setShowAdd(false)}
        actions={<><button className="btn" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn primary" onClick={addVariant}>Save</button></>}>
        <div className="row">
          <div className="field"><label className="label">Size</label>
            <select className="select" value={variantForm.size_id} onChange={e => setVariantForm({ ...variantForm, size_id: e.target.value })}>
              <option value="">—</option>{sizes.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div className="field"><label className="label">Colour</label>
            <select className="select" value={variantForm.colour_id} onChange={e => setVariantForm({ ...variantForm, colour_id: e.target.value })}>
              <option value="">—</option>{colours.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="row">
          <div className="field"><label className="label">Gender</label>
            <select className="select" value={variantForm.gender} onChange={e => setVariantForm({ ...variantForm, gender: e.target.value })}>
              <option value="unisex">Unisex</option><option value="boys">Boys</option><option value="girls">Girls</option>
            </select>
          </div>
          <div className="field"><label className="label">Reorder level</label><input className="input" type="number" value={variantForm.reorder_level} onChange={e => setVariantForm({ ...variantForm, reorder_level: +e.target.value })} /></div>
        </div>
        <div className="row-3">
          <div className="field"><label className="label">Price</label><input className="input" type="number" value={variantForm.price} onChange={e => setVariantForm({ ...variantForm, price: +e.target.value })} /></div>
          <div className="field"><label className="label">Cost</label><input className="input" type="number" value={variantForm.cost_price} onChange={e => setVariantForm({ ...variantForm, cost_price: +e.target.value })} /></div>
          <div className="field"><label className="label">Stock</label><input className="input" type="number" value={variantForm.stock_qty} onChange={e => setVariantForm({ ...variantForm, stock_qty: +e.target.value })} /></div>
        </div>
      </Modal>

      {showEdit && (
        <Modal title="Edit Product" onClose={() => setShowEdit(false)}
          actions={<><button className="btn" onClick={() => setShowEdit(false)}>Cancel</button><button className="btn primary" onClick={saveEdit}>Save</button></>}>
          <div className="field"><label className="label">Name</label><input className="input" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /></div>
          <div className="field"><label className="label">Description</label><textarea className="input" value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} /></div>
          <div className="row">
            <div className="field"><label className="label">Base Price</label><input className="input" type="number" value={editForm.base_price || 0} onChange={e => setEditForm({ ...editForm, base_price: +e.target.value })} /></div>
            <div className="field"><label className="label">Cost Price</label><input className="input" type="number" value={editForm.cost_price || 0} onChange={e => setEditForm({ ...editForm, cost_price: +e.target.value })} /></div>
          </div>
          <div className="row">
            <div className="field"><label className="label">Reorder Level</label><input className="input" type="number" value={editForm.reorder_level || 5} onChange={e => setEditForm({ ...editForm, reorder_level: +e.target.value })} /></div>
            <div className="field"><label className="label">Category</label>
              <select className="select" value={editForm.category_id || ''} onChange={e => setEditForm({ ...editForm, category_id: e.target.value })}>
                <option value="">None</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="field"><label className="label">School</label>
            <select className="select" value={editForm.school_id || ''} onChange={e => setEditForm({ ...editForm, school_id: e.target.value })}>
              <option value="">None</option>
              {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </Modal>
      )}

      <Modal open={!!adjustVid} title="Adjust stock" onClose={() => setAdjustVid(null)}
        actions={<><button className="btn" onClick={() => setAdjustVid(null)}>Cancel</button><button className="btn primary" onClick={adjust}>Apply</button></>}>
        <div className="text-mute mb-12">Use negative numbers to reduce stock.</div>
        <div className="row">
          <div className="field"><label className="label">Change qty</label><input className="input" type="number" value={adjustQty} onChange={e => setAdjustQty(e.target.value)} /></div>
          <div className="field"><label className="label">Reason</label>
            <select className="select" value={adjustReason} onChange={e => setAdjustReason(e.target.value)}>
              <option value="restock">Restock</option>
              <option value="adjustment">Adjustment</option>
              <option value="return">Return</option>
              <option value="damage">Damage</option>
            </select>
          </div>
        </div>
      </Modal>
    </>
  );
}
