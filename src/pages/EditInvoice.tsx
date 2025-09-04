import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import type { LineItem, CompanyDetails, Customer } from '../types';
import {
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

export const EditInvoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoices, customers, products, settings, updateInvoice } = useApp();
  
  const originalInvoice = invoices.find(inv => inv.id === id);
  
  const [invoice, setInvoice] = useState(originalInvoice);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if (originalInvoice) {
      setInvoice(originalInvoice);
      const customer = customers.find(c => c.id === originalInvoice.customerId);
      setSelectedCustomer(customer || null);
    }
  }, [originalInvoice, customers]);

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Invoice Not Found</h1>
          <p className="text-slate-400 mb-6">The invoice you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/invoices')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  const updateInvoiceField = useCallback(<K extends keyof typeof invoice>(field: K, value: (typeof invoice)[K]) => {
    setInvoice(prev => prev ? { ...prev, [field]: value } : prev);
  }, []);

  const updateCompanyDetails = useCallback((party: 'from' | 'to', field: keyof CompanyDetails, value: string) => {
    setInvoice(prev => prev ? ({
      ...prev,
      [party]: {
        ...prev[party],
        [field]: value,
      }
    }) : prev);
  }, []);

  const addLineItem = useCallback(() => {
    const newItem: LineItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      description: '',
      quantity: 1,
      unitPrice: 0,
    };
    setInvoice(prev => prev ? { ...prev, items: [...prev.items, newItem] } : prev);
  }, []);

  const updateLineItem = useCallback((itemId: string, field: keyof Omit<LineItem, 'id'>, value: string | number) => {
    setInvoice(prev => prev ? ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, [field]: field === 'description' ? value : Number(value) } : item
      ),
    }) : prev);
  }, []);

  const removeLineItem = useCallback((itemId: string) => {
    setInvoice(prev => prev ? { ...prev, items: prev.items.filter(item => item.id !== itemId) } : prev);
  }, []);

  const selectProduct = (itemId: string, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      updateLineItem(itemId, 'description', product.name);
      updateLineItem(itemId, 'unitPrice', product.unitPrice);
    }
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    updateInvoiceField('customerId', customer.id);
    updateCompanyDetails('to', 'name', customer.name);
    updateCompanyDetails('to', 'email', customer.email);
    updateCompanyDetails('to', 'address', customer.address);
    updateCompanyDetails('to', 'phone', customer.phone);
  };

  // Calculate totals
  useEffect(() => {
    if (!invoice) return;
    
    const subTotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const taxAmount = subTotal * (invoice.taxRate / 100);
    const discountAmount = invoice.discountType === 'percentage' 
      ? subTotal * (invoice.discountValue / 100)
      : invoice.discountValue;
    const grandTotal = subTotal + taxAmount - discountAmount;

    setInvoice(prev => prev ? ({
      ...prev,
      subTotal,
      taxAmount,
      discountAmount,
      total: grandTotal,
    }) : prev);
  }, [invoice?.items, invoice?.taxRate, invoice?.discountValue, invoice?.discountType]);

  const handleSave = () => {
    if (invoice) {
      updateInvoice(invoice);
      navigate(`/invoices/${invoice.id}`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency || 'USD',
    }).format(amount);
  };

  if (!invoice) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/invoices/${invoice.id}`)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Edit Invoice {invoice.invoiceNumber}</h1>
              <p className="text-slate-400 mt-1">
                Make changes to your invoice details.
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate(`/invoices/${invoice.id}`)}
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Invoice Details */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">Invoice Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={invoice.invoiceNumber}
                    onChange={(e) => updateInvoiceField('invoiceNumber', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    value={invoice.date}
                    onChange={(e) => updateInvoiceField('date', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => updateInvoiceField('dueDate', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Payment Type
                  </label>
                  <select
                    value={invoice.paymentType}
                    onChange={(e) => updateInvoiceField('paymentType', e.target.value as 'once-off' | 'monthly')}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="once-off">One-time Payment</option>
                    <option value="monthly">Monthly Recurring</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">Customer Details</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Customer
                </label>
                <select
                  value={selectedCustomer?.id || ''}
                  onChange={(e) => {
                    const customer = customers.find(c => c.id === e.target.value);
                    if (customer) selectCustomer(customer);
                  }}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select a customer...</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={invoice.to.name}
                  onChange={(e) => updateCompanyDetails('to', 'name', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={invoice.to.email}
                  onChange={(e) => updateCompanyDetails('to', 'email', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={invoice.to.phone}
                  onChange={(e) => updateCompanyDetails('to', 'phone', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
                <div className="md:col-span-2">
                  <textarea
                    placeholder="Customer Address"
                    value={invoice.to.address}
                    onChange={(e) => updateCompanyDetails('to', 'address', e.target.value)}
                    rows={3}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Items & Services</h2>
                <button
                  onClick={addLineItem}
                  className="flex items-center text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {invoice.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 items-end">
                    <div className="col-span-5">
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Description
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          className="flex-1 bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                          placeholder="Item description..."
                        />
                        {products.length > 0 && (
                          <select
                            onChange={(e) => selectProduct(item.id, e.target.value)}
                            className="bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="">Select Product</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Unit Price
                      </label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(item.id, 'unitPrice', e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Total
                      </label>
                      <div className="py-2 px-3 text-white font-medium">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <button
                        onClick={() => removeLineItem(item.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                        disabled={invoice.items.length === 1}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax and Discount */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">Tax & Discount</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={invoice.taxRate}
                    onChange={(e) => updateInvoiceField('taxRate', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Discount Type
                  </label>
                  <select
                    value={invoice.discountType}
                    onChange={(e) => updateInvoiceField('discountType', e.target.value as 'percentage' | 'fixed')}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="fixed">Fixed Amount</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    value={invoice.discountValue}
                    onChange={(e) => updateInvoiceField('discountValue', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    min="0"
                    step="0.01"
                    placeholder={invoice.discountType === 'percentage' ? 'Percentage (0-100)' : 'Fixed amount'}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">Notes & Terms</h2>
              <textarea
                value={invoice.notes}
                onChange={(e) => updateInvoiceField('notes', e.target.value)}
                rows={4}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                placeholder="Add any additional notes or payment terms..."
              />
            </div>
          </div>

          {/* Preview Section */}
          <div className="sticky top-6">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Invoice Preview</h2>
                <EyeIcon className="w-6 h-6 text-slate-400" />
              </div>
              
              {/* Preview Content */}
              <div className="bg-white text-black p-6 rounded-lg max-h-96 overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-2xl font-bold">INVOICE</h1>
                    <p className="text-slate-600">#{invoice.invoiceNumber}</p>
                  </div>
                  {settings.logoUrl && (
                    <img 
                      src={settings.logoUrl} 
                      alt="Company Logo" 
                      className="h-12 object-contain" 
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <h3 className="font-semibold mb-2">FROM</h3>
                    <p className="font-medium">{invoice.from.name}</p>
                    <p className="text-xs text-slate-600">{invoice.from.address}</p>
                    <p className="text-xs text-slate-600">{invoice.from.email}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">TO</h3>
                    <p className="font-medium">{invoice.to.name || 'Select a customer'}</p>
                    <p className="text-xs text-slate-600">{invoice.to.address}</p>
                    <p className="text-xs text-slate-600">{invoice.to.email}</p>
                  </div>
                </div>

                {/* Totals */}
                <div className="mt-4 text-right">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(invoice.subTotal)}</span>
                    </div>
                    {invoice.discountAmount > 0 && (
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>-{formatCurrency(invoice.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{formatCurrency(invoice.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Total:</span>
                      <span>{formatCurrency(invoice.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};