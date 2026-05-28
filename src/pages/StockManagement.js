import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Package,
  AlertTriangle,
  ChevronDown,
  X,
  Download,
  ArrowUpDown
} from 'lucide-react';

const initialInventory = [
  { id: 1, sku: 'SKU-SS-001', name: 'Silk Saree - Kanchipuram', type: 'Silk', available: 25, unit: 'pcs', price: 5500, minStock: 10, status: 'In Stock' },
  { id: 2, sku: 'SKU-CF-002', name: 'Cotton Fabric - 40s Count', type: 'Cotton', available: 500, unit: 'meters', price: 280, minStock: 50, status: 'In Stock' },
  { id: 3, sku: 'SKU-PB-003', name: 'Polyester Blend Fabric', type: 'Polyester', available: 320, unit: 'meters', price: 180, minStock: 50, status: 'In Stock' },
  { id: 4, sku: 'SKU-CM-004', name: 'Chiffon Material - Pure', type: 'Chiffon', available: 8, unit: 'meters', price: 450, minStock: 20, status: 'Low Stock' },
  { id: 5, sku: 'SKU-GS-005', name: 'Georgette Saree', type: 'Georgette', available: 40, unit: 'pcs', price: 2200, minStock: 15, status: 'In Stock' },
  { id: 6, sku: 'SKU-LF-006', name: 'Linen Fabric - Premium', type: 'Linen', available: 200, unit: 'meters', price: 620, minStock: 30, status: 'In Stock' },
  { id: 7, sku: 'SKU-VM-007', name: 'Velvet Material', type: 'Velvet', available: 5, unit: 'meters', price: 850, minStock: 15, status: 'Low Stock' },
  { id: 8, sku: 'SKU-CK-008', name: 'Cotton Kurta Piece', type: 'Cotton', available: 100, unit: 'pcs', price: 350, minStock: 20, status: 'In Stock' },
  { id: 9, sku: 'SKU-ZB-009', name: 'Zari Border Roll', type: 'Zari', available: 3, unit: 'meters', price: 120, minStock: 25, status: 'Low Stock' },
  { id: 10, sku: 'SKU-DB-010', name: 'Dupatta - Banarasi', type: 'Silk', available: 35, unit: 'pcs', price: 1800, minStock: 10, status: 'In Stock' },
  { id: 11, sku: 'SKU-RF-011', name: 'Rayon Fabric - Printed', type: 'Rayon', available: 0, unit: 'meters', price: 220, minStock: 30, status: 'Out of Stock' },
  { id: 12, sku: 'SKU-ET-012', name: 'Embroidery Thread Set', type: 'Thread', available: 200, unit: 'sets', price: 95, minStock: 50, status: 'In Stock' },
];

export default function StockManagement() {
  const [inventory, setInventory] = useState(initialInventory);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [formData, setFormData] = useState({
    sku: '', name: '', type: '', available: '', unit: 'meters', price: '', minStock: ''
  });

  const filteredInventory = useMemo(() => {
    let filtered = inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [inventory, searchQuery, filterStatus, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getStatusBadge = (item) => {
    if (item.available === 0) return <span className="badge-danger">Out of Stock</span>;
    if (item.available <= item.minStock) return <span className="badge-warning">Low Stock</span>;
    return <span className="badge-success">In Stock</span>;
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setFormData({
      sku: item.sku, name: item.name, type: item.type,
      available: item.available, unit: item.unit, price: item.price, minStock: item.minStock
    });
    setShowAddModal(true);
  };

  const openAddModal = () => {
    setEditItem(null);
    setFormData({ sku: '', name: '', type: '', available: '', unit: 'meters', price: '', minStock: '' });
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.sku) return;
    const available = Number(formData.available);
    const minStock = Number(formData.minStock);
    const status = available === 0 ? 'Out of Stock' : available <= minStock ? 'Low Stock' : 'In Stock';
    
    if (editItem) {
      setInventory(prev => prev.map(item =>
        item.id === editItem.id
          ? { ...item, ...formData, available, price: Number(formData.price), minStock, status }
          : item
      ));
    } else {
      const newItem = {
        id: Date.now(),
        ...formData,
        available,
        price: Number(formData.price),
        minStock,
        status
      };
      setInventory(prev => [...prev, newItem]);
    }
    setShowAddModal(false);
  };

  const stockSummary = useMemo(() => ({
    total: inventory.length,
    inStock: inventory.filter(i => i.status === 'In Stock').length,
    lowStock: inventory.filter(i => i.status === 'Low Stock').length,
    outOfStock: inventory.filter(i => i.status === 'Out of Stock').length,
  }), [inventory]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Items', value: stockSummary.total, color: 'from-primary-500 to-primary-600', icon: Package },
          { label: 'In Stock', value: stockSummary.inStock, color: 'from-emerald-500 to-emerald-600', icon: Package },
          { label: 'Low Stock', value: stockSummary.lowStock, color: 'from-amber-500 to-orange-500', icon: AlertTriangle },
          { label: 'Out of Stock', value: stockSummary.outOfStock, color: 'from-rose-500 to-rose-600', icon: AlertTriangle },
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
              type="text"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field !pl-10"
            />
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="select-field !w-auto !pr-10 text-sm"
            >
              <option value="All">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary text-sm flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button onClick={openAddModal} className="btn-primary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Stock
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-50 border-b border-surface-200">
              {[
                { key: 'sku', label: 'SKU / Item Code' },
                { key: 'name', label: 'Product Name' },
                { key: 'type', label: 'Fabric Type' },
                { key: 'available', label: 'Available' },
                { key: 'price', label: 'Price (₹)' },
                { key: null, label: 'Status' },
                { key: null, label: 'Actions' },
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
            {filteredInventory.map(item => (
              <tr
                key={item.id}
                className={`hover:bg-surface-50 transition-colors ${
                  item.available <= item.minStock ? 'bg-amber-50/30' : ''
                } ${item.available === 0 ? '!bg-rose-50/30' : ''}`}
              >
                <td className="px-5 py-4 font-mono text-xs text-surface-600">{item.sku}</td>
                <td className="px-5 py-4">
                  <p className="font-medium text-surface-800">{item.name}</p>
                </td>
                <td className="px-5 py-4 text-surface-600">{item.type}</td>
                <td className="px-5 py-4">
                  <span className={`font-semibold ${
                    item.available === 0 ? 'text-rose-600' :
                    item.available <= item.minStock ? 'text-amber-600' : 'text-surface-800'
                  }`}>
                    {item.available} {item.unit}
                  </span>
                  <span className="text-xs text-surface-400 block">min: {item.minStock}</span>
                </td>
                <td className="px-5 py-4 font-semibold text-surface-800">₹{item.price.toLocaleString('en-IN')}</td>
                <td className="px-5 py-4">{getStatusBadge(item)}</td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-surface-100">
              <h3 className="text-lg font-display font-bold text-surface-800">
                {editItem ? 'Edit Stock Item' : 'Add New Stock'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg hover:bg-surface-100">
                <X className="w-5 h-5 text-surface-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">SKU / Item Code</label>
                  <input type="text" value={formData.sku} onChange={e => setFormData(prev => ({ ...prev, sku: e.target.value }))} className="input-field" placeholder="SKU-XX-000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Fabric Type</label>
                  <input type="text" value={formData.type} onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))} className="input-field" placeholder="e.g., Silk, Cotton" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Product Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} className="input-field" placeholder="Full product name" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Available Qty</label>
                  <input type="number" value={formData.available} onChange={e => setFormData(prev => ({ ...prev, available: e.target.value }))} className="input-field" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Unit</label>
                  <div className="relative">
                    <select value={formData.unit} onChange={e => setFormData(prev => ({ ...prev, unit: e.target.value }))} className="select-field">
                      <option value="meters">Meters</option>
                      <option value="pcs">Pieces</option>
                      <option value="sets">Sets</option>
                      <option value="rolls">Rolls</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Min Stock Level</label>
                  <input type="number" value={formData.minStock} onChange={e => setFormData(prev => ({ ...prev, minStock: e.target.value }))} className="input-field" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Price (₹)</label>
                <input type="number" value={formData.price} onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))} className="input-field" placeholder="0.00" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-surface-100 bg-surface-50 rounded-b-2xl">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={handleSave} className="btn-primary text-sm">{editItem ? 'Update Stock' : 'Add Stock'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
