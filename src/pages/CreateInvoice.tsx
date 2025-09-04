import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { TEMPLATES } from '../../constants';
import type { Invoice, LineItem, CompanyDetails, Customer, TemplateId, ProductTemplate } from '../types';
import {
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
  UserPlusIcon,
  EyeIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

export const CreateInvoice: React.FC = () => {
  const navigate = useNavigate();
  const { customers, products, productTemplates, settings, addInvoice } = useApp();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId>(settings.defaultTemplate);

  const [invoice, setInvoice] = useState<Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>>({
    invoiceNumber: `${settings.invoicePrefix}-${settings.nextInvoiceNumber.toString().padStart(4, '0')}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + settings.defaultPaymentTerms * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    from: settings.companyDetails,
    to: {
      name: '',
      address: '',
      email: '',
      phone: '',
    },
    customerId: '',
    items: [
      {
        id: '1',
        description: '',
        quantity: 1,
        unitPrice: 0,
      },
    ],
    notes: 'Thank you for your business! Payment is due within 30 days.',
    paymentType: 'once-off',
    taxRate: settings.defaultTaxRate,
    discountType: 'fixed',
    discountValue: 0,
    subTotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    total: 0,
    status: 'draft',
    paymentStatus: 'unpaid',
  });

  const updateInvoiceField = useCallback(<K extends keyof typeof invoice>(field: K, value: (typeof invoice)[K]) => {
    setInvoice(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateCompanyDetails = useCallback((party: 'from' | 'to', field: keyof CompanyDetails, value: string) => {
    setInvoice(prev => ({
      ...prev,
      [party]: {
        ...prev[party],
        [field]: value,
      }
    }));
  }, []);

  const addLineItem = useCallback(() => {
    const newItem: LineItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      description: '',
      quantity: 1,
      unitPrice: 0,
    };
    setInvoice(prev => ({ ...prev, items: [...prev.items, newItem] }));
  }, []);

  const updateLineItem = useCallback((id: string, field: keyof Omit<LineItem, 'id'>, value: string | number) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, [field]: field === 'description' ? value : Number(value) } : item
      ),
    }));
  }, []);

  const removeLineItem = useCallback((id: string) => {
    setInvoice(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
  }, []);

  const selectProduct = (itemId: string, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      updateLineItem(itemId, 'description', product.name);
      updateLineItem(itemId, 'unitPrice', product.unitPrice);
    }
  };

  const applyProductTemplate = (template: ProductTemplate) => {
    const newItems = template.items.map(item => ({
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9) + item.id,
    }));
    setInvoice(prev => ({ ...prev, items: newItems }));
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    updateInvoiceField('customerId', customer.id);
    updateCompanyDetails('to', 'name', customer.name);
    updateCompanyDetails('to', 'email', customer.email);
    updateCompanyDetails('to', 'address', customer.address);
    updateCompanyDetails('to', 'phone', customer.phone);
    setShowCustomerForm(false);
  };

  const handleLogoChange = useCallback((file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoSrc(null);
    }
  }, []);

  // Calculate totals
  useEffect(() => {
    const subTotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const taxAmount = subTotal * (invoice.taxRate / 100);
    const discountAmount = invoice.discountType === 'percentage' 
      ? subTotal * (invoice.discountValue / 100)
      : invoice.discountValue;
    const grandTotal = subTotal + taxAmount - discountAmount;

    setInvoice(prev => ({
      ...prev,
      subTotal,
      taxAmount,
      discountAmount,
      total: grandTotal,
    }));
  }, [invoice.items, invoice.taxRate, invoice.discountValue, invoice.discountType]);

  const handleSave = (status: 'draft' | 'sent') => {
    const newInvoice = { ...invoice, status, paymentStatus: 'unpaid' as const };
    addInvoice(newInvoice);
    navigate('/invoices');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency || 'USD',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/invoices')}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Create Invoice</h1>
              <p className="text-slate-400 mt-1">
                Create a new invoice for your customers.
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => handleSave('draft')}
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSave('sent')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Save & Send
            </button>
          </div>
        </div>

        {/* Template Selector */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Invoice Template</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplateId(template.id)}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedTemplateId === template.id
                    ? 'border-blue-500 bg-blue-500/10 text-white'
                    : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-600'
                }`}
              >
                <div className="font-medium">{template.name}</div>
                <div className="text-sm text-slate-400 mt-1">
                  {template.id === 'classic' && 'Professional and clean design'}
                  {template.id === 'modern' && 'Contemporary minimal style'}
                  {template.id === 'creative' && 'Unique creative layout'}
                </div>
              </button>
            ))}
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

            {/* Customer Selection */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Customer</h2>
                <button
                  onClick={() => setShowCustomerForm(!showCustomerForm)}
                  className="flex items-center text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  <UserPlusIcon className="w-4 h-4 mr-1" />
                  {showCustomerForm ? 'Select Existing' : 'Add New Customer'}
                </button>
              </div>

              {showCustomerForm ? (
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
              ) : (
                <div>
                  {selectedCustomer ? (
                    <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                      <h3 className="font-semibold text-white">{selectedCustomer.name}</h3>
                      <p className="text-slate-400 text-sm">{selectedCustomer.email}</p>
                      <p className="text-slate-400 text-sm">{selectedCustomer.address}</p>
                    </div>
                  ) : (
                    <select
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
                  )}
                </div>
              )}
            </div>

            {/* Product Templates */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Templates</h2>
              <p className="text-slate-400 text-sm mb-4">
                Select a pre-configured package to quickly add multiple items to your invoice.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {productTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-slate-700 rounded-lg p-4 border border-slate-600 hover:border-blue-500 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-white">{template.name}</h3>
                      <span className="text-sm text-slate-400">{template.category}</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{template.description}</p>
                    
                    <div className="space-y-1 mb-3">
                      {template.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="text-xs text-slate-300 flex justify-between">
                          <span>{item.description}</span>
                          <span>{item.quantity}x {formatCurrency(item.unitPrice)}</span>
                        </div>
                      ))}
                      {template.items.length > 3 && (
                        <div className="text-xs text-slate-400">
                          +{template.items.length - 3} more items
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-white">
                        Total: {formatCurrency(template.totalPrice)}
                      </span>
                      <button
                        onClick={() => applyProductTemplate(template)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {productTemplates.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No product templates available</p>
                  <p className="text-sm">Add templates in the Products section</p>
                </div>
              )}
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
              <div className={`bg-white text-black p-6 rounded-lg ${
                selectedTemplateId === 'classic' ? 'classic-template' :
                selectedTemplateId === 'modern' ? 'modern-template' :
                'creative-template'
              }`}>
                <div className={`flex justify-between items-start mb-6 ${
                  selectedTemplateId === 'modern' ? 'border-b-2 border-blue-500 pb-4' :
                  selectedTemplateId === 'creative' ? 'bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg' :
                  ''
                }`}>
                  <div>
                    <h1 className={`text-2xl font-bold ${
                      selectedTemplateId === 'modern' ? 'text-blue-600' :
                      selectedTemplateId === 'creative' ? 'text-purple-600 font-extrabold' :
                      'text-slate-800'
                    }`}>INVOICE</h1>
                    <p className={`${
                      selectedTemplateId === 'modern' ? 'text-blue-400' :
                      selectedTemplateId === 'creative' ? 'text-purple-500' :
                      'text-slate-600'
                    }`}>#{invoice.invoiceNumber}</p>
                  </div>
                  {(logoSrc || settings.logoUrl) && (
                    <img 
                      src={logoSrc || settings.logoUrl} 
                      alt="Company Logo" 
                      className={`h-16 object-contain ${
                        selectedTemplateId === 'creative' ? 'rounded-lg shadow-lg' : ''
                      }`}
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div>
                    <h3 className="font-semibold mb-2">FROM</h3>
                    <p className="font-medium">{invoice.from.name}</p>
                    <p className="text-sm text-slate-600">{invoice.from.address}</p>
                    <p className="text-sm text-slate-600">{invoice.from.email}</p>
                    <p className="text-sm text-slate-600">{invoice.from.phone}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">TO</h3>
                    <p className="font-medium">{invoice.to.name || 'Select a customer'}</p>
                    <p className="text-sm text-slate-600">{invoice.to.address}</p>
                    <p className="text-sm text-slate-600">{invoice.to.email}</p>
                    <p className="text-sm text-slate-600">{invoice.to.phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div>
                    <p><span className="font-medium">Date:</span> {invoice.date}</p>
                    <p><span className="font-medium">Due Date:</span> {invoice.dueDate}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Payment:</span> {invoice.paymentType}</p>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full mb-6">
                  <thead>
                    <tr className={`border-b-2 ${
                      selectedTemplateId === 'modern' ? 'border-blue-500 bg-blue-50' :
                      selectedTemplateId === 'creative' ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-blue-50' :
                      'border-slate-300 bg-slate-50'
                    }`}>
                      <th className={`text-left py-2 ${
                        selectedTemplateId === 'modern' ? 'text-blue-700' :
                        selectedTemplateId === 'creative' ? 'text-purple-700' :
                        'text-slate-800'
                      }`}>Description</th>
                      <th className={`text-right py-2 ${
                        selectedTemplateId === 'modern' ? 'text-blue-700' :
                        selectedTemplateId === 'creative' ? 'text-purple-700' :
                        'text-slate-800'
                      }`}>Qty</th>
                      <th className={`text-right py-2 ${
                        selectedTemplateId === 'modern' ? 'text-blue-700' :
                        selectedTemplateId === 'creative' ? 'text-purple-700' :
                        'text-slate-800'
                      }`}>Price</th>
                      <th className={`text-right py-2 ${
                        selectedTemplateId === 'modern' ? 'text-blue-700' :
                        selectedTemplateId === 'creative' ? 'text-purple-700' :
                        'text-slate-800'
                      }`}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item) => (
                      <tr key={item.id} className={`border-b ${
                        selectedTemplateId === 'modern' ? 'border-blue-200' :
                        selectedTemplateId === 'creative' ? 'border-purple-200' :
                        'border-slate-200'
                      }`}>
                        <td className="py-2">{item.description || 'Item description'}</td>
                        <td className="text-right py-2">{item.quantity}</td>
                        <td className="text-right py-2">{formatCurrency(item.unitPrice)}</td>
                        <td className="text-right py-2">{formatCurrency(item.quantity * item.unitPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-64">
                    <div className="flex justify-between py-1">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(invoice.subTotal)}</span>
                    </div>
                    {invoice.discountAmount > 0 && (
                      <div className="flex justify-between py-1">
                        <span>Discount:</span>
                        <span>-{formatCurrency(invoice.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1">
                      <span>Tax ({invoice.taxRate}%):</span>
                      <span>{formatCurrency(invoice.taxAmount)}</span>
                    </div>
                    <div className={`flex justify-between py-2 border-t-2 font-bold ${
                      selectedTemplateId === 'modern' ? 'border-blue-500 text-blue-700' :
                      selectedTemplateId === 'creative' ? 'border-purple-500 text-purple-700 bg-gradient-to-r from-purple-50 to-blue-50 px-3 rounded' :
                      'border-slate-300 text-slate-800'
                    }`}>
                      <span>Total:</span>
                      <span>{formatCurrency(invoice.total)}</span>
                    </div>
                  </div>
                </div>

                {invoice.notes && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Notes</h3>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{invoice.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};