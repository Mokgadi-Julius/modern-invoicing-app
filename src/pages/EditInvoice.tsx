import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { TEMPLATES } from '../../constants';
import { InvoicePreview } from '../components/InvoicePreview';
import type { LineItem, CompanyDetails, Customer, TemplateId } from '../types';
import {
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  EyeIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { generateInvoicePDF } from '../utils/pdfGenerator';

export const EditInvoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoices, customers, products, settings, getInvoice, updateInvoice } = useApp();
  
  const [invoice, setInvoice] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId>('classic');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInvoice = async () => {
      
      if (!id) {
        setError('No invoice ID provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const fullInvoice = await getInvoice(id);
        
        if (fullInvoice) {
          setInvoice(fullInvoice);
          setSelectedTemplateId(fullInvoice.templateId || 'classic');
          const customer = customers.find(c => c.id === fullInvoice.customerId);
          setSelectedCustomer(customer || null);
        } else {
          setError('Invoice not found');
        }
      } catch (err) {
        console.error('Error loading invoice:', err);
        setError('Failed to load invoice: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    
    loadInvoice();
  }, [id, customers]);

  // Move all hooks before conditional returns
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Error Loading Invoice</h1>
          <p className="text-slate-400 mb-6">{error}</p>
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

  // Check if required invoice properties exist
  if (!invoice.from || !invoice.to) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Invoice Data Incomplete</h1>
          <p className="text-slate-400 mb-6">The invoice data is missing required information.</p>
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

  const handleSave = async () => {
    if (invoice) {
      await updateInvoice(invoice.id, { ...invoice, templateId: selectedTemplateId });
      navigate(`/invoices/${invoice.id}`);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;

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

  if (!invoice) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/invoices/${invoice.id}`)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Edit Invoice {invoice.invoiceNumber}</h1>
              <p className="text-slate-400 mt-1 text-sm sm:text-base">
                Make changes to your invoice details.
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
              onClick={() => navigate(`/invoices/${invoice.id}`)}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Save Changes
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

            {/* Customer Details */}
            <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">Customer Details</h2>
              
              <div className="mb-4">
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
                  Select Customer
                </label>
                <select
                  value={selectedCustomer?.id || ''}
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
              </div>

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
            </div>

            {/* Line Items */}
            <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <h2 className="text-lg sm:text-xl font-semibold text-white">Items & Services</h2>
                <button
                  onClick={addLineItem}
                  className="flex items-center text-blue-400 hover:text-blue-300 text-sm font-medium justify-center sm:justify-start"
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
          </div>

          {/* Preview Section */}
          <div className="sticky top-6">
            <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-white">Invoice Preview</h2>
                <EyeIcon className="w-5 sm:w-6 h-5 sm:h-6 text-slate-400" />
              </div>

              {/* Preview Content - Using Template-Based Preview */}
              <div className="invoice-preview-container overflow-auto max-h-[80vh] rounded-lg">
                <InvoicePreview
                  invoice={invoice}
                  templateId={selectedTemplateId}
                  logoSrc={settings.logoUrl}
                  currency={settings.currency}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};