import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { ArrowLeftIcon, UserPlusIcon } from '@heroicons/react/24/outline';

export const CreateCustomer: React.FC = () => {
  const navigate = useNavigate();
  const { addCustomer } = useApp();
  
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    taxId: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerData.name || !customerData.email) {
      alert('Please fill in the required fields (Name and Email).');
      return;
    }

    addCustomer({
      ...customerData,
      totalInvoices: 0,
      totalAmount: 0,
    });

    navigate('/customers');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/customers')}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Add New Customer</h1>
              <p className="text-slate-400 mt-1">
                Add a new customer to your database.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Customer Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={customerData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  placeholder="customer@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={customerData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tax ID (Optional)
                </label>
                <input
                  type="text"
                  value={customerData.taxId}
                  onChange={(e) => handleInputChange('taxId', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  placeholder="Tax identification number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Address
              </label>
              <textarea
                value={customerData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={4}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                placeholder="Enter full address including street, city, state, and postal code"
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700">
              <button
                type="button"
                onClick={() => navigate('/customers')}
                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
              >
                <UserPlusIcon className="w-5 h-5 mr-2" />
                Add Customer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};