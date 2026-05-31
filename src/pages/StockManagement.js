import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search, Plus, Edit3, Package, AlertTriangle, ChevronDown, X, ArrowUpDown, Trash2, RefreshCw, Layers
} from 'lucide-react';
import { getProducts, getProduct, addProduct, updateProduct, deleteProduct } from '../services/api';
import { VariantManager } from '../components/VariantManager';

const CATS = ['Kurti', 'Saree', 'Leggings', 'Tops', 'Nighty', 'Chudithar', 'Other'];
const UNITS = ['pieces', 'meters', 'sets', 'rolls'];

const emptyForm = { sku: '', name: '', category: '', available: '', unit: 'pieces', price: '', minStock: '' };

export default function StockManagement() {
  const [inventory, setInventory]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem]       = useState(null);
  const [sortConfig, setSortConfig]   = useState({ key: null, direction: 'asc' });
  const [formData, setFormData]       = useState(emptyForm);
  const [saving, setSaving]           = useState(false);
  const [expandedId, setExpandedId]   = useState(null);
  const [showVariantMgr, setShowVariantMgr] = useState(null);

  /* ─── Load from DB ─── */
  const loadInventory = useCallback(async () => {
    setLoading(true);
    try {
      const products = await getProducts();
      setInventory(Array.isArray(products) ? products : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { loadInventory(); }, [loadInventory]);

  /* ─── Derived ─── */
  const getStatus = (item) => {
    const avail = Number(item.stock ?? item.available ?? 0);
    const min   = Number(item.minStock ?? 0);
    if (avail === 0) return 'Out of Stock';
    if (avail <= min) return 'Low Stock';
    return 'In Stock';
  };

  const filteredInventory = useMemo(() => {
    let filtered = inventory.filter(item => {
      const avail = Number(item.stock ?? item.available ?? 0);
      const min   = Number(item.minStock ?? 0);
      const status = avail === 0 ? 'Out of Stock' : avail <= min ? 'Low Stock' : 'In Stock';
      const matchesSearch = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item.sku  || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'All' || status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const av = a[sortConfig.key], bv = b[sortConfig.key];
        if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
        if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [inventory, searchQuery, filterStatus, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  /* ─── Modals ─── */
  const openEditModal = (item) => {
    setEditItem(item);
    setFormData({
      sku: item.sku || '', name: item.name || '', category: item.category || '',
      available: item.stock ?? item.available ?? '', unit: item.unit || 'pieces',
      price: item.price || '', minStock: item.minStock || ''
    });
    setShowAddModal(true);
  };

  const openAddModal = () => {
    setEditItem(null);
    setFormData(emptyForm);
    setShowAddModal(true);
  };

  /* ─── Save ─── */
  const handleSave = async () => {
    if (!formData.name || !formData.sku) return;
    setSaving(true);
    const payload = {
      sku: formData.sku,
      name: formData.name,
      category: formData.category,
      stock: Number(formData.available),
      unit: formData.unit,
      price: Number(formData.price),
      minStock: Number(formData.minStock),
      taxRate: editItem?.taxRate ?? 5,
    };
    try {
      if (editItem) {
        await updateProduct(editItem.id, { ...editItem, ...payload });
      } else {
        await addProduct(payload);
      }
      await loadInventory();
      setShowAddModal(false);
    } catch (e) { alert('Save failed'); }
    setSaving(false);
  };

  /* ─── Delete ─── */
  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try { await deleteProduct(item.id); await loadInventory(); } catch { alert('Delete failed'); }
  };

  /* ─── Stats ─── */
  const stockSummary = useMemo(() => ({
    total: inventory.length,
    inStock:    inventory.filter(i => getStatus(i) === 'In Stock').length,
    lowStock:   inventory.filter(i => getStatus(i) === 'Low Stock').length,
    outOfStock: inventory.filter(i => getStatus(i) === 'Out of Stock').length,
  }), [inventory]);

  const getStatusBadge = (item) => {
    const s = getStatus(item);
    if (s === 'Out of Stock') return <span className="badge-danger">Out of Stock</span>;
    if (s === 'Low Stock')    return <span className="badge-warning">Low Stock</span>;
    return <span className="badge-success">In Stock</span>;
  };

  const handleManageVariants = async (item) => {
    try {
      const product = await getProduct(item.id);
      setShowVariantMgr(product || item);
    } catch (e) {
      console.error('Failed to load product details', e);
      setShowVariantMgr(item);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Items',   value: stockSummary.total,      color: 'from-primary-500 to-primary-600',  icon: Package },
          { label: 'In Stock',      value: stockSummary.inStock,    color: 'from-emerald-500 to-emerald-600',  icon: Package },
          { label: 'Low Stock',     value: stockSummary.lowStock,   color: 'from-amber-500 to-orange-500',     icon: AlertTriangle },
          { label: 'Out of Stock',  value: stockSummary.outOfStock, color: 'from-rose-500 to-rose-600',        icon: AlertTriangle },
        ].map((card, i) => (
          <div key={i} className="stat-card !p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-surface-900">{card.value}</p>
                <p className="text-xs text-surface-500">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text" placeholder="Search by name, SKU or category…"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field !pl-10"
            />
          </div>
          <div className="relative">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="select-field !w-auto !pr-10 text-sm">
              <option value="All">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadInventory} className="btn-secondary text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />Refresh
          </button>
          <button onClick={openAddModal} className="btn-primary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />Add New Item
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container overflow-x-auto">
        {loading ? (
          <div className="text-center py-16 text-surface-400 text-sm">Loading inventory…</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                {[
                  { key: 'sku',      label: 'SKU / Code' },
                  { key: 'name',     label: 'Product Name' },
                  { key: 'category', label: 'Category' },
                  { key: 'stock',    label: 'Stock' },
                  { key: 'price',    label: 'Price (₹)' },
                  { key: null,       label: 'Status' },
                  { key: null,       label: 'Actions' },
                ].map((col, i) => (
                  <th
                    key={i}
                    onClick={() => col.key && handleSort(col.key)}
                    className={`px-5 py-3.5 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider ${col.key ? 'cursor-pointer hover:text-surface-700' : ''}`}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {col.key && <ArrowUpDown className="w-3 h-3" />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filteredInventory.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-surface-400">No products found.</td></tr>
              ) : filteredInventory.map(item => {
                const avail  = Number(item.stock ?? item.available ?? 0);
                const minSt  = Number(item.minStock ?? 0);
                const isLow  = avail <= minSt && avail > 0;
                const isOut  = avail === 0;
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-surface-50 transition-colors ${isLow ? 'bg-amber-50/30' : ''} ${isOut ? '!bg-rose-50/30' : ''}`}
                  >
                    <td className="px-5 py-4 font-mono text-xs text-surface-600">{item.sku}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-surface-800">{item.name}</p>
                    </td>
                    <td className="px-5 py-4 text-surface-600">{item.category}</td>
                    <td className="px-5 py-4">
                      <span className={`font-semibold ${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-surface-800'}`}>
                        {avail} {item.unit || 'pcs'}
                      </span>
                      <span className="text-xs text-surface-400 block">min: {minSt}</span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-surface-800">₹{Number(item.price || 0).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4">{getStatusBadge(item)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleManageVariants(item)} className="p-2 rounded-lg text-surface-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all" title="Manage Variants">
                          <Layers className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEditModal(item)} className="p-2 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 transition-all" title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item)} className="p-2 rounded-lg text-surface-400 hover:text-rose-600 hover:bg-rose-50 transition-all" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-surface-100">
              <h3 className="text-lg font-display font-bold text-surface-800">
                {editItem ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg hover:bg-surface-100">
                <X className="w-5 h-5 text-surface-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">SKU / Item Code *</label>
                  <input type="text" value={formData.sku} onChange={e => setFormData(p => ({ ...p, sku: e.target.value }))} className="input-field" placeholder="e.g. KU-101" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Category</label>
                  <div className="relative">
                    <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} className="select-field">
                      <option value="">Select…</option>
                      {CATS.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Product Name *</label>
                <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="input-field" placeholder="Full product name" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Stock Qty</label>
                  <input type="number" min="0" value={formData.available} onChange={e => setFormData(p => ({ ...p, available: e.target.value }))} className="input-field" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Unit</label>
                  <div className="relative">
                    <select value={formData.unit} onChange={e => setFormData(p => ({ ...p, unit: e.target.value }))} className="select-field">
                      {UNITS.map(u => <option key={u}>{u}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Min Stock Level</label>
                  <input type="number" min="0" value={formData.minStock} onChange={e => setFormData(p => ({ ...p, minStock: e.target.value }))} className="input-field" placeholder="5" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Price (₹)</label>
                <input type="number" min="0" value={formData.price} onChange={e => setFormData(p => ({ ...p, price: e.target.value }))} className="input-field" placeholder="0" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-surface-100 bg-surface-50 rounded-b-2xl">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
                {saving ? 'Saving…' : editItem ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Variant Manager Modal */}
      {showVariantMgr && (
        <div className="modal-overlay" onClick={() => setShowVariantMgr(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="flex items-center justify-between p-6 border-b border-surface-100">
              <h3 className="text-lg font-display font-bold text-surface-800">
                🎨 Manage Variants: {showVariantMgr.name}
              </h3>
              <button onClick={() => setShowVariantMgr(null)} className="p-2 rounded-lg hover:bg-surface-100">
                <X className="w-5 h-5 text-surface-500" />
              </button>
            </div>
            <div className="p-6">
              <VariantManager
                product={showVariantMgr}
                onSave={async (updatedProduct) => {
                  try {
                    await updateProduct(updatedProduct.id, updatedProduct);
                    await loadInventory();
                    setShowVariantMgr(null);
                  } catch (e) {
                    alert('Failed to save variants');
                  }
                }}
                onCancel={() => setShowVariantMgr(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
