import React, { useState, useEffect } from 'react';
import { getBills } from '../services/api';
import { Search, Receipt, Printer, MessageCircle, X } from 'lucide-react';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const res = await getBills();
      setInvoices(res.data.reverse()); // latest first
    } catch (e) {
      console.error(e);
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    inv.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = (inv) => {
    const msg = `Hello ${inv.customer}! Your bill (${inv.id}) from Anyaa Textiles is ₹${inv.amount.toLocaleString('en-IN')}. Thank you for shopping with us!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white border-b border-gray-50 pb-4 mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">All Invoices</h1>
          <p className="text-xs text-gray-400">View, print, and share your generated bills.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 bg-[#f9f8f9] rounded-xl flex items-center px-4 py-2.5 max-w-md">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search by Invoice ID or Customer Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm w-full outline-none text-gray-600 placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="p-6 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-gray-400 uppercase font-bold tracking-wider border-b border-gray-50">
              <tr>
                <th className="pb-3 font-medium px-2">INVOICE ID</th>
                <th className="pb-3 font-medium px-2">CUSTOMER</th>
                <th className="pb-3 font-medium px-2 text-center">ITEMS</th>
                <th className="pb-3 font-medium px-2 text-right">AMOUNT</th>
                <th className="pb-3 font-medium px-2 text-center">PAYMENT</th>
                <th className="pb-3 font-medium px-2 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td className="py-4 px-2 text-gray-800 font-bold">{inv.id}</td>
                    <td className="py-4 px-2 text-gray-600">{inv.customer}</td>
                    <td className="py-4 px-2 text-center font-medium">{inv.items}</td>
                    <td className="py-4 px-2 text-right text-gray-800 font-bold">₹{inv.amount.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-2 text-center">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                        inv.payment === 'Cash' ? 'bg-green-50 text-green-600' :
                        inv.payment === 'UPI' ? 'bg-purple-50 text-purple-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {inv.payment}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right space-x-2">
                      <button 
                        onClick={() => setSelectedInvoice(inv)}
                        className="text-[10px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-1.5 rounded-full transition-colors border border-gray-200"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-400 text-sm">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm print:bg-white print:backdrop-blur-none p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-slide-up print:shadow-none print:w-full print:max-w-none">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center print:hidden">
              <h2 className="text-lg font-bold text-gray-800">Invoice Details</h2>
              <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-8 pb-10 print:p-0">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 print:hidden">
                  <Receipt className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">Anyaa Textiles</h1>
                <p className="text-xs text-gray-500 mt-1">123, T Nagar Main Road, Chennai - 600017</p>
                <div className="mt-4 inline-block bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100 print:border-none">
                  <p className="text-sm font-bold text-gray-800">{selectedInvoice.id}</p>
                </div>
              </div>

              <div className="space-y-3 mb-8 text-sm">
                <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                  <span className="text-gray-500">Customer</span>
                  <span className="font-semibold text-gray-800">{selectedInvoice.customer}</span>
                </div>
                <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                  <span className="text-gray-500">Total Items</span>
                  <span className="font-semibold text-gray-800">{selectedInvoice.items}</span>
                </div>
                <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                  <span className="text-gray-500">Payment Method</span>
                  <span className="font-semibold text-gray-800">{selectedInvoice.payment}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-gray-800 font-bold">Total Paid</span>
                  <span className="font-bold text-xl text-gray-800">₹{selectedInvoice.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 print:hidden">
                <button 
                  onClick={handlePrint}
                  className="py-3 bg-[#6e85c2] hover:bg-[#5a71ad] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button 
                  onClick={() => handleWhatsApp(selectedInvoice)}
                  className="py-3 bg-[#69b870] hover:bg-[#56a55d] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
