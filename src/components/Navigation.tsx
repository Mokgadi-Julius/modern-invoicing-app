import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  HomeIcon, 
  ChartBarIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  CubeIcon,
  CogIcon,
  ArrowRightStartOnRectangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface NavigationProps {
  onLogout?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onLogout }) => {
  const location = useLocation();
  const { isAdmin, logout, userProfile } = useAuth();

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { path: '/invoices', label: 'Invoices', icon: DocumentTextIcon },
    { path: '/customers', label: 'Customers', icon: UserGroupIcon },
    { path: '/products', label: 'Products', icon: CubeIcon },
    { path: '/settings', label: 'Settings', icon: CogIcon },
  ];

  // Add admin-only navigation items
  if (isAdmin) {
    navigationItems.push({
      path: '/admin/approvals', 
      label: 'User Approvals', 
      icon: CheckCircleIcon
    });
  }

  const handleLogout = async () => {
    try {
      await logout();
      if (onLogout) onLogout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">INVOICEWRITE</span>
            <span className="text-xl font-bold text-blue-400">NOW</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-1">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <IconComponent className="w-5 h-5 mr-2" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center space-x-4">
          {userProfile && (
            <div className="text-right">
              <p className="text-sm text-white font-medium">{userProfile.displayName}</p>
              <p className="text-xs text-slate-400">{userProfile.companyName}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-red-600 rounded-lg transition-colors"
          >
            <ArrowRightStartOnRectangleIcon className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};