import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Dashboard } from './pages/Dashboard';
import { Invoices } from './pages/Invoices';
import { Customers } from './pages/Customers';
import { Settings } from './pages/Settings';
import { CreateInvoice } from './pages/CreateInvoice';
import { ViewInvoice } from './pages/ViewInvoice';
import { EditInvoice } from './pages/EditInvoice';
import { CreateCustomer } from './pages/CreateCustomer';
import { EditCustomer } from './pages/EditCustomer';
import { Products } from './pages/Products';
import { AdminApprovals } from './pages/AdminApprovals';
import { AdminSetup } from './pages/AdminSetup';

// Component that handles authenticated vs unauthenticated routes
const AppRoutes: React.FC = () => {
  const { isAuthenticated, isApproved, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show auth pages
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/admin-setup" element={<AdminSetup />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // If authenticated, show main app with navigation
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <Routes>
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Protected main pages */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
          <Route path="/invoices/create" element={<ProtectedRoute><CreateInvoice /></ProtectedRoute>} />
          <Route path="/invoices/:id" element={<ProtectedRoute><ViewInvoice /></ProtectedRoute>} />
          <Route path="/invoices/:id/edit" element={<ProtectedRoute><EditInvoice /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
          <Route path="/customers/create" element={<ProtectedRoute><CreateCustomer /></ProtectedRoute>} />
          <Route path="/customers/:id/edit" element={<ProtectedRoute><EditCustomer /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          
          {/* Admin-only pages */}
          <Route path="/admin/approvals" element={<ProtectedRoute requireAdmin><AdminApprovals /></ProtectedRoute>} />
          
          {/* Auth pages (redirect to dashboard if already authenticated) */}
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/signup" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </AppProvider>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;