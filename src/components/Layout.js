import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  Users,
  RotateCcw,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Receipt
} from 'lucide-react';

const mainNavigation = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Billing', path: '/billing', icon: ShoppingCart, badge: 'New', allowedRoles: ['Admin', 'Sales', 'Accounts'] },
  { name: 'Stock Management', path: '/stock', icon: Package, allowedRoles: ['Admin', 'Sales', 'Accounts'] },
];

const businessNavigation = [
  { name: 'Reports', path: '/reports', icon: BarChart3, allowedRoles: ['Admin', 'Accounts'] },
  { name: 'Invoices', path: '/invoices', icon: Receipt, allowedRoles: ['Admin', 'Accounts', 'Sales'] },
  { name: 'Customers', path: '/customers', icon: Users, allowedRoles: ['Admin', 'Accounts'] },
  { name: 'Returns & Exchange', path: '/returns', icon: RotateCcw, allowedRoles: ['Admin', 'Sales', 'Accounts'] },
  { name: 'Settings', path: '/settings', icon: Settings, allowedRoles: ['Admin'] },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    if (location.pathname.startsWith('/dashboard')) return { title: 'Dashboard', subtitle: "Good morning! Here's what's happening today." };
    if (location.pathname.startsWith('/billing')) return { title: 'Billing (POS)', subtitle: "Create new invoices and manage cart." };
    if (location.pathname.startsWith('/stock')) return { title: 'Stock Management', subtitle: "Manage inventory and product pricing." };
    if (location.pathname.startsWith('/reports')) return { title: 'Reports', subtitle: "View sales and tax analytics." };
    if (location.pathname.startsWith('/customers')) return { title: 'Customers', subtitle: "Manage customer directory and dues." };
    if (location.pathname.startsWith('/returns')) return { title: 'Returns & Exchange', subtitle: "Process returns or exchanges." };
    if (location.pathname.startsWith('/settings')) return { title: 'Settings', subtitle: "Configure store details and taxes." };
    return { title: 'Dashboard', subtitle: "Good morning! Here's what's happening today." };
  };

  const { title, subtitle } = getPageTitle();

  const formatDate = () => {
    const d = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let hours = d.getHours();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} • ${hours}:${minutes} ${ampm}`;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#fdfbfb]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-surface-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-[260px] bg-[#423348] 
          flex flex-col shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-pink-300 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg leading-none">A</span>
            </div>
          </div>
          <div className="mt-4">
            <h1 className="text-sm font-bold text-white bg-indigo-600 inline-block px-1.5 py-0.5 rounded uppercase tracking-wider">ANYAA TEXTILES</h1>
            <p className="text-[10px] text-white/70 font-medium mt-1">Billing System v1.0</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          <div>
            <p className="px-3 text-[10px] font-bold tracking-wider text-white/40 uppercase mb-2">MAIN</p>
            <div className="space-y-1">
              {mainNavigation.map((item) => (
                (!item.allowedRoles || item.allowedRoles.includes(user?.role)) && (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                        isActive ? 'bg-[#5b4760] text-white' : 'text-white/70 hover:bg-[#5b4760]/50 hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-400 text-white">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                )
              ))}
            </div>
          </div>

          <div>
            <p className="px-3 text-[10px] font-bold tracking-wider text-white/40 uppercase mb-2">BUSINESS</p>
            <div className="space-y-1">
              {businessNavigation.map((item) => (
                (!item.allowedRoles || item.allowedRoles.includes(user?.role)) && (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive ? 'bg-[#5b4760] text-white' : 'text-white/70 hover:bg-[#5b4760]/50 hover:text-white'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </NavLink>
                )
              ))}
            </div>
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="px-4 py-4 bg-[#392b3e]">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-pink-400 flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-white/50 truncate">Shop Owner</p>
            </div>
            <button onClick={handleLogout} className="text-white/40 hover:text-white transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="h-20 bg-[#fdfbfb] border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-surface-500 hover:bg-surface-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-display font-bold text-gray-800">
                {title}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 border border-gray-100 w-[300px]">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Quick search products, bills or custo..."
                className="bg-transparent text-xs font-medium outline-none flex-1 text-gray-600 placeholder:text-gray-400"
              />
            </div>

            {/* Date */}
            <div className="hidden lg:flex items-center px-4 py-2 bg-gray-50 rounded-full border border-gray-100 text-xs font-medium text-gray-600">
              {formatDate()}
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-full bg-gray-50 border border-gray-100 text-gray-500 hover:bg-gray-100 transition-colors flex items-center justify-center w-9 h-9">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full" />
            </button>

            {/* Profile */}
            <div className="w-9 h-9 rounded-full bg-[#cfa1bb] flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
