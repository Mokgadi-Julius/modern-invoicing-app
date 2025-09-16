import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { 
    isAdmin, 
    pendingUsers, 
    approveUser, 
    rejectUser, 
    refreshPendingUsers 
  } = useAuth();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAdmin) {
      refreshPendingUsers();
    }
  }, [isAdmin, refreshPendingUsers]);

  if (!isAdmin) {
    return null; // This component should only be shown to admins
  }

  const handleApprove = async (userId: string) => {
    setLoading(prev => ({ ...prev, [userId]: true }));
    setError('');
    
    try {
      await approveUser(userId);
      await refreshPendingUsers();
    } catch (error: any) {
      setError(error.message || 'Failed to approve user');
    } finally {
      setLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleReject = async (userId: string) => {
    if (!confirm('Are you sure you want to reject this user?')) return;
    
    setLoading(prev => ({ ...prev, [userId]: true }));
    setError('');
    
    try {
      await rejectUser(userId);
      await refreshPendingUsers();
    } catch (error: any) {
      setError(error.message || 'Failed to reject user');
    } finally {
      setLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-6 max-w-md w-full max-h-96 overflow-y-auto z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-sky-400">Admin Dashboard</h3>
        <button
          onClick={refreshPendingUsers}
          className="text-sm text-sky-400 hover:text-sky-300 transition-colors"
        >
          Refresh
        </button>
      </div>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-3 py-2 rounded-lg text-sm mb-4">
          {error}
          <button 
            onClick={() => setError('')}
            className="float-right text-red-300 hover:text-red-200"
          >
            ×
          </button>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h4 className="text-md font-medium text-slate-300 mb-2">
            Pending Approvals ({pendingUsers.length})
          </h4>
          
          {pendingUsers.length === 0 ? (
            <p className="text-sm text-slate-400">No pending users to approve</p>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map((user) => (
                <div
                  key={user.uid}
                  className="bg-slate-700/50 border border-slate-600 rounded-lg p-3"
                >
                  <div className="mb-2">
                    <p className="text-sm font-medium text-white">{user.displayName}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                    <p className="text-xs text-slate-400">Company: {user.companyName}</p>
                    <p className="text-xs text-slate-500">
                      Registered: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(user.uid)}
                      disabled={loading[user.uid]}
                      className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white text-xs font-medium py-2 px-3 rounded transition duration-150 ease-in-out"
                    >
                      {loading[user.uid] ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(user.uid)}
                      disabled={loading[user.uid]}
                      className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white text-xs font-medium py-2 px-3 rounded transition duration-150 ease-in-out"
                    >
                      {loading[user.uid] ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;