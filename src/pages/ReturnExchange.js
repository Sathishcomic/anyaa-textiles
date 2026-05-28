import React, { useState, useEffect } from 'react';
import { getReturns, addReturn, updateReturn } from '../services/api';

export default function ReturnExchange() {
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [typeFilter, setTypeFilter] = useState('All types');
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const [newRequest, setNewRequest] = useState({ invoice: '', customer: '', item: '', type: 'Return', qty: 1, reason: 'Size issue', notes: '', status: 'Pending' });

  useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = async () => {
    try {
      const res = await getReturns();
      setRequests(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddRequest = async () => {
    if (!newRequest.invoice || !newRequest.item) return;
    try {
      await addReturn(newRequest);
      loadReturns();
      setNewRequest({ invoice: '', customer: '', item: '', type: 'Return', qty: 1, reason: 'Size issue', notes: '', status: 'Pending' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompleteSelected = async () => {
    if (!selectedRequestId) return;
    const req = requests.find(r => r.id === selectedRequestId);
    if (!req) return;
    try {
      await updateReturn(selectedRequestId, { ...req, status: 'Completed' });
      setSelectedRequestId(null);
      loadReturns();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.invoice.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.item.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All statuses' || r.status === statusFilter;
    const matchesType = typeFilter === 'All types' || r.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header Area matching screenshot */}
      <div className="flex justify-between items-center bg-white border-b border-gray-50 pb-4 mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Returns & Exchange</h1>
          <p className="text-xs text-gray-400">Process refunds, exchanges, and customer claims quickly.</p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Total Requests</p>
          <p className="text-3xl font-bold text-gray-800 mb-1">3</p>
          <div className="mt-2"><span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-3 py-1 rounded-full">Open cases</span></div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Refund Value</p>
          <p className="text-3xl font-bold text-gray-800 mb-1">₹1,870</p>
          <div className="mt-2"><span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-3 py-1 rounded-full border border-gray-200">Processed amount</span></div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Exchanges</p>
          <p className="text-3xl font-bold text-gray-800 mb-1">1</p>
          <div className="mt-2"><span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-3 py-1 rounded-full border border-gray-200">Items swapped</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Request Log */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Request Log</h2>
                <p className="text-xs text-gray-400 mt-1">Search by invoice, item or status.</p>
              </div>
              <button className="bg-[#b56e8d] hover:bg-[#a0607b] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
                Reset
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-[1.5] bg-[#f9f8f9] rounded-xl flex items-center px-4 py-2.5">
                  <input
                    type="text"
                    placeholder="Search requests"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-sm w-full outline-none text-gray-600 placeholder:text-gray-400"
                  />
                </div>
                <select 
                  className="flex-1 bg-[#f9f8f9] rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none appearance-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option>All statuses</option>
                  <option>Pending</option>
                  <option>Approved</option>
                  <option>Completed</option>
                </select>
                <select 
                  className="flex-1 bg-[#f9f8f9] rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none appearance-none"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option>All types</option>
                  <option>Return</option>
                  <option>Exchange</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-gray-400 uppercase font-bold tracking-wider border-b border-gray-50">
                    <tr>
                      <th className="pb-3 font-medium px-2">INVOICE</th>
                      <th className="pb-3 font-medium px-2">ITEM</th>
                      <th className="pb-3 font-medium px-2 text-center">TYPE</th>
                      <th className="pb-3 font-medium px-2 text-center">STATUS</th>
                      <th className="pb-3 font-medium px-2 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredRequests.map(req => (
                      <tr key={req.id}>
                        <td className="py-4 px-2 text-gray-800 font-semibold">{req.invoice}</td>
                        <td className="py-4 px-2 text-gray-600">{req.item}</td>
                        <td className="py-4 px-2 text-center">
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                            req.type === 'Return' ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {req.type}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-center">
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                            req.status === 'Pending' ? 'bg-orange-50 text-orange-600' :
                            req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                            'bg-purple-50 text-purple-600'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <button 
                            onClick={() => setSelectedRequestId(req.id)}
                            className={`text-[10px] font-bold px-4 py-1.5 rounded-full transition-colors border ${selectedRequestId === req.id ? 'bg-pink-100 text-pink-600 border-pink-200' : 'text-gray-600 bg-gray-100 hover:bg-gray-200 border-gray-200'}`}
                          >
                            {selectedRequestId === req.id ? 'Selected' : 'Select'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Details & Notes section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex justify-between items-center p-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Details & Notes</h2>
              <p className="text-xs text-gray-400 mt-1">Review selected request and update the status.</p>
            </div>
            <button 
              onClick={handleCompleteSelected}
              className={`text-white text-xs font-bold px-6 py-3 rounded-xl transition-colors ${selectedRequestId ? 'bg-[#69b870] hover:bg-[#56a55d]' : 'bg-gray-300 cursor-not-allowed'}`}
              disabled={!selectedRequestId}
            >
              Complete Selected
            </button>
          </div>
        </div>

        {/* Right: New Request */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-fit">
          <div className="p-6 border-b border-gray-50">
            <h2 className="text-lg font-bold text-gray-800">New Request</h2>
            <p className="text-xs text-gray-400 mt-1">Create a return or exchange request.</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Invoice Number</label>
                <input 
                  type="text"
                  placeholder="INV-2024..."
                  value={newRequest.invoice}
                  onChange={e => setNewRequest({...newRequest, invoice: e.target.value})}
                  className="w-full bg-[#f9f8f9] rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none border border-gray-100 focus:border-pink-300"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Customer Name</label>
                <input 
                  type="text"
                  placeholder="Priya Gupta"
                  value={newRequest.customer}
                  onChange={e => setNewRequest({...newRequest, customer: e.target.value})}
                  className="w-full bg-[#f9f8f9] rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none border border-gray-100 focus:border-pink-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Item</label>
                <input 
                  type="text"
                  placeholder="Floral Kurti"
                  value={newRequest.item}
                  onChange={e => setNewRequest({...newRequest, item: e.target.value})}
                  className="w-full bg-[#f9f8f9] rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none border border-gray-100 focus:border-pink-300"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Request Type</label>
                <select 
                  className="w-full bg-[#f9f8f9] rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none border border-gray-100 appearance-none"
                  value={newRequest.type}
                  onChange={e => setNewRequest({...newRequest, type: e.target.value})}
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
                  type="number"
                  placeholder="1"
                  value={newRequest.qty}
                  onChange={e => setNewRequest({...newRequest, qty: Number(e.target.value)})}
                  className="w-full bg-[#f9f8f9] rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none border border-gray-100 focus:border-pink-300"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Reason</label>
                <select 
                  className="w-full bg-[#f9f8f9] rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none border border-gray-100 appearance-none"
                  value={newRequest.reason}
                  onChange={e => setNewRequest({...newRequest, reason: e.target.value})}
                >
                  <option>Size issue</option>
                  <option>Defective</option>
                  <option>Wrong item</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Notes</label>
              <textarea 
                placeholder="Additional details..."
                rows={4}
                value={newRequest.notes}
                onChange={e => setNewRequest({...newRequest, notes: e.target.value})}
                className="w-full bg-[#f9f8f9] rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none border border-gray-100 resize-none"
              ></textarea>
            </div>
            
            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={handleAddRequest}
                className="bg-[#b56e8d] hover:bg-[#a0607b] text-white text-xs font-bold px-6 py-3 rounded-xl transition-colors"
              >
                Create Request
              </button>
              <button 
                onClick={() => setNewRequest({ invoice: 'INV-SAMPLE', customer: 'Sample Name', item: 'Sample Item', type: 'Return', qty: 1, reason: 'Size issue', notes: 'Sample note', status: 'Pending' })}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold px-6 py-3 rounded-xl transition-colors"
              >
                Sample Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
