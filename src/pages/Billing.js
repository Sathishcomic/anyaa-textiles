import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { addBill, getCustomers } from '../services/api';
import {
  Search,
  ShoppingCart,
  Receipt,
  X,
  Plus,
  Minus,
  MessageCircle
} from 'lucide-react';

const productCatalog = [
  { id: 1, name: 'Rose Garden Kurti', sku: 'KU-101 Kurti', price: 650, tax: 5, category: 'Kurti', stock: 25 },
  { id: 2, name: 'Silk Saree - Maroon', sku: 'SA-207 Saree', price: 2780, tax: 12, category: 'Saree', stock: 40 },
  { id: 3, name: 'Stretch Leggings', sku: 'LG-053 Leggings', price: 220, tax: 5, category: 'Leggings', stock: 150 },
  { id: 4, name: 'Chiffon Top', sku: 'TO-089 Tops', price: 420, tax: 5, category: 'Tops', stock: 80 },
  { id: 5, name: 'Daywear Nighty', sku: 'NY-025 Nighty', price: 380, tax: 5, category: 'Nighty', stock: 100 },
  { id: 6, name: 'Silk Chudithar Set', sku: 'CH-063 Chudithar', price: 980, tax: 12, category: 'Chudithar', stock: 35 },
  { id: 7, name: 'Embroidered Kurti', sku: 'KU-114 Kurti', price: 720, tax: 5, category: 'Kurti', stock: 60 },
  { id: 8, name: 'Mysore Cotton Saree', sku: 'SA-110 Saree', price: 1450, tax: 12, category: 'Saree', stock: 45 },
  { id: 9, name: 'Printed Leggings', sku: 'LG-086 Leggings', price: 260, tax: 5, category: 'Leggings', stock: 120 },
  { id: 10, name: 'Mesh Top', sku: 'TO-004 Tops', price: 360, tax: 5, category: 'Tops', stock: 55 },
];

export default function Billing() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [cart, setCart] = useState([]);
  const [discountPercent, setDiscountPercent] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [showSuccess, setShowSuccess] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('Walk-in Customer');
  const [invoiceId, setInvoiceId] = useState(`INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`);

  useEffect(() => {
    getCustomers().then(res => setCustomers(res.data)).catch(console.error);
  }, []);

  const filteredProducts = useMemo(() => {
    return productCatalog.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const addToCart = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((id, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  }, []);

  const updateItemDiscount = useCallback((id, discount) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, itemDiscount: Number(discount) } : item));
  }, []);

  const cartCalculations = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + ((item.price - (item.itemDiscount || 0)) * item.quantity), 0);
    const taxTotal = cart.reduce((sum, item) => sum + ((((item.price - (item.itemDiscount || 0)) * item.quantity) * item.tax) / 100), 0);
    const globalDiscountAmount = discountPercent ? (subtotal * (Number(discountPercent) / 100)) : 0;
    
    let grandTotalRaw = (subtotal - globalDiscountAmount) + taxTotal;
    let roundOff = Math.round(grandTotalRaw) - grandTotalRaw;
    let grandTotal = Math.round(grandTotalRaw);

    return { subtotal, taxTotal, discountAmount: globalDiscountAmount, roundOff, grandTotal };
  }, [cart, discountPercent]);

  const handleCheckout = async (type) => {
    if (cart.length === 0) return;
    
    const billData = {
      id: invoiceId,
      customer: selectedCustomer,
      amount: cartCalculations.grandTotal,
      items: cart.reduce((sum, i) => sum + i.quantity, 0),
      time: "Just now",
      status: "completed",
      payment: paymentMethod
    };

    try {
      await addBill(billData);
    } catch (e) {
      console.error(e);
    }

    if (type === 'print') {
      window.print();
    } else if (type === 'whatsapp') {
      const msg = `Hello! Your bill from Anyaa Textiles is ₹${cartCalculations.grandTotal.toLocaleString('en-IN')}. Thank you for shopping!`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setCart([]);
      setDiscountPercent('');
      setInvoiceId(`INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`);
      setSelectedCustomer('Walk-in Customer');
    }, 2000);
  };

  return (
    <div className="h-[calc(100vh-80px)] flex gap-6 pb-6">
      {/* Left Column: Product Catalog */}
      <div className="flex-[1.5] bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-6 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Product Catalog</h2>
            <p className="text-xs text-gray-400 mt-1">Select products, scan codes or add custom items.</p>
          </div>
          <button className="text-[10px] font-bold text-pink-500 bg-pink-50 px-3 py-1.5 rounded-full uppercase tracking-wider">
            Drag to cart
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 flex items-center gap-4 mb-6">
          <div className="flex-1 bg-[#f9f8f9] rounded-xl flex items-center px-4 py-2.5">
            <input
              type="text"
              placeholder="Search by name or code"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm w-full outline-none text-gray-600 placeholder:text-gray-400"
            />
          </div>
          <select 
            className="flex-[0.8] bg-[#f9f8f9] rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none appearance-none"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option>All Categories</option>
            <option>Kurti</option>
            <option>Saree</option>
            <option>Leggings</option>
            <option>Tops</option>
            <option>Nighty</option>
            <option>Chudithar</option>
          </select>
          <select className="flex-[0.8] bg-[#f9f8f9] rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none appearance-none">
            <option>Any Price</option>
            <option>Under ₹500</option>
            <option>₹500 - ₹1000</option>
            <option>Above ₹1000</option>
          </select>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="border border-pink-100 rounded-2xl p-4 flex flex-col hover:shadow-md transition-shadow">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">{product.name}</h3>
                <p className="text-[10px] text-gray-400 font-mono mb-2">{product.sku}</p>
                <p className="text-sm font-bold text-gray-800 mb-3 flex-1">₹{product.price.toLocaleString('en-IN')}</p>
                
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => addToCart(product)}
                    className="bg-[#cfa1bb] hover:bg-[#b5809e] text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors"
                  >
                    Add
                  </button>
                  <span className="text-[10px] text-gray-400">{product.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Current Bill */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-6 pb-4 border-b border-gray-50 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Current Bill</h2>
              <p className="text-xs text-gray-400 mt-1">Drag items to reorder. Click qty to update.</p>
            </div>
            <button className="text-[10px] font-bold text-pink-600 bg-pink-50 px-3 py-1.5 rounded-full border border-pink-100 uppercase tracking-wider">
              {invoiceId}
            </button>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Select Customer</label>
            <select 
              className="w-full bg-[#f9f8f9] rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none border border-gray-100 focus:border-pink-300 appearance-none"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              <option value="Walk-in Customer">Walk-in Customer</option>
              {customers.map(c => (
                <option key={c.id} value={c.name}>{c.name} ({c.phone})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Headers */}
        <div className="px-6 py-3 border-b border-gray-50 grid grid-cols-12 gap-2 text-[10px] font-bold text-gray-400 tracking-wider">
          <div className="col-span-5 uppercase">Item</div>
          <div className="col-span-3 text-center uppercase">Qty</div>
          <div className="col-span-2 text-right uppercase">Rate</div>
          <div className="col-span-2 text-right uppercase">Total</div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300">
              <div className="w-12 h-12 rounded-full border-4 border-gray-100 mb-4 flex items-center justify-center">
                <div className="w-4 h-4 bg-gray-100 rounded-full"></div>
              </div>
              <p className="text-sm font-medium">No items added yet. Tap a product to start billing.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-3 items-center bg-[#f9f8f9] p-3 rounded-xl border border-gray-100">
                <div className="col-span-5">
                  <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] text-gray-400 font-mono">{item.sku}</p>
                    <input
                      type="number"
                      placeholder="₹ Disc"
                      value={item.itemDiscount || ''}
                      onChange={(e) => updateItemDiscount(item.id, e.target.value)}
                      className="w-16 h-5 text-[10px] px-1 border border-gray-200 rounded"
                    />
                  </div>
                </div>
                <div className="col-span-3 flex items-center justify-center gap-2 bg-white rounded-lg border border-gray-200 py-1 px-2">
                  <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-400 hover:text-gray-600">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-400 hover:text-gray-600">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="col-span-2 text-right text-gray-600 flex flex-col justify-center">
                  <span className="text-xs">{(item.price - (item.itemDiscount || 0))}</span>
                  {item.itemDiscount > 0 && <span className="text-[9px] line-through text-gray-400">{item.price}</span>}
                </div>
                <div className="col-span-2 text-right font-semibold text-gray-800">
                  {(item.price - (item.itemDiscount || 0)) * item.quantity}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calculation Area */}
        <div className="p-6 border-t border-gray-50 space-y-2">
          <div className="flex justify-between text-xs font-medium text-gray-500">
            <span>Subtotal</span>
            <span>₹{cartCalculations.subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
          </div>
          <div className="flex justify-between text-xs font-medium text-gray-500">
            <span>Discount</span>
            <span>₹{cartCalculations.discountAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
          </div>
          <div className="flex justify-between text-xs font-medium text-gray-500">
            <span>GST (5%)</span>
            <span>₹{cartCalculations.taxTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
          </div>
          <div className="flex justify-between text-xs font-medium text-gray-500 pb-2">
            <span>Round Off</span>
            <span>₹{cartCalculations.roundOff.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
          </div>

          <div className="bg-[#f9f8f9] rounded-xl p-4 flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-gray-800">Total Payable</span>
            <span className="text-xl font-bold text-gray-800">₹{cartCalculations.grandTotal.toLocaleString('en-IN')}</span>
          </div>

          <div className="mb-4">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Discount (%)</label>
            <input 
              type="number"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              className="w-full bg-[#f9f8f9] rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none border border-gray-100 focus:border-pink-300"
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <button 
              onClick={() => setPaymentMethod('Cash')}
              className={`py-2 text-xs font-bold rounded-xl border transition-colors ${paymentMethod === 'Cash' ? 'border-pink-300 text-pink-600 bg-pink-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              Cash
            </button>
            <button 
              onClick={() => setPaymentMethod('UPI')}
              className={`py-2 text-xs font-bold rounded-xl border transition-colors ${paymentMethod === 'UPI' ? 'border-pink-300 text-pink-600 bg-pink-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              UPI
            </button>
            <button 
              onClick={() => setPaymentMethod('Card')}
              className={`py-2 text-xs font-bold rounded-xl border transition-colors ${paymentMethod === 'Card' ? 'border-pink-300 text-pink-600 bg-pink-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              Card
            </button>
          </div>

          <p className="text-[10px] text-gray-400 mb-4">Tip: Keep item quantities updated and press Generate Receipt after checkout.</p>

          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => setCart([])}
              className="py-3 bg-[#f9f8f9] hover:bg-gray-100 text-gray-600 text-xs font-bold rounded-xl transition-colors border border-gray-100"
            >
              Clear Cart
            </button>
            <button 
              onClick={() => handleCheckout('print')}
              className="py-3 bg-[#6e85c2] hover:bg-[#5a71ad] text-white text-xs font-bold rounded-xl transition-colors"
            >
              Print Bill
            </button>
            <button 
              onClick={() => handleCheckout('whatsapp')}
              className="py-3 bg-[#69b870] hover:bg-[#56a55d] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1"
            >
              WhatsApp Receipt
            </button>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl text-center max-w-sm w-full mx-4 animate-slide-up shadow-2xl">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Bill Generated!</h3>
            <p className="text-gray-500 text-sm mb-6">Receipt ready for {paymentMethod} payment.</p>
          </div>
        </div>
      )}
    </div>
  );
}
