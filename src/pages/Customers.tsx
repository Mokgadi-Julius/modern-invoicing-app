import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export const Customers: React.FC = () => {
  const { customers, deleteCustomer, settings } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency || 'USD',
    }).format(amount);
  };

  const handleDeleteCustomer = (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      deleteCustomer(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Customers</h1>
            <p className="text-slate-400 mt-1">
              Manage your customer database and relationships.
            </p>
          </div>
          <Link
            to="/customers/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Customer
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search customers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Customers List */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <UserIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400 mb-2">
                {searchTerm ? 'No customers found matching your search.' : 'No customers yet'}
              </p>
              <Link
                to="/customers/create"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                Add your first customer
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="p-6 hover:bg-slate-750 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {customer.name}
                            </h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex items-center text-slate-400 text-sm">
                                <EnvelopeIcon className="w-4 h-4 mr-1" />
                                {customer.email}
                              </div>
                              <div className="flex items-center text-slate-400 text-sm">
                                <PhoneIcon className="w-4 h-4 mr-1" />
                                {customer.phone}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6 mt-3">
                          <div className="flex items-center text-slate-400 text-sm">
                            <BuildingOfficeIcon className="w-4 h-4 mr-1" />
                            {customer.address}
                          </div>
                          {customer.taxId && (
                            <div className="text-slate-400 text-sm">
                              Tax ID: {customer.taxId}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-white">
                          {formatCurrency(customer.totalAmount)}
                        </div>
                        <div className="text-sm text-slate-400">
                          {customer.totalInvoices} invoice{customer.totalInvoices !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-slate-500">
                          Added {format(new Date(customer.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/customers/${customer.id}/edit`}
                          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
                          title="Edit customer"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                          title="Delete customer"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable details */}
                  {selectedCustomer === customer.id && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400 font-medium mb-1">Contact Information</p>
                          <p className="text-white">{customer.email}</p>
                          <p className="text-white">{customer.phone}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-medium mb-1">Address</p>
                          <p className="text-white">{customer.address}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-medium mb-1">Business Information</p>
                          {customer.taxId && (
                            <p className="text-white">Tax ID: {customer.taxId}</p>
                          )}
                          <p className="text-slate-400 text-xs mt-2">
                            Customer since {format(new Date(customer.createdAt), 'MMMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() =>
                      setSelectedCustomer(
                        selectedCustomer === customer.id ? null : customer.id
                      )
                    }
                    className="mt-3 text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    {selectedCustomer === customer.id ? 'Show Less' : 'Show More Details'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {customers.length > 0 && (
          <div className="mt-6 bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{customers.length}</p>
                <p className="text-slate-400 text-sm">Total Customers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(
                    customers.reduce((sum, customer) => sum + customer.totalAmount, 0)
                  )}
                </p>
                <p className="text-slate-400 text-sm">Total Revenue</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {customers.reduce((sum, customer) => sum + customer.totalInvoices, 0)}
                </p>
                <p className="text-slate-400 text-sm">Total Invoices</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(
                    customers.reduce((sum, customer) => sum + customer.totalAmount, 0) /
                      customers.length || 0
                  )}
                </p>
                <p className="text-slate-400 text-sm">Average per Customer</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};