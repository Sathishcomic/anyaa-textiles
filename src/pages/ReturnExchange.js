import React, { useState, useEffect, useMemo } from 'react';
import { getReturns, addReturn, updateReturn, getBills, getProducts, updateProduct } from '../services/api';

export default function ReturnExchange() {
  const [requests,    setRequests]    = useState([]);
  const [bills,       setBills]       = useState([]);
  const [products,    setProducts]    = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter,setStatusFilter]= useState('All statuses');
  const [typeFilter,  setTypeFilter]  = useState('All types');
  const [selectedId,  setSelectedId]  = useState(null);
  const [processing,  setProcessing]  = useState(false);

  const emptyReq = { invoice: '', customer: '', item: '', type: 'Return', qty: 1, reason: 'Size issue', notes: '', status: 'Pending' };
  const [newReq, setNewReq] = useState(emptyReq);

  /* ── Selected invoice's items ── */
  const selectedBill = useMemo(() => bills.find(b => b.id === newReq.invoice), [bills, newReq.invoice]);
  const billItems = selectedBill?.lineItems?.filter(li => li.name && li.name.trim()) || [];

  /* ── Load data ── */
  const loadAll = async () => {
    try {
      const [retRes, billRes, prodRes] = await Promise.all([getReturns(), getBills(), getProducts()]);
      setRequests(retRes.data);
      setBills([...billRes.data].reverse());
      setProducts(prodRes.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadAll(); }, []);

  /* ── When invoice changes, auto-fill customer ── */
  useEffect(() => {
    if (selectedBill) {
      setNewReq(p => ({ ...p, customer: selectedBill.customer || '', item: '' }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newReq.invoice]);

  /* ── Filtered list ── */
  const filteredRequests = requests.filter(r => {
    const matchSearch = (r.invoice || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (r.item    || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (r.customer|| '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'All statuses' || r.status === statusFilter;
    const matchType   = typeFilter   === 'All types'    || r.type   === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  /* ── Stats ── */
  const stats = useMemo(() => ({
    total:     requests.length,
    pending:   requests.filter(r => r.status === 'Pending').length,
    exchanges: requests.filter(r => r.type === 'Exchange').length,
  }), [requests]);

  /* ── Create request ── */
  const handleAddRequest = async () => {
    if (!newReq.invoice || !newReq.item) return;
    try {
      await addReturn(newReq);
      setNewReq(emptyReq);
      await loadAll();
    } catch (e) { console.error(e); }
  };

  /* ── Complete selected + restore stock for Returns ── */
  const handleComplete = async () => {
    if (!selectedId) return;
    const req = requests.find(r => r.id === selectedId);
    if (!req) return;
    setProcessing(true);
    try {
      await updateReturn(selectedId, { ...req, status: 'Completed' });

      /* Restore stock only for Returns (not Exchange — exchanged items come back as different item) */
      if (req.type === 'Return' && req.item) {
        // Find the product by name
        const prod = products.find(p => p.name.toLowerCase() === (req.item || '').toLowerCase());
        if (prod) {
          const restoredStock = Number(prod.stock ?? prod.available ?? 0) + Number(req.qty || 1);
          await updateProduct(prod.id, { ...prod, stock: restoredStock });
        }
      }

      setSelectedId(null);
      await loadAll();
    } catch (e) { alert('Operation failed'); }
    setProcessing(false);
  };

  const handleReset = async () => {
    setSearchQuery(''); setStatusFilter('All statuses'); setTypeFilter('All types'); setSelectedId(null);
  };

  /* ── Bill dropdown options ── */
  const billOptions = bills.filter(b => b.lineItems && b.lineItems.some(li => li.name && li.name.trim()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Returns &amp; Exchange</h1>
          <p className="text-xs text-gray-400 mt-1">Process refunds, exchanges, and customer claims quickly.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Requests', value: stats.total,     badge: 'All cases',     badgeClass: 'bg-purple-50 text-purple-600' },
          { label: 'Pending',        value: stats.pending,   badge: 'Open cases',    badgeClass: 'bg-orange-50 text-orange-600' },
          { label: 'Exchanges',      value: stats.exchanges, badge: 'Items swapped', badgeClass: 'bg-blue-50 text-blue-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">{s.label}</p>
            <p className="text-3xl font-bold text-gray-800 mb-2">{s.value}</p>
            <span className={`${s.badgeClass} text-[10px] font-bold px-3 py-1 rounded-full`}>{s.badge}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Request Log ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Request Log</h2>
                <p className="text-xs text-gray-400 mt-1">Search by invoice, customer or item.</p>
              </div>
              <button onClick={handleReset} className="bg-[#b56e8d] hover:bg-[#a0607b] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">Reset</button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-[1.5] bg-[#f9f8f9] rounded-xl flex items-center px-4 py-2.5">
                  <input
                    type="text" placeholder="Search requests…"
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="bg-transparent text-sm w-full outline-none text-gray-600 placeholder:text-gray-400"
                  />
                </div>
                <select className="flex-1 bg-[#f9f8f9] rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none appearance-none" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option>All statuses</option>
                  <option>Pending</option>
                  <option>Approved</option>
                  <option>Completed</option>
                </select>
                <select className="flex-1 bg-[#f9f8f9] rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none appearance-none" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                  <option>All types</option>
                  <option>Return</option>
                  <option>Exchange</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-gray-400 uppercase font-bold tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="pb-3 px-2">Invoice</th>
                      <th className="pb-3 px-2">Customer</th>
                      <th className="pb-3 px-2">Item</th>
                      <th className="pb-3 px-2 text-center">Type</th>
                      <th className="pb-3 px-2 text-center">Status</th>
                      <th className="pb-3 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredRequests.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-10 text-gray-300 text-sm">No requests found.</td></tr>
                    ) : filteredRequests.map(req => (
                      <tr key={req.id}>
                        <td className="py-4 px-2 text-gray-800 font-semibold font-mono text-xs">{req.invoice}</td>
                        <td className="py-4 px-2 text-gray-600 text-xs">{req.customer || '—'}</td>
                        <td className="py-4 px-2 text-gray-600">{req.item}</td>
                        <td className="py-4 px-2 text-center">
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${req.type === 'Return' ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'}`}>
                            {req.type}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-center">
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                            req.status === 'Pending'   ? 'bg-orange-50 text-orange-600' :
                            req.status === 'Approved'  ? 'bg-emerald-50 text-emerald-600' :
                                                         'bg-purple-50 text-purple-600'
                          }`}>{req.status}</span>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <button
                            onClick={() => setSelectedId(req.id)}
                            className={`text-[10px] font-bold px-4 py-1.5 rounded-full transition-colors border ${
                              selectedId === req.id
                                ? 'bg-pink-100 text-pink-600 border-pink-200'
                                : 'text-gray-600 bg-gray-100 hover:bg-gray-200 border-gray-200'
                            }`}
                          >
                            {selectedId === req.id ? 'Selected ✓' : 'Select'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Details & Complete */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex justify-between items-center p-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Details &amp; Notes</h2>
              {selectedId ? (() => {
                const r = requests.find(x => x.id === selectedId);
                return r ? (
                  <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                    <p><strong>Invoice:</strong> {r.invoice} &nbsp;|&nbsp; <strong>Customer:</strong> {r.customer || '—'}</p>
                    <p><strong>Item:</strong> {r.item} &nbsp;|&nbsp; <strong>Qty:</strong> {r.qty} &nbsp;|&nbsp; <strong>Reason:</strong> {r.reason}</p>
                    {r.notes && <p><strong>Notes:</strong> {r.notes}</p>}
                    {r.type === 'Return' && <p className="text-emerald-600 font-semibold mt-1">✓ Stock will be restored on completion</p>}
                  </div>
                ) : null;
              })() : (
                <p className="text-xs text-gray-400 mt-1">Select a request from the list above.</p>
              )}
            </div>
            <button
              onClick={handleComplete}
              disabled={!selectedId || processing}
              className={`text-white text-xs font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap ${selectedId && !processing ? 'bg-[#69b870] hover:bg-[#56a55d]' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              {processing ? 'Processing…' : 'Complete Selected'}
            </button>
          </div>
        </div>

        {/* ── Right: New Request ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-fit">
          <div className="p-6 border-b border-gray-50">
            <h2 className="text-lg font-bold text-gray-800">New Request</h2>
            <p className="text-xs text-gray-400 mt-1">Pick an invoice to auto-fill details.</p>
          </div>
          <div className="p-6 space-y-4">

            {/* Invoice Dropdown */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Invoice Number</label>
              <select
                value={newReq.invoice}
                onChange={e => setNewReq(p => ({ ...p, invoice: e.target.value, item: '' }))}
                className="w-full bg-[#f9f8f9] rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none border border-gray-100 focus:border-pink-300 appearance-none"
              >
                <option value="">-- Select Invoice --</option>
                {billOptions.map(b => (
                  <option key={b.id} value={b.id}>{b.id} — {b.customer}</option>
                ))}
              </select>
            </div>

            {/* Customer (auto-filled, editable) */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Customer Name</label>
              <input
                type="text" placeholder="Auto-filled from invoice"
                value={newReq.customer}
                onChange={e => setNewReq(p => ({ ...p, customer: e.target.value }))}
                className="w-full bg-[#f9f8f9] rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none border border-gray-100 focus:border-pink-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Item dropdown from bill items */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Item</label>
                {billItems.length > 0 ? (
                  <select
                    value={newReq.item}
                    onChange={e => setNewReq(p => ({ ...p, item: e.target.value }))}
                    className="w-full bg-[#f9f8f9] rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none border border-gray-100 appearance-none"
                  >
                    <option value="">-- Pick item --</option>
                    {billItems.map((li, i) => (
                      <option key={i} value={li.name}>{li.name} (x{li.qty})</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text" placeholder="Item name"
                    value={newReq.item}
                    onChange={e => setNewReq(p => ({ ...p, item: e.target.value }))}
                    className="w-full bg-[#f9f8f9] rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none border border-gray-100 focus:border-pink-300"
                  />
                )}
              </div>
              {/* Type */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Request Type</label>
                <select
                  value={newReq.type}
                  onChange={e => setNewReq(p => ({ ...p, type: e.target.value }))}
                  className="w-full bg-[#f9f8f9] rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none border border-gray-100 appearance-none"
                >
                  <option>Return</option>
                  <option>Exchange</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Quantity</label>
                <input
                  type="number" min="1" placeholder="1"
                  value={newReq.qty}
                  onChange={e => setNewReq(p => ({ ...p, qty: Number(e.target.value) }))}
                  className="w-full bg-[#f9f8f9] rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none border border-gray-100 focus:border-pink-300"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Reason</label>
                <select
                  value={newReq.reason}
                  onChange={e => setNewReq(p => ({ ...p, reason: e.target.value }))}
                  className="w-full bg-[#f9f8f9] rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none border border-gray-100 appearance-none"
                >
                  <option>Size issue</option>
                  <option>Defective</option>
                  <option>Wrong item</option>
                  <option>Color mismatch</option>
                  <option>Customer changed mind</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Notes</label>
              <textarea
                rows={3} placeholder="Additional details…"
                value={newReq.notes}
                onChange={e => setNewReq(p => ({ ...p, notes: e.target.value }))}
                className="w-full bg-[#f9f8f9] rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none border border-gray-100 resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleAddRequest}
                disabled={!newReq.invoice || !newReq.item}
                className={`text-white text-xs font-bold px-6 py-3 rounded-xl transition-colors ${newReq.invoice && newReq.item ? 'bg-[#b56e8d] hover:bg-[#a0607b]' : 'bg-gray-300 cursor-not-allowed'}`}
              >
                Create Request
              </button>
              <button
                onClick={() => setNewReq(emptyReq)}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold px-6 py-3 rounded-xl transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
