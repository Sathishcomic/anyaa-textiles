import React, { useState, useEffect } from 'react';
import {
  IndianRupee,
  Receipt,
  Wallet,
  CreditCard,
  Package,
  Plus,
  BarChart3,
  RotateCcw,
  Users,
  Settings,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { getDashboardStats, getBills, getProducts } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [bills, setBills] = useState([]);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, billsRes, productsRes] = await Promise.all([
          getDashboardStats(),
          getBills(),
          getProducts()
        ]);
        const statsData = statsRes || {};
        const billsData = billsRes || [];
        const productsData = productsRes || [];

        setStats(statsData);
        // normalize bills to expected frontend keys
        setBills(billsData.slice(0, 6).map(b => ({
          id: b.id || b.bill_number,
          customer: b.customer_name || b.customer || '',
          items: b.items_count || b.items || 0,
          amount: b.total || b.amount || b.subtotal || 0,
          payment: b.payment_method || b.payment || 'Unknown',
          status: b.payment_status || b.status || 'pending'
        })));
        setProducts((productsData || []).filter(p => Number(p.stock ?? p.available ?? 0) <= Number(p.min_stock ?? p.minStock ?? 0)).slice(0, 3));
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };
    loadData();
  }, []);

  if (!stats) return <div className="p-8 text-center text-gray-500">Loading dashboard data...</div>;

  const format = (v) => Number(v ?? 0).toLocaleString('en-IN');
  const topCards = [
    { title: 'Today Sales', value: `₹${format(stats.todaySales)}`, sub: `+${stats.todaySalesGrowth ?? 0}% vs yesterday`, icon: IndianRupee, bg: 'bg-pink-400', text: 'text-emerald-500' },
    { title: 'Total Bills', value: stats.totalBills ?? 0, sub: `+${stats.totalBillsGrowth ?? 0} more than yesterday`, icon: Receipt, bg: 'bg-indigo-300', text: 'text-emerald-500' },
    { title: 'Cash Sales', value: `₹${format(stats.cashSales)}`, sub: `+${stats.cashSalesGrowth ?? 0}% vs yesterday`, icon: Wallet, bg: 'bg-emerald-400', text: 'text-emerald-500' },
    { title: 'UPI Sales', value: `₹${format(stats.upiSales)}`, sub: `+${stats.upiSalesGrowth ?? 0}% vs yesterday`, icon: CreditCard, bg: 'bg-blue-400', text: 'text-emerald-500' },
    { title: 'Stock Items', value: stats.stockItems ?? 0, sub: `${stats.lowStockAlerts ?? 0} low stock alerts`, icon: Package, bg: 'bg-amber-400', text: 'text-rose-500' }
  ];

  const quickActions = [
    { name: 'New Billing', icon: Plus, path: '/billing', bg: 'bg-pink-400' },
    { name: 'Add Stock', icon: Package, path: '/stock', bg: 'bg-indigo-400' },
    { name: 'Sales Report', icon: BarChart3, path: '/reports', bg: 'bg-amber-400' },
    { name: 'Return / Exchange', icon: RotateCcw, path: '/returns', bg: 'bg-rose-400' },
    { name: 'Customer List', icon: Users, path: '/customers', bg: 'bg-emerald-400' },
    { name: 'Settings', icon: Settings, path: '/settings', bg: 'bg-blue-400' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {topCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col">
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-4`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm text-gray-500 mb-1 font-medium">{card.title}</p>
            <p className="text-2xl font-bold text-gray-800 mb-2">{card.value}</p>
            <p className={`text-xs font-medium mt-auto ${card.text}`}>
              {card.sub.startsWith('+') ? '↑' : card.sub.includes('low') ? '↓' : ''} {card.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Bills */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-gray-600" />
              <h3 className="text-base font-bold text-gray-800">Recent Bills</h3>
            </div>
            <button 
              onClick={() => navigate('/billing')}
              className="text-sm text-pink-500 font-medium hover:text-pink-600 transition-colors flex items-center"
            >
              View All Bills <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-gray-400 uppercase font-bold tracking-wider border-b border-gray-100">
                <tr>
                  <th className="pb-3 font-medium">BILL NO.</th>
                  <th className="pb-3 font-medium">CUSTOMER</th>
                  <th className="pb-3 font-medium">ITEMS</th>
                  <th className="pb-3 font-medium">AMOUNT</th>
                  <th className="pb-3 font-medium">PAYMENT</th>
                  <th className="pb-3 font-medium">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bills.map((bill, i) => (
                  <tr key={i} className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => navigate('/billing')}>
                    <td className="py-4 px-2 text-pink-400 font-medium">{bill.id}</td>
                    <td className="py-4 text-gray-700">{bill.customer}</td>
                    <td className="py-4 text-gray-600">{bill.items} items</td>
                    <td className="py-4 font-bold text-gray-800">₹{Number(bill.amount || 0).toLocaleString('en-IN')}</td>
                    <td className="py-4">
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full text-emerald-600 border border-emerald-200 uppercase tracking-wider">
                        {bill.payment}
                      </span>
                    </td>
                    <td className="py-4">
                      {bill.status === 'completed' ? (
                         <span className="text-emerald-500 flex items-center gap-1 text-xs font-semibold">✓ Done</span>
                      ) : bill.status === 'pending' ? (
                         <span className="text-amber-500 flex items-center gap-1 text-xs font-semibold">⌛ Pending</span>
                      ) : (
                         <span className="text-rose-500 flex items-center gap-1 text-xs font-semibold">✕ Refunded</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-amber-400">⚡</span>
            <h3 className="text-base font-bold text-gray-800">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, i) => (
              <button 
                key={i}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors group"
              >
                <div className={`w-12 h-12 rounded-xl ${action.bg} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-bold text-gray-700">{action.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Low Stock Alerts */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-gray-800">Low Stock Alerts</h3>
            </div>
            <button 
              onClick={() => navigate('/stock')}
              className="text-sm text-pink-500 font-medium hover:text-pink-600 transition-colors flex items-center"
            >
              Manage Stock <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>
          
          <div className="space-y-4">
            {products.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer px-2 rounded transition-colors" onClick={() => navigate('/stock')}>
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-pink-400' : 'bg-amber-400'}`}></div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.category} • Code: {item.sku}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <span className="text-xs text-gray-400">{item.category}</span>
                  <span className="text-sm font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                    {item.stock} left
                  </span>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="text-center py-8 text-sm text-gray-500">No low stock items currently!</div>
            )}
          </div>
        </div>

        {/* This Week's Sales */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-bold text-gray-800">This Week's Sales</h3>
            </div>
            <button 
              onClick={() => navigate('/reports')}
              className="text-[10px] text-pink-500 font-bold uppercase hover:text-pink-600 transition-colors"
            >
              Full Report →
            </button>
          </div>

              <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs text-gray-400 mb-1">This Week</p>
              <p className="text-xl font-bold text-gray-800">₹{format(stats.weekTotal)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Last Week</p>
              <p className="text-xl font-bold text-gray-400">₹{format(stats.lastWeekTotal)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-1">Growth</p>
              <p className="text-xl font-bold text-emerald-500">+{stats.growth}%</p>
            </div>
          </div>

          <div className="h-32 mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklySales} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    const value = payload && payload[0] && payload[0].value;
                    if (active && value != null) {
                      return (
                        <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded">
                          ₹{Number(value).toLocaleString('en-IN')}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="sales" radius={[4, 4, 4, 4]}>
                  {(stats.weeklySales || []).map((entry, index, arr) => (
                    <Cell key={`cell-${index}`} fill={index === arr.length - 1 ? '#fb7185' : '#c7d2fe'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
