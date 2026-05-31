import React, { useState } from 'react';
import { ChevronDown, Plus, Trash2, X } from 'lucide-react';

const COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Pink', 'Purple', 'Orange', 'Brown'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free'];

export function VariantManager({ product, onSave, onCancel }) {
  const normalize = (product.variants || []).map(v => ({
    id: v.id,
    _id: v._id || v.id || Date.now() + Math.random(),
    color: v.color,
    size: v.size,
    designNumber: v.design_number || v.designNumber || '',
    stock: Number(v.stock_quantity ?? v.stock ?? 0),
    sku: v.sku_suffix || v.sku || '',
    price: v.price_override ?? v.price ?? null
  }));

  const [variants, setVariants] = useState(normalize);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showAutoForm, setShowAutoForm] = useState(false);
  const [manualForm, setManualForm] = useState({ color: '', size: 'M', designNumber: '', stock: 0, price: null });
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  const handleAddVariant = () => {
    if (!manualForm.color || !manualForm.size) return;
    const newVariant = {
      _id: Date.now(),
      color: manualForm.color,
      size: manualForm.size,
      designNumber: manualForm.designNumber,
      stock: Number(manualForm.stock),
      sku: `${product.sku}-${manualForm.color.substring(0, 2).toUpperCase()}-${manualForm.size}`,
    };
    setVariants([...variants, newVariant]);
    setManualForm({ color: '', size: 'M', designNumber: '', stock: 0 });
    setShowManualForm(false);
  };

  const handleAutoGenerate = () => {
    if (selectedColors.length === 0 || selectedSizes.length === 0) return;
    const newVariants = [];
    selectedColors.forEach(color => {
      selectedSizes.forEach(size => {
        newVariants.push({
          _id: Date.now() + Math.random(),
          color,
          size,
          designNumber: '',
          stock: 0,
          price: null,
          sku: `${product.sku}-${color.substring(0, 2).toUpperCase()}-${size}`,
        });
      });
    });
    setVariants([...variants, ...newVariants]);
    setShowAutoForm(false);
    setSelectedColors([]);
    setSelectedSizes([]);
  };

  const handleRemoveVariant = (id) => {
    setVariants(variants.filter(v => v._id !== id));
  };

  const handleUpdateVariant = (id, field, value) => {
    setVariants(variants.map(v => v._id === id ? { ...v, [field]: value } : v));
  };

  const handleSave = () => {
    const payloadVariants = variants.map(v => ({
      id: v.id,
      color: v.color,
      size: v.size,
      designNumber: v.designNumber,
      stock: v.stock,
      sku: v.sku,
      price_override: v.price ?? null
    }));
    onSave({ ...product, variants: payloadVariants });
  };

  const totalStock = variants.reduce((sum, v) => sum + Number(v.stock), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#4a1942' }}>
          Variants ({variants.length}) · Total Stock: {totalStock}
        </h4>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowManualForm(true)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: 'none',
              background: '#8b3a6a',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + Manual
          </button>
          <button
            onClick={() => setShowAutoForm(true)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid #d4a4c4',
              background: '#fff',
              color: '#8b3a6a',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ⚡ Auto-Gen
          </button>
        </div>
      </div>

      {/* Variants List */}
      {variants.length > 0 && (
        <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #f0e0ec', borderRadius: 10, padding: 8 }}>
          {variants.map(variant => (
            <div
              key={variant._id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                borderBottom: '1px solid #f5edf3',
                gap: 10,
              }}
            >
              <div style={{ flex: 1, display: 'flex', gap: 8, fontSize: 12 }}>
                <span style={{ fontWeight: 600, color: '#8b3a6a' }}>{variant.color}</span>
                <span style={{ color: '#bbb' }}>|</span>
                <span>{variant.size}</span>
                {variant.designNumber && (
                  <>
                    <span style={{ color: '#bbb' }}>|</span>
                    <span style={{ fontSize: 10, color: '#999' }}>Design: {variant.designNumber}</span>
                  </>
                )}
              </div>
              <input
                type="number"
                min="0"
                value={variant.stock}
                onChange={e => handleUpdateVariant(variant._id, 'stock', Number(e.target.value))}
                style={{
                  width: 60,
                  padding: '4px 6px',
                  border: '1px solid #d4a4c4',
                  borderRadius: 6,
                  fontSize: 12,
                  textAlign: 'right',
                }}
              />
              <input
                type="number"
                min="0"
                placeholder="Price"
                value={variant.price ?? ''}
                onChange={e => handleUpdateVariant(variant._id, 'price', e.target.value === '' ? null : Number(e.target.value))}
                style={{
                  width: 90,
                  padding: '4px 6px',
                  border: '1px solid #d4a4c4',
                  borderRadius: 6,
                  fontSize: 12,
                  textAlign: 'right',
                }}
              />
              <button
                onClick={() => handleRemoveVariant(variant._id)}
                style={{
                  padding: 4,
                  background: '#ffe4ef',
                  border: 'none',
                  borderRadius: 4,
                  color: '#c04070',
                  cursor: 'pointer',
                  fontSize: 16,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Manual Add Form */}
      {showManualForm && (
        <div style={{ padding: 12, background: '#fdf6fa', borderRadius: 10, border: '1px solid #f0e0ec' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 80px', gap: 8, marginBottom: 8 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#666', display: 'block', marginBottom: 4 }}>Color</label>
              <select
                value={manualForm.color}
                onChange={e => setManualForm({ ...manualForm, color: e.target.value })}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #d4a4c4',
                  borderRadius: 6,
                  fontSize: 12,
                }}
              >
                <option value="">Select</option>
                {COLORS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#666', display: 'block', marginBottom: 4 }}>Size</label>
              <select
                value={manualForm.size}
                onChange={e => setManualForm({ ...manualForm, size: e.target.value })}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #d4a4c4',
                  borderRadius: 6,
                  fontSize: 12,
                }}
              >
                {SIZES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#666', display: 'block', marginBottom: 4 }}>Design #</label>
              <input
                type="text"
                value={manualForm.designNumber}
                onChange={e => setManualForm({ ...manualForm, designNumber: e.target.value })}
                placeholder="Optional"
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #d4a4c4',
                  borderRadius: 6,
                  fontSize: 12,
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#666', display: 'block', marginBottom: 4 }}>Stock</label>
              <input
                type="number"
                min="0"
                value={manualForm.stock}
                onChange={e => setManualForm({ ...manualForm, stock: e.target.value })}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #d4a4c4',
                  borderRadius: 6,
                  fontSize: 12,
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#666', display: 'block', marginBottom: 4 }}>Price</label>
              <input
                type="number"
                min="0"
                value={manualForm.price ?? ''}
                onChange={e => setManualForm({ ...manualForm, price: e.target.value === '' ? null : Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #d4a4c4',
                  borderRadius: 6,
                  fontSize: 12,
                }}
              />
            </div>
            <button
              onClick={handleAddVariant}
              style={{
                padding: '6px 12px',
                background: '#8b3a6a',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: 20,
              }}
            >
              Add
            </button>
          </div>
          <button
            onClick={() => setShowManualForm(false)}
            style={{
              fontSize: 12,
              color: '#bbb',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Auto-Generate Form */}
      {showAutoForm && (
        <div style={{ padding: 12, background: '#fdf6fa', borderRadius: 10, border: '1px solid #f0e0ec' }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Select Colors</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedColors(selectedColors.includes(c) ? selectedColors.filter(x => x !== c) : [...selectedColors, c])}
                  style={{
                    padding: '5px 12px',
                    border: selectedColors.includes(c) ? '2px solid #8b3a6a' : '1px solid #d4a4c4',
                    background: selectedColors.includes(c) ? '#8b3a6a' : '#fff',
                    color: selectedColors.includes(c) ? '#fff' : '#8b3a6a',
                    borderRadius: 6,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Select Sizes</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SIZES.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSizes(selectedSizes.includes(s) ? selectedSizes.filter(x => x !== s) : [...selectedSizes, s])}
                  style={{
                    padding: '5px 12px',
                    border: selectedSizes.includes(s) ? '2px solid #8b3a6a' : '1px solid #d4a4c4',
                    background: selectedSizes.includes(s) ? '#8b3a6a' : '#fff',
                    color: selectedSizes.includes(s) ? '#fff' : '#8b3a6a',
                    borderRadius: 6,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleAutoGenerate}
              disabled={selectedColors.length === 0 || selectedSizes.length === 0}
              style={{
                padding: '8px 16px',
                background: selectedColors.length > 0 && selectedSizes.length > 0 ? '#8b3a6a' : '#ccc',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: selectedColors.length > 0 && selectedSizes.length > 0 ? 'pointer' : 'not-allowed',
              }}
            >
              Generate {selectedColors.length * selectedSizes.length} variants
            </button>
            <button
              onClick={() => setShowAutoForm(false)}
              style={{
                fontSize: 12,
                color: '#bbb',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '8px 16px',
            border: '1px solid #d4a4c4',
            borderRadius: 8,
            background: '#fff',
            color: '#8b3a6a',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: 8,
            background: '#8b3a6a',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Save Variants
        </button>
      </div>
    </div>
  );
}
