import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import type { InvoiceStatus, PaymentStatus } from '../types';

export const Invoices: React.FC = () => {
  const { invoices, deleteInvoice, settings } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'dueDate' | 'total' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency || 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: InvoiceStatus) => {
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

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      case 'partial':
        return 'text-yellow-600 bg-yellow-100';
      case 'unpaid':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredAndSortedInvoices = invoices
    .filter((invoice) => {
      const matchesSearch = 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.to.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.to.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      const matchesPayment = paymentFilter === 'all' || invoice.paymentStatus === paymentFilter;
      
      return matchesSearch && matchesStatus && matchesPayment;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'dueDate':
          aValue = new Date(a.dueDate);
          bValue = new Date(b.dueDate);
          break;
        case 'total':
          aValue = a.total;
          bValue = b.total;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleDeleteInvoice = (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      deleteInvoice(id);
    }
  };

  const handleSort = (field: 'date' | 'dueDate' | 'total' | 'status') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Invoices</h1>
            <p className="text-slate-400 mt-1">
              Manage your invoices, track payments, and send reminders.
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors">
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
              Export
            </button>
            <Link
              to="/invoices/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Invoice
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by invoice number, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
              className="bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="viewed">Viewed</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as PaymentStatus | 'all')}
              className="bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Payments</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          {filteredAndSortedInvoices.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400 mb-2">
                {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all'
                  ? 'No invoices found matching your filters.'
                  : 'No invoices yet'}
              </p>
              <Link
                to="/invoices/create"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                Create your first invoice
              </Link>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="bg-slate-750 border-b border-slate-700 px-6 py-4">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-slate-400 uppercase tracking-wider">
                  <div className="col-span-2">
                    <button
                      onClick={() => handleSort('date')}
                      className="flex items-center hover:text-white transition-colors"
                    >
                      Invoice
                      {sortBy === 'date' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </div>
                  <div className="col-span-3">Customer</div>
                  <div className="col-span-2">
                    <button
                      onClick={() => handleSort('dueDate')}
                      className="flex items-center hover:text-white transition-colors"
                    >
                      Due Date
                      {sortBy === 'dueDate' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </div>
                  <div className="col-span-1">
                    <button
                      onClick={() => handleSort('total')}
                      className="flex items-center hover:text-white transition-colors"
                    >
                      Amount
                      {sortBy === 'total' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </div>
                  <div className="col-span-2">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center hover:text-white transition-colors"
                    >
                      Status
                      {sortBy === 'status' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </div>
                  <div className="col-span-2">Actions</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-slate-700">
                {filteredAndSortedInvoices.map((invoice) => (
                  <div key={invoice.id} className="px-6 py-4 hover:bg-slate-750 transition-colors">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-2">
                        <div className="font-semibold text-white">{invoice.invoiceNumber}</div>
                        <div className="text-sm text-slate-400">
                          {format(new Date(invoice.date), 'MMM dd, yyyy')}
                        </div>
                      </div>
                      <div className="col-span-3">
                        <div className="font-medium text-white">{invoice.to.name}</div>
                        <div className="text-sm text-slate-400">{invoice.to.email}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-white">{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</div>
                        <div className="text-xs text-slate-400">
                          {new Date(invoice.dueDate) < new Date() && invoice.paymentStatus !== 'paid' 
                            ? 'Overdue' 
                            : `${Math.ceil((new Date(invoice.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days`}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <div className="font-semibold text-white">{formatCurrency(invoice.total)}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="flex flex-col space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(invoice.paymentStatus)}`}>
                            {invoice.paymentStatus.charAt(0).toUpperCase() + invoice.paymentStatus.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/invoices/${invoice.id}`}
                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
                            title="View invoice"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/invoices/${invoice.id}/edit`}
                            className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Edit invoice"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Link>
                          {invoice.status !== 'sent' && invoice.status !== 'paid' && (
                            <button
                              className="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-700 rounded-lg transition-colors"
                              title="Send invoice"
                            >
                              <PaperAirplaneIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Delete invoice"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Summary Statistics */}
        {invoices.length > 0 && (
          <div className="mt-6 bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Invoice Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{invoices.length}</p>
                <p className="text-slate-400 text-sm">Total Invoices</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">
                  {invoices.filter(inv => inv.paymentStatus === 'paid').length}
                </p>
                <p className="text-slate-400 text-sm">Paid</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">
                  {invoices.filter(inv => inv.paymentStatus === 'unpaid').length}
                </p>
                <p className="text-slate-400 text-sm">Unpaid</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">
                  {invoices.filter(inv => inv.status === 'overdue').length}
                </p>
                <p className="text-slate-400 text-sm">Overdue</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(invoices.reduce((sum, inv) => sum + inv.total, 0))}
                </p>
                <p className="text-slate-400 text-sm">Total Value</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};