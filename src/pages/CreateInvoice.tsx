import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { TEMPLATES } from '../../constants';
import { InvoicePreview } from '../components/InvoicePreview';
import type { Invoice, LineItem, CompanyDetails, Customer, TemplateId, ProductTemplate, BankingDetails } from '../types';
import {
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
  UserPlusIcon,
  EyeIcon,
  ArrowLeftIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { generateInvoicePDF } from '../utils/pdfGenerator';

export const CreateInvoice: React.FC = () => {
  const navigate = useNavigate();
  const { customers, products, productTemplates, settings, createInvoice } = useApp();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId>(settings.defaultTemplate);
  const [showFullScreen, setShowFullScreen] = useState(false);

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
    includeBankingDetails: false,
    bankingDetails: {
      bankName: 'Capitec Business Account',
      accountName: 'Your Company Name',
      accountNumber: '1054 0348 18',
      routingNumber: '450105',
      swift: '',
      reference: 'Please use your invoice number as reference',
    },
    userId: '',
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

  const updateBankingDetails = useCallback((field: keyof BankingDetails, value: string) => {
    setInvoice(prev => ({
      ...prev,
      bankingDetails: {
        ...prev.bankingDetails,
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

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showFullScreen) {
        setShowFullScreen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showFullScreen]);

  const handleSave = async (status: 'draft' | 'sent') => {
    try {
      const newInvoice = { ...invoice, status, paymentStatus: 'unpaid' as const, templateId: selectedTemplateId };
      await createInvoice(newInvoice);
      navigate('/invoices');
    } catch (error) {
      console.error('Failed to save invoice:', error);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const invoiceElement = document.querySelector('.invoice-preview-container') as HTMLElement;
      if (!invoiceElement) {
        alert('Invoice preview not found. Please ensure the invoice preview is visible.');
        return;
      }

      await generateInvoicePDF(
        invoiceElement,
        invoice.invoiceNumber,
        invoice.to?.name || 'Client'
      );
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/invoices')}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Create Invoice</h1>
              <p className="text-slate-400 mt-1 text-sm sm:text-base">
                Create a new invoice for your customers.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={handleDownloadPDF}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base flex items-center justify-center"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Download PDF
            </button>
            <button
              onClick={() => handleSave('draft')}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSave('sent')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Save & Send
            </button>
          </div>
        </div>

        {/* Template Selector */}
        <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700 mb-6 sm:mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Invoice Template</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplateId(template.id)}
                className={`p-3 sm:p-4 rounded-lg border-2 text-left transition-colors text-sm sm:text-base ${
                  selectedTemplateId === template.id
                    ? 'border-blue-500 bg-blue-500/10 text-white'
                    : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-600'
                }`}
              >
                <div className="font-medium">{template.name}</div>
                <div className="text-xs sm:text-sm text-slate-400 mt-1">
                  {template.id === 'classic' && 'Professional and clean design'}
                  {template.id === 'modern' && 'Contemporary minimal style'}
                  {template.id === 'creative' && 'Unique creative layout'}
                  {template.id === 'writenow' && 'Clean business-focused template'}
                  {template.id === 'premium' && 'Enhanced visual design with gradients'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Logo Upload Section */}
        <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700 mb-6 sm:mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Company Logo</h2>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Upload Area */}
            <div className="flex-1">
              <div 
                className="border-2 border-dashed border-slate-600 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 transition-colors bg-slate-700/50"
                onClick={() => document.getElementById('logo-upload')?.click()}
              >
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-12 h-12 text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-slate-300 font-medium mb-1">Click to upload logo</p>
                  <p className="text-slate-500 text-sm">PNG, JPG, GIF up to 5MB</p>
                </div>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleLogoChange(file);
                    }
                  }}
                  className="hidden"
                />
              </div>
              {logoSrc && (
                <button
                  onClick={() => handleLogoChange(null)}
                  className="mt-3 text-sm text-red-400 hover:text-red-300 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove Logo
                </button>
              )}
            </div>
            
            {/* Preview */}
            <div className="flex flex-col items-center">
              <p className="text-slate-400 text-sm mb-2">Logo Preview</p>
              <div className="bg-slate-700 border border-slate-600 rounded-lg p-4 w-40 h-20 flex items-center justify-center">
                {logoSrc ? (
                  <img 
                    src={logoSrc} 
                    alt="Logo preview" 
                    className="max-h-12 object-contain"
                  />
                ) : (
                  <div className="text-slate-500 text-xs text-center">
                    No logo uploaded
                  </div>
                )}
              </div>
              <p className="text-slate-500 text-xs mt-2 text-center max-w-32">
                This will appear on your invoices
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Invoice Details */}
            <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">Invoice Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={invoice.invoiceNumber}
                    onChange={(e) => updateInvoiceField('invoiceNumber', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    value={invoice.date}
                    onChange={(e) => updateInvoiceField('date', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => updateInvoiceField('dueDate', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
                    Payment Type
                  </label>
                  <select
                    value={invoice.paymentType}
                    onChange={(e) => updateInvoiceField('paymentType', e.target.value as 'once-off' | 'monthly')}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-white focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  >
                    <option value="once-off">One-time Payment</option>
                    <option value="monthly">Monthly Recurring</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Customer Selection */}
            <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <h2 className="text-xl font-semibold text-white">Customer</h2>
                <button
                  onClick={() => setShowCustomerForm(!showCustomerForm)}
                  className="flex items-center text-blue-400 hover:text-blue-300 text-sm font-medium justify-center"
                >
                  <UserPlusIcon className="w-4 h-4 mr-1" />
                  {showCustomerForm ? 'Select Existing' : 'Add New Customer'}
                </button>
              </div>

              {showCustomerForm ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={invoice.to.name}
                    onChange={(e) => updateCompanyDetails('to', 'name', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={invoice.to.email}
                    onChange={(e) => updateCompanyDetails('to', 'email', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={invoice.to.phone}
                    onChange={(e) => updateCompanyDetails('to', 'phone', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  />
                  <div className="sm:col-span-2">
                    <textarea
                      placeholder="Customer Address"
                      value={invoice.to.address}
                      onChange={(e) => updateCompanyDetails('to', 'address', e.target.value)}
                      rows={3}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  {selectedCustomer ? (
                    <div className="p-3 sm:p-4 bg-slate-700 rounded-lg border border-slate-600">
                      <h3 className="font-semibold text-white text-sm sm:text-base">{selectedCustomer.name}</h3>
                      <p className="text-slate-400 text-xs sm:text-sm">{selectedCustomer.email}</p>
                      <p className="text-slate-400 text-xs sm:text-sm">{selectedCustomer.address}</p>
                    </div>
                  ) : (
                    <select
                      onChange={(e) => {
                        const customer = customers.find(c => c.id === e.target.value);
                        if (customer) selectCustomer(customer);
                      }}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-white focus:outline-none focus:border-blue-500 text-sm sm:text-base"
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
            <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Templates</h2>
              <p className="text-slate-400 text-xs sm:text-sm mb-4">
                Select a pre-configured package to quickly add multiple items to your invoice.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {productTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-slate-700 rounded-lg p-3 sm:p-4 border border-slate-600 hover:border-blue-500 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-white text-sm sm:text-base">{template.name}</h3>
                      <span className="text-xs text-slate-400">{template.category}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400 mb-3">{template.description}</p>
                    
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
                      <span className="font-medium text-white text-sm">
                        Total: {formatCurrency(template.totalPrice)}
                      </span>
                      <button
                        onClick={() => applyProductTemplate(template)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-2.5 py-1 sm:px-3 sm:py-1 rounded transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {productTemplates.length === 0 && (
                <div className="text-center py-6 sm:py-8 text-slate-400">
                  <DocumentTextIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm sm:text-base">No product templates available</p>
                  <p className="text-xs sm:text-sm">Add templates in the Products section</p>
                </div>
              )}
            </div>

            {/* Line Items */}
            <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <h2 className="text-xl font-semibold text-white">Items & Services</h2>
                <button
                  onClick={addLineItem}
                  className="flex items-center text-blue-400 hover:text-blue-300 text-sm font-medium justify-center"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add Item
                </button>
              </div>

              {/* Mobile Card Layout for Line Items */}
              <div className="sm:hidden space-y-4">
                {invoice.items.map((item) => (
                  <div key={item.id} className="bg-slate-750 rounded-lg p-4 border border-slate-600">
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Description
                      </label>
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm"
                          placeholder="Item description..."
                        />
                        {products.length > 0 && (
                          <select
                            onChange={(e) => selectProduct(item.id, e.target.value)}
                            className="bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500 text-sm"
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
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                          Unit Price
                        </label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(item.id, 'unitPrice', e.target.value)}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-slate-600">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                          Total
                        </label>
                        <div className="py-1 px-2 text-white font-medium text-sm">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </div>
                      </div>
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
              
              {/* Desktop Grid Layout for Line Items */}
              <div className="hidden sm:block space-y-4">
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
            <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">Tax & Discount</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={invoice.taxRate}
                    onChange={(e) => updateInvoiceField('taxRate', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
                    Discount Type
                  </label>
                  <select
                    value={invoice.discountType}
                    onChange={(e) => updateInvoiceField('discountType', e.target.value as 'percentage' | 'fixed')}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-white focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  >
                    <option value="fixed">Fixed Amount</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    value={invoice.discountValue}
                    onChange={(e) => updateInvoiceField('discountValue', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                    min="0"
                    step="0.01"
                    placeholder={invoice.discountType === 'percentage' ? 'Percentage (0-100)' : 'Fixed amount'}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">Notes & Terms</h2>
              <textarea
                value={invoice.notes}
                onChange={(e) => updateInvoiceField('notes', e.target.value)}
                rows={4}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                placeholder="Add any additional notes or payment terms..."
              />
            </div>

            {/* Banking Details */}
            <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Banking Details</h2>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={invoice.includeBankingDetails}
                    onChange={(e) => updateInvoiceField('includeBankingDetails', e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600 rounded bg-slate-700"
                  />
                  <span className="text-sm text-slate-300">Include on invoice</span>
                </label>
              </div>

              {invoice.includeBankingDetails && (
                <div className="space-y-3 sm:space-y-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={invoice.bankingDetails.bankName}
                        onChange={(e) => updateBankingDetails('bankName', e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                        placeholder="e.g. First National Bank"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
                        Account Name
                      </label>
                      <input
                        type="text"
                        value={invoice.bankingDetails.accountName}
                        onChange={(e) => updateBankingDetails('accountName', e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                        placeholder="Your Company Name"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={invoice.bankingDetails.accountNumber}
                        onChange={(e) => updateBankingDetails('accountNumber', e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                        placeholder="123456789"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
                        Branch Code / Sort Code
                      </label>
                      <input
                        type="text"
                        value={invoice.bankingDetails.routingNumber}
                        onChange={(e) => updateBankingDetails('routingNumber', e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                        placeholder="450105"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
                        SWIFT Code (Optional)
                      </label>
                      <input
                        type="text"
                        value={invoice.bankingDetails.swift || ''}
                        onChange={(e) => updateBankingDetails('swift', e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                        placeholder="ABCDUS33XXX"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
                        Payment Reference (Optional)
                      </label>
                      <input
                        type="text"
                        value={invoice.bankingDetails.reference || ''}
                        onChange={(e) => updateBankingDetails('reference', e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                        placeholder="Invoice reference"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="sticky top-6">
            <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-white">Invoice Preview</h2>
                <button
                  onClick={() => setShowFullScreen(true)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  title="View Full Screen"
                >
                  <EyeIcon className="w-5 sm:w-6 h-5 sm:h-6" />
                </button>
              </div>
              
              {/* Preview Content */}
              <div className="invoice-preview-container overflow-auto max-h-[80vh]">
                <InvoicePreview
                  invoice={invoice as Invoice}
                  templateId={selectedTemplateId}
                  logoSrc={logoSrc || settings.logoUrl || null}
                  currency={settings.currency}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Full Screen Invoice Preview Modal */}
        {showFullScreen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative w-full h-full max-w-6xl mx-4 my-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-white">Invoice Preview - {invoice.invoiceNumber}</h3>
                <button
                  onClick={() => setShowFullScreen(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  title="Close Full Screen"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="h-full overflow-auto p-8 bg-slate-50">
                <div className="invoice-preview-container max-w-4xl mx-auto">
                  <InvoicePreview
                    invoice={invoice as Invoice}
                    templateId={selectedTemplateId}
                    logoSrc={logoSrc || settings.logoUrl || null}
                    currency={settings.currency}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};