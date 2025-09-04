import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  ClockIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

export const PendingApproval: React.FC = () => {
  const { userProfile, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (userProfile?.status === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <DocumentTextIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-white">INVOICEWRITE</span>
                <span className="text-2xl font-bold text-blue-400">NOW</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircleIcon className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Account Access Denied</h1>
            <p className="text-slate-400 mb-6">
              Unfortunately, your account registration has been rejected by an administrator. 
              If you believe this was an error, please contact support.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleLogout}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Return to Login
              </button>
              <div className="text-sm text-slate-500">
                Need help? Contact: support@invoicewritenow.com
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <DocumentTextIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">INVOICEWRITE</span>
              <span className="text-2xl font-bold text-blue-400">NOW</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl text-center">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ClockIcon className="w-8 h-8 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Account Pending Approval</h1>
          <p className="text-slate-400 mb-6">
            Welcome <strong className="text-white">{userProfile?.displayName}</strong>! 
            Your account has been created successfully and is currently pending approval from an administrator.
          </p>
          
          <div className="bg-slate-700 rounded-lg p-4 mb-6">
            <div className="text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Company:</span>
                <span className="text-white">{userProfile?.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-white">{userProfile?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-yellow-400 font-medium">Pending</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
            <p className="text-blue-400 text-sm">
              <strong>What happens next?</strong><br />
              An administrator will review your account and approve or reject your access. 
              You'll receive an email notification once a decision has been made.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Refresh Status
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-500 text-sm">
            © 2025 InvoiceWriteNow. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};