import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import AdminSetup from './AdminSetup';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { currentUser, userProfile, isApproved, hasAdmin, loading } = useAuth();
  const [showRegister, setShowRegister] = React.useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show admin setup if no admin exists
  if (!hasAdmin) {
    return <AdminSetup />;
  }

  // Show login/register if not authenticated
  if (!currentUser) {
    return showRegister ? (
      <RegisterForm onToggle={() => setShowRegister(false)} />
    ) : (
      <LoginForm onToggle={() => setShowRegister(true)} />
    );
  }

  // Show approval pending if not approved
  if (!isApproved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
          <div className="text-yellow-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Account Pending Approval</h2>
          <p className="text-slate-300 mb-6">
            Your account is waiting for admin approval. You'll be notified once your access is granted.
          </p>
          <div className="space-y-4">
            <div className="bg-slate-700 p-4 rounded-lg">
              <p className="text-sm text-slate-400 mb-1">Registered as:</p>
              <p className="text-white font-medium">{userProfile?.displayName}</p>
              <p className="text-slate-300 text-sm">{userProfile?.email}</p>
              <p className="text-slate-300 text-sm">Company: {userProfile?.companyName}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
            >
              Refresh Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and approved
  return <>{children}</>;
};

export default AuthWrapper;