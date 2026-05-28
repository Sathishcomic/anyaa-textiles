import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import StockManagement from './pages/StockManagement';
import Reports from './pages/Reports';
import Customers from './pages/Customers';
import ReturnExchange from './pages/ReturnExchange';
import Invoices from './pages/Invoices';
import Settings from './pages/Settings';
import Login from './pages/Login';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="billing" element={<RoleRoute allowedRoles={['Admin', 'Sales', 'Accounts']}><Billing /></RoleRoute>} />
        <Route path="stock" element={<RoleRoute allowedRoles={['Admin', 'Sales', 'Accounts']}><StockManagement /></RoleRoute>} />
        <Route path="reports" element={<RoleRoute allowedRoles={['Admin', 'Accounts']}><Reports /></RoleRoute>} />
        <Route path="invoices" element={<RoleRoute allowedRoles={['Admin', 'Accounts', 'Sales']}><Invoices /></RoleRoute>} />
        <Route path="customers" element={<RoleRoute allowedRoles={['Admin', 'Accounts']}><Customers /></RoleRoute>} />
        <Route path="returns" element={<RoleRoute allowedRoles={['Admin', 'Sales', 'Accounts']}><ReturnExchange /></RoleRoute>} />
        <Route path="settings" element={<RoleRoute allowedRoles={['Admin']}><Settings /></RoleRoute>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
