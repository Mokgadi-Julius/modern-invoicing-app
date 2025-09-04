import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  UserIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

export const AdminApprovals: React.FC = () => {
  const { pendingUsers, approveUser, rejectUser, isAdmin, refreshPendingUsers } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8">
            <XCircleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-red-400">You need admin privileges to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleApprove = async (userId: string) => {
    setLoading(userId);
    try {
      await approveUser(userId);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    if (!window.confirm('Are you sure you want to reject this user? This action cannot be undone.')) {
      return;
    }
    
    setLoading(userId);
    try {
      await rejectUser(userId);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshPendingUsers();
    } catch (error: any) {
      alert('Failed to refresh: ' + error.message);
    } finally {
      setRefreshing(false);
    }
  };

  // Refresh pending users when component mounts
  useEffect(() => {
    if (isAdmin) {
      refreshPendingUsers();
    }
  }, [isAdmin]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">User Approvals</h1>
            <p className="text-slate-400 mt-1">
              Manage pending user registration requests
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700/50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors border border-slate-600"
            >
              <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <div className="bg-slate-800 rounded-lg px-4 py-2 border border-slate-700">
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-semibold">{pendingUsers.length}</span>
                <span className="text-slate-400">pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Users */}
        {pendingUsers.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
            <UserGroupIcon className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Pending Approvals</h2>
            <p className="text-slate-400">All user registration requests have been processed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div
                key={user.uid}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-blue-400" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-xl font-semibold text-white">
                            {user.displayName}
                          </h3>
                          <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">
                            Pending Approval
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <EnvelopeIcon className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-300">{user.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <BuildingOfficeIcon className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-300">{user.companyName}</span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-slate-500">
                          Registered on {format(new Date(user.createdAt), 'MMMM dd, yyyy \'at\' HH:mm')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 ml-4">
                    <button
                      onClick={() => handleApprove(user.uid)}
                      disabled={loading === user.uid}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>{loading === user.uid ? 'Approving...' : 'Approve'}</span>
                    </button>
                    
                    <button
                      onClick={() => handleReject(user.uid)}
                      disabled={loading === user.uid}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      <span>{loading === user.uid ? 'Rejecting...' : 'Reject'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};