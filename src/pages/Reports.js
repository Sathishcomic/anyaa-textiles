import React, { useState } from 'react';
import {
  Calendar,
  Download,
  FileText,
  TrendingUp,
  IndianRupee,
  Package,
  BarChart3,
  PieChart,
  Filter
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart as RePieChart, Pie, Cell
} from 'recharts';

const monthlySalesData = [
  { month: 'Jan', sales: 285000, tax: 45600, returns: 12000 },
  { month: 'Feb', sales: 310000, tax: 49600, returns: 8500 },
  { month: 'Mar', sales: 350000, tax: 56000, returns: 15000 },
  { month: 'Apr', sales: 295000, tax: 47200, returns: 10000 },
  { month: 'May', sales: 420000, tax: 67200, returns: 18000 },
  { month: 'Jun', sales: 380000, tax: 60800, returns: 14000 },
];

const categoryData = [
  { name: 'Sarees', value: 35, color: '#6366f1' },
  { name: 'Fabrics', value: 30, color: '#8b5cf6' },
  { name: 'Dress Material', value: 15, color: '#06b6d4' },
  { name: 'Accessories', value: 12, color: '#10b981' },
  { name: 'Dupattas', value: 8, color: '#f59e0b' },
];

const taxBreakdown = [
  { category: 'Silk & Sarees', gstRate: '12%', taxableValue: 850000, taxAmount: 102000, invoices: 156 },
  { category: 'Cotton Fabrics', gstRate: '5%', taxableValue: 620000, taxAmount: 31000, invoices: 289 },
  { category: 'Polyester & Blends', gstRate: '5%', taxableValue: 340000, taxAmount: 17000, invoices: 195 },
  { category: 'Accessories & Zari', gstRate: '18%', taxableValue: 180000, taxAmount: 32400, invoices: 87 },
  { category: 'Premium Materials', gstRate: '12%', taxableValue: 420000, taxAmount: 50400, invoices: 64 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-900 text-white px-4 py-3 rounded-xl shadow-xl text-sm">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color || '#a5b4fc' }}>
            {entry.name}: ₹{entry.value.toLocaleString('en-IN')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Reports() {
  const [activeTab, setActiveTab] = useState('sales');
  const [fromDate, setFromDate] = useState('2024-01-01');
  const [toDate, setToDate] = useState('2024-06-30');

  const tabs = [
    { id: 'sales', label: 'Sales Reports', icon: TrendingUp },
    { id: 'tax', label: 'Tax Reports', icon: IndianRupee },
    { id: 'inventory', label: 'Inventory Reports', icon: Package },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3 bg-white rounded-xl p-1.5 border border-surface-200 shadow-card">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                  : 'text-surface-600 hover:bg-surface-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white rounded-xl border border-surface-200 px-3 py-2">
            <Calendar className="w-4 h-4 text-surface-400" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="text-sm text-surface-700 outline-none bg-transparent"
            />
            <span className="text-surface-300">→</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="text-sm text-surface-700 outline-none bg-transparent"
            />
          </div>
          <button className="btn-primary text-sm flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export PDF/Excel
          </button>
        </div>
      </div>

      {/* Sales Reports Tab */}
      {activeTab === 'sales' && (
        <div className="space-y-5">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: '₹20,40,000', change: '+18.2%', color: 'from-primary-500 to-primary-600', icon: IndianRupee },
              { label: 'Total Invoices', value: '847', change: '+12.5%', color: 'from-emerald-500 to-emerald-600', icon: FileText },
              { label: 'Avg. Invoice Value', value: '₹2,408', change: '+5.3%', color: 'from-violet-500 to-violet-600', icon: BarChart3 },
              { label: 'Returns Value', value: '₹77,500', change: '-8.1%', color: 'from-amber-500 to-orange-500', icon: Package },
            ].map((card, i) => (
              <div key={i} className="stat-card !p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-display font-bold text-surface-900">{card.value}</p>
                    <p className="text-xs text-surface-500">{card.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-card border border-surface-100">
              <h3 className="text-lg font-display font-bold text-surface-800 mb-1">Monthly Sales & Returns</h3>
              <p className="text-sm text-surface-500 mb-6">Revenue trend for the selected period</p>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlySalesData}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2.5} fill="url(#salesGrad)" name="Sales" />
                  <Area type="monotone" dataKey="returns" stroke="#f43f5e" strokeWidth={2} fill="none" strokeDasharray="5 5" name="Returns" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-card border border-surface-100">
              <h3 className="text-lg font-display font-bold text-surface-800 mb-1">Category Split</h3>
              <p className="text-sm text-surface-500 mb-4">Sales by product category</p>
              <ResponsiveContainer width="100%" height={200}>
                <RePieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {categoryData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {categoryData.map(cat => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-surface-600">{cat.name}</span>
                    </div>
                    <span className="font-semibold text-surface-800">{cat.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tax Reports Tab */}
      {activeTab === 'tax' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Total Tax Collected', value: '₹2,32,800', icon: IndianRupee },
              { label: 'CGST', value: '₹1,16,400', icon: IndianRupee },
              { label: 'SGST', value: '₹1,16,400', icon: IndianRupee },
            ].map((card, i) => (
              <div key={i} className="stat-card !p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-display font-bold text-surface-900">{card.value}</p>
                    <p className="text-xs text-surface-500">{card.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card border border-surface-100">
            <h3 className="text-lg font-display font-bold text-surface-800 mb-1">Tax Breakdown by Category</h3>
            <p className="text-sm text-surface-500 mb-4">GST collected across textile categories</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="tax" fill="#10b981" radius={[6, 6, 0, 0]} barSize={32} name="Tax" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="table-container overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-200">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-surface-500 uppercase">Category</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-surface-500 uppercase">GST Rate</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-surface-500 uppercase">Taxable Value</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-surface-500 uppercase">Tax Amount</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-surface-500 uppercase">Invoices</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {taxBreakdown.map((row, i) => (
                  <tr key={i} className="hover:bg-surface-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-surface-800">{row.category}</td>
                    <td className="px-5 py-4"><span className="badge-info">{row.gstRate}</span></td>
                    <td className="px-5 py-4 text-surface-700">₹{row.taxableValue.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 font-semibold text-emerald-600">₹{row.taxAmount.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 text-surface-600">{row.invoices}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventory Reports Tab */}
      {activeTab === 'inventory' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl p-6 shadow-card border border-surface-100">
              <h3 className="text-lg font-display font-bold text-surface-800 mb-1">Stock Value by Category</h3>
              <p className="text-sm text-surface-500 mb-6">Current inventory valuation</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={[
                  { name: 'Sarees', value: 385000 },
                  { name: 'Cotton', value: 236000 },
                  { name: 'Polyester', value: 57600 },
                  { name: 'Silk', value: 195000 },
                  { name: 'Linen', value: 124000 },
                  { name: 'Others', value: 89000 },
                ]} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={20} name="Stock Value" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-card border border-surface-100">
              <h3 className="text-lg font-display font-bold text-surface-800 mb-1">Stock Movement</h3>
              <p className="text-sm text-surface-500 mb-6">Items added vs sold this month</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={[
                  { name: 'Week 1', added: 120, sold: 95 },
                  { name: 'Week 2', added: 85, sold: 110 },
                  { name: 'Week 3', added: 150, sold: 130 },
                  { name: 'Week 4', added: 100, sold: 88 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="added" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={20} name="Added" />
                  <Bar dataKey="sold" fill="#10b981" radius={[6, 6, 0, 0]} barSize={20} name="Sold" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
