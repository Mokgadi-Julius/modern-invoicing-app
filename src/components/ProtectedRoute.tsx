import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PendingApproval } from '../pages/PendingApproval';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { isAuthenticated, isApproved, isAdmin, loading, userProfile } = useAuth();

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

  if (!isAuthenticated) {
    // Redirect to login will be handled by App.tsx
    return null;
  }

  // Admin users are always approved, even if there's a timing issue
  if (!isApproved && !isAdmin) {
    return <PendingApproval />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8">
            <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-red-400">You need admin privileges to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};