import React, { useState, useEffect } from 'react';
import { getCustomers, addCustomer } from '../services/api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('All segments');
  
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', segment: 'New', status: 'Active' });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const res = await getCustomers();
      setCustomers(res?.data?.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) return;
    try {
      await addCustomer(newCustomer);
      loadCustomers();
      setNewCustomer({ name: '', phone: '', email: '', segment: 'New', status: 'Active' });
    } catch (e) {
      console.error(e);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.phone.includes(searchQuery) || 
                          c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSegment = segmentFilter === 'All segments' || c.segment === segmentFilter;
    return matchesSearch && matchesSegment;
  });

  return (
    <div className="space-y-6">
      {/* Header Area matching screenshot */}
      <div className="flex justify-between items-center bg-white border-b border-gray-50 pb-4 mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Customer Management</h1>
          <p className="text-xs text-gray-400">Manage customer records, loyalty, and purchase history.</p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Total Customers</p>
          <p className="text-3xl font-bold text-gray-800 mb-1">3</p>
          <p className="text-[10px] text-gray-400">Active customer records</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">VIP Members</p>
          <p className="text-3xl font-bold text-gray-800 mb-1">1</p>
          <p className="text-[10px] text-gray-400">Loyalty program status</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Repeat Buyers</p>
          <p className="text-3xl font-bold text-gray-800 mb-1">1</p>
          <p className="text-[10px] text-gray-400">Return customers this month</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Open Queries</p>
          <p className="text-3xl font-bold text-gray-800 mb-1">0</p>
          <p className="text-[10px] text-gray-400">Pending support tickets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Customer Directory */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h2 className="text-lg font-bold text-gray-800">Customer Directory</h2>
            <p className="text-xs text-gray-400 mt-1">Search, filter, and review customer history.</p>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 bg-[#f9f8f9] rounded-xl flex items-center px-4 py-2.5">
                <input
                  type="text"
                  placeholder="Search by name, phone, email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm w-full outline-none text-gray-600 placeholder:text-gray-400"
                />
              </div>
              <select 
                className="flex-[0.5] bg-[#f9f8f9] rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none appearance-none"
                value={segmentFilter}
                onChange={(e) => setSegmentFilter(e.target.value)}
              >
                <option>All segments</option>
                <option>Vip</option>
                <option>Repeat</option>
                <option>New</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-gray-400 uppercase font-bold tracking-wider border-b border-gray-50">
                  <tr>
                    <th className="pb-3 font-medium px-2">NAME</th>
                    <th className="pb-3 font-medium px-2">PHONE</th>
                    <th className="pb-3 font-medium px-2 text-center">SEGMENT</th>
                    <th className="pb-3 font-medium px-2 text-center">STATUS</th>
                    <th className="pb-3 font-medium px-2 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredCustomers.map(customer => (
                    <tr key={customer.id}>
                      <td className="py-4 px-2 text-gray-800 font-semibold">{customer.name}</td>
                      <td className="py-4 px-2 text-gray-600">{customer.phone}</td>
                      <td className="py-4 px-2 text-center">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                          customer.segment === 'Vip' ? 'bg-green-50 text-green-600' :
                          customer.segment === 'Repeat' ? 'bg-pink-50 text-pink-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {customer.segment}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                          customer.status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                          'bg-rose-50 text-rose-600'
                        }`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <button className="text-[10px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-1.5 rounded-full transition-colors border border-gray-200">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: New Customer */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h2 className="text-lg font-bold text-gray-800">New Customer</h2>
            <p className="text-xs text-gray-400 mt-1">Add a customer record for follow-up and rewards.</p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Name</label>
              <input 
                type="text"
                placeholder="Sana Kapoor"
                value={newCustomer.name}
                onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                className="w-full bg-[#f9f8f9] rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none border border-gray-100 focus:border-pink-300"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Phone</label>
              <input 
                type="tel"
                placeholder="+91 98765 43210"
                value={newCustomer.phone}
                onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                className="w-full bg-[#f9f8f9] rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none border border-gray-100 focus:border-pink-300"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Email</label>
              <input 
                type="email"
                placeholder="sana@example.com"
                value={newCustomer.email}
                onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
                className="w-full bg-[#f9f8f9] rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none border border-gray-100 focus:border-pink-300"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Segment</label>
              <select 
                className="w-full bg-[#f9f8f9] rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none border border-gray-100 appearance-none"
                value={newCustomer.segment}
                onChange={e => setNewCustomer({...newCustomer, segment: e.target.value})}
              >
                <option>New</option>
                <option>Repeat</option>
                <option>Vip</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Notes</label>
              <textarea 
                placeholder="Customer preferences or purchase history..."
                rows={4}
                className="w-full bg-[#f9f8f9] rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none border border-gray-100 resize-none"
              ></textarea>
            </div>
            
            <div className="flex items-center gap-3 pt-2">
              <button onClick={handleAddCustomer} className="bg-[#b56e8d] hover:bg-[#a0607b] text-white text-xs font-bold px-6 py-3 rounded-xl transition-colors">
                Add Customer
              </button>
              <button 
                onClick={() => setNewCustomer({ name: 'Sample Customer', phone: '9999999999', email: 'sample@example.com', segment: 'New', status: 'Active' })}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold px-6 py-3 rounded-xl transition-colors"
              >
                Sample
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
