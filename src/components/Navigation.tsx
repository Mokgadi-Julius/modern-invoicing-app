import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, getThemeClasses } from '../contexts/ThemeContext';
import {
  HomeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CubeIcon,
  CogIcon,
  ArrowRightStartOnRectangleIcon,
  CheckCircleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface NavigationProps {
  onLogout?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onLogout }) => {
  const location = useLocation();
  const { isAdmin, logout, userProfile } = useAuth();
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { path: '/invoices', label: 'Invoices', icon: DocumentTextIcon },
    { path: '/customers', label: 'Customers', icon: UserGroupIcon },
    { path: '/products', label: 'Products', icon: CubeIcon },
    { path: '/templates', label: 'Templates', icon: DocumentTextIcon },
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
    <nav className="bg-black/90 backdrop-blur-md border-b border-gray-800/50 px-4 sm:px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <div className="h-20 flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="InvoiceWrite Now" className="h-full w-auto object-contain px-3" />
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-1">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <IconComponent className="w-5 h-5 mr-2" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* User Info & Logout - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {userProfile && (
            <div className="text-right">
              <p className="text-sm font-medium text-white">{userProfile.displayName}</p>
              <p className="text-xs text-gray-300">{userProfile.companyName}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowRightStartOnRectangleIcon className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            type="button"
            className="text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4">
          <div className="flex flex-col space-y-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <IconComponent className="w-6 h-6 mr-3" />
                  {item.label}
                </Link>
              );
            })}
            
            {/* User Info & Logout - Mobile */}
            <div className="pt-4 mt-4 border-t border-gray-800">
              {userProfile && (
                <div className="px-4 py-2">
                  <p className="text-sm font-medium text-white">{userProfile.displayName}</p>
                  <p className="text-xs text-gray-300">{userProfile.companyName}</p>
                </div>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowRightStartOnRectangleIcon className="w-6 h-6 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};