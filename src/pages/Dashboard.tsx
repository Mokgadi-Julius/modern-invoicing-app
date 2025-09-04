import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import {
  BanknotesIcon,
  DocumentTextIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  EyeIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { dashboardStats, invoices, settings } = useApp();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency || 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      case 'sent':
        return 'text-blue-600 bg-blue-100';
      case 'viewed':
        return 'text-purple-600 bg-purple-100';
      case 'draft':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(dashboardStats.totalRevenue),
      icon: BanknotesIcon,
      color: 'bg-green-500',
      change: '+12% from last month',
    },
    {
      title: 'Pending Amount',
      value: formatCurrency(dashboardStats.pendingAmount),
      icon: ClockIcon,
      color: 'bg-yellow-500',
      change: `${dashboardStats.unpaidInvoices} invoices pending`,
    },
    {
      title: 'Overdue Amount',
      value: formatCurrency(dashboardStats.overdueAmount),
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      change: 'Requires attention',
    },
    {
      title: 'Total Invoices',
      value: dashboardStats.totalInvoices.toString(),
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
      change: `${dashboardStats.paidInvoices} paid, ${dashboardStats.unpaidInvoices} unpaid`,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400 mt-1">
              Welcome back! Here's your business overview.
            </p>
          </div>
          <div className="flex space-x-4">
            <Link
              to="/invoices/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Invoice
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <div
                key={index}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${card.color} bg-opacity-20`}>
                    <IconComponent className={`w-6 h-6 text-white`} />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-slate-400 text-sm font-medium">{card.title}</h3>
                  <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                  <p className="text-slate-500 text-sm mt-1">{card.change}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Invoices */}
          <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Recent Invoices</h2>
              <Link
                to="/invoices"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center"
              >
                View All
                <EyeIcon className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-4">
              {dashboardStats.recentInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 bg-slate-750 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                      <DocumentTextIcon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-slate-400">{invoice.to.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-white">
                        {formatCurrency(invoice.total)}
                      </p>
                      <p className="text-sm text-slate-400">
                        {format(new Date(invoice.date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        invoice.status
                      )}`}
                    >
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
              {dashboardStats.recentInvoices.length === 0 && (
                <div className="text-center py-12">
                  <DocumentTextIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">No invoices yet</p>
                  <Link
                    to="/invoices/create"
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium mt-2 inline-block"
                  >
                    Create your first invoice
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <Link
                to="/invoices/create"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg font-medium transition-colors"
              >
                <div className="flex items-center">
                  <PlusIcon className="w-5 h-5 mr-3" />
                  Create New Invoice
                </div>
              </Link>
              <Link
                to="/customers/create"
                className="block w-full bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-lg font-medium transition-colors border border-slate-600"
              >
                <div className="flex items-center">
                  <PlusIcon className="w-5 h-5 mr-3" />
                  Add New Customer
                </div>
              </Link>
              <Link
                to="/products"
                className="block w-full bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-lg font-medium transition-colors border border-slate-600"
              >
                <div className="flex items-center">
                  <PlusIcon className="w-5 h-5 mr-3" />
                  Manage Products
                </div>
              </Link>
              <Link
                to="/settings"
                className="block w-full bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-lg font-medium transition-colors border border-slate-600"
              >
                <div className="flex items-center">
                  <CogIcon className="w-5 h-5 mr-3" />
                  Settings
                </div>
              </Link>
            </div>

            {/* Payment Status Summary */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <h3 className="text-lg font-medium text-white mb-4">Payment Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-slate-300">Paid</span>
                  </div>
                  <span className="font-medium text-white">{dashboardStats.paidInvoices}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ClockIcon className="w-5 h-5 text-yellow-500 mr-2" />
                    <span className="text-slate-300">Pending</span>
                  </div>
                  <span className="font-medium text-white">{dashboardStats.unpaidInvoices}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-slate-300">Overdue</span>
                  </div>
                  <span className="font-medium text-white">
                    {invoices.filter((inv) => inv.status === 'overdue').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};