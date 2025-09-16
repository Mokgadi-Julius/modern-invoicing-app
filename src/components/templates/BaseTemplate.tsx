import React from 'react';
import { Invoice, LineItem } from '../../types';

interface BaseTemplateProps {
  invoice: Invoice;
  logoSrc?: string | null;
  currency?: string;
}

export const BaseTemplate: React.FC<BaseTemplateProps> = ({ invoice, logoSrc, currency = 'USD' }) => {
  // Safety checks for required data
  if (!invoice) {
    return (
      <div className="bg-white rounded-xl p-8 text-center text-gray-500">
        <p>Invoice data not available</p>
      </div>
    );
  }

  const safeInvoice = {
    ...invoice,
    from: invoice.from || { name: 'Company Name', address: '', email: '', phone: '' },
    to: invoice.to || { name: 'Client Name', address: '', email: '', phone: '' },
    items: invoice.items || [],
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount || 0);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-600 p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            {logoSrc ? (
              <img 
                src={logoSrc} 
                alt="Company Logo" 
                className="max-h-16 mb-3 object-contain"
              />
            ) : (
              <h1 className="text-2xl font-bold mb-2">{safeInvoice.from.name}</h1>
            )}
            <p className="text-slate-200">{safeInvoice.from.address}</p>
            <div className="flex flex-wrap gap-3 mt-2">
              <p className="text-slate-200 text-sm flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                {safeInvoice.from.email}
              </p>
              <p className="text-slate-200 text-sm flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {safeInvoice.from.phone}
              </p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-200 mb-1">Invoice</h2>
            <p className="text-2xl font-bold">{safeInvoice.invoiceNumber}</p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Issue Date</p>
          <p className="text-gray-900 font-bold mt-1">{formatDate(safeInvoice.date)}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Due Date</p>
          <p className="text-gray-900 font-bold mt-1">{formatDate(safeInvoice.dueDate)}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Payment</p>
          <p className="text-gray-900 font-bold mt-1 capitalize">{safeInvoice.paymentType}</p>
        </div>
      </div>

      {/* Company Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 pb-6">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs mb-2">From</h3>
          <p className="font-bold text-gray-900">{safeInvoice.from.name}</p>
          <p className="text-gray-600 text-sm mt-1">{safeInvoice.from.address}</p>
          <p className="text-gray-600 text-sm mt-1">{safeInvoice.from.email}</p>
          <p className="text-gray-600 text-sm mt-1">{safeInvoice.from.phone}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs mb-2">Billed To</h3>
          <p className="font-bold text-gray-900">{safeInvoice.to.name}</p>
          <p className="text-gray-600 text-sm mt-1">{safeInvoice.to.address}</p>
          <p className="text-gray-600 text-sm mt-1">{safeInvoice.to.email}</p>
          <p className="text-gray-600 text-sm mt-1">{safeInvoice.to.phone}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-100">
                <th className="py-3 px-4 text-left text-xs font-bold uppercase text-slate-600">Description</th>
                <th className="py-3 px-4 text-left text-xs font-bold uppercase text-slate-600">Qty</th>
                <th className="py-3 px-4 text-left text-xs font-bold uppercase text-slate-600">Price</th>
                <th className="py-3 px-4 text-right text-xs font-bold uppercase text-slate-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {safeInvoice.items.map((item: LineItem) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm text-gray-700">{item.description}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{item.quantity}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 text-right font-medium">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="px-6 pb-6">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs mb-2">Notes</h3>
              <p className="text-gray-700 bg-white p-3 rounded-lg border border-slate-100 text-sm">
                {safeInvoice.notes || 'Thank you for your business!'}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900 font-medium">{formatCurrency(safeInvoice.subTotal)}</span>
              </div>
              {safeInvoice.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount:</span>
                  <span className="text-gray-900 font-medium">-{formatCurrency(safeInvoice.discountAmount)}</span>
                </div>
              )}
              {safeInvoice.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax ({safeInvoice.taxRate}%):</span>
                  <span className="text-gray-900 font-medium">{formatCurrency(safeInvoice.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-800 font-bold">Total:</span>
                <span className="text-gray-900 font-bold">{formatCurrency(safeInvoice.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banking Details */}
      {safeInvoice.includeBankingDetails && safeInvoice.bankingDetails && (
        <div className="px-6 pb-6">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs mb-3">Banking Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded border border-slate-100">
                <p className="text-xs text-slate-600">Bank Name</p>
                <p className="text-sm font-medium text-gray-900">{safeInvoice.bankingDetails.bankName}</p>
              </div>
              <div className="bg-white p-3 rounded border border-slate-100">
                <p className="text-xs text-slate-600">Account Name</p>
                <p className="text-sm font-medium text-gray-900">{safeInvoice.bankingDetails.accountName}</p>
              </div>
              <div className="bg-white p-3 rounded border border-slate-100">
                <p className="text-xs text-slate-600">Account Number</p>
                <p className="text-sm font-medium font-mono text-gray-900">{safeInvoice.bankingDetails.accountNumber}</p>
              </div>
              <div className="bg-white p-3 rounded border border-slate-100">
                <p className="text-xs text-slate-600">Branch Code</p>
                <p className="text-sm font-medium text-gray-900">{safeInvoice.bankingDetails.routingNumber}</p>
              </div>
              {safeInvoice.bankingDetails.swift && (
                <div className="bg-white p-3 rounded border border-slate-100">
                  <p className="text-xs text-slate-600">SWIFT Code</p>
                  <p className="text-sm font-medium text-gray-900">{safeInvoice.bankingDetails.swift}</p>
                </div>
              )}
              <div className="bg-white p-3 rounded border border-slate-100 md:col-span-2">
                <p className="text-xs text-slate-600">Reference</p>
                <p className="text-sm font-medium text-gray-900">{safeInvoice.bankingDetails.reference}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};