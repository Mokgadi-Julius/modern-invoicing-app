import React from 'react';
import { Invoice } from '../../types';

interface ClassicTemplateProps {
  invoice: Invoice;
  logoSrc?: string | null;
  currency?: string;
}

export const ClassicTemplate: React.FC<ClassicTemplateProps> = ({ invoice, logoSrc, currency = 'USD' }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-blue-200 rounded-xl shadow-lg overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              {logoSrc ? (
                <img 
                  src={logoSrc} 
                  alt="Company Logo" 
                  className="max-h-16 mb-3 object-contain"
                />
              ) : (
                <h1 className="text-2xl font-black text-gray-900">{invoice.from.name}</h1>
              )}
              <p className="text-blue-600 font-medium">{invoice.from.address}</p>
              <div className="flex flex-wrap gap-3 mt-2">
                <p className="text-blue-600 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {invoice.from.email}
                </p>
                <p className="text-blue-600 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  {invoice.from.phone}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-blue-100 mb-1">Invoice</h2>
                <p className="text-xl font-black">{invoice.invoiceNumber}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Issue Date</p>
          <p className="text-gray-900 font-bold mt-1">{formatDate(invoice.date)}</p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Due Date</p>
          <p className="text-gray-900 font-bold mt-1">{formatDate(invoice.dueDate)}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-purple-600">Payment</p>
          <p className="text-gray-900 font-bold mt-1 capitalize">{invoice.paymentType}</p>
        </div>
      </div>

      {/* Company Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 pb-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <h3 className="font-bold text-blue-700 uppercase tracking-wider text-xs">From</h3>
          </div>
          <p className="font-bold text-gray-900">{invoice.from.name}</p>
          <p className="text-gray-600 text-sm mt-1">{invoice.from.address}</p>
          <p className="text-gray-600 text-sm mt-1">{invoice.from.email}</p>
          <p className="text-gray-600 text-sm mt-1">{invoice.from.phone}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
            <h3 className="font-bold text-indigo-700 uppercase tracking-wider text-xs">To</h3>
          </div>
          <p className="font-bold text-gray-900">{invoice.to.name}</p>
          <p className="text-gray-600 text-sm mt-1">{invoice.to.address}</p>
          <p className="text-gray-600 text-sm mt-1">{invoice.to.email}</p>
          <p className="text-gray-600 text-sm mt-1">{invoice.to.phone}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-xl border border-blue-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <th className="py-3 px-4 text-left text-xs font-bold uppercase">Description</th>
                <th className="py-3 px-4 text-left text-xs font-bold uppercase">Qty</th>
                <th className="py-3 px-4 text-left text-xs font-bold uppercase">Price</th>
                <th className="py-3 px-4 text-right text-xs font-bold uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b border-blue-100 last:border-b-0 hover:bg-blue-50">
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
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 rounded-xl border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-blue-700 uppercase tracking-wider text-xs mb-2">Notes</h3>
              <p className="text-gray-700 bg-white p-3 rounded-lg border border-blue-100 text-sm">
                {invoice.notes || 'Thank you for your business!'}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900 font-medium">{formatCurrency(invoice.subTotal)}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount:</span>
                  <span className="text-gray-900 font-medium">-{formatCurrency(invoice.discountAmount)}</span>
                </div>
              )}
              {invoice.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax ({invoice.taxRate}%):</span>
                  <span className="text-gray-900 font-medium">{formatCurrency(invoice.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-800 font-bold">Total:</span>
                <span className="text-gray-900 font-bold">{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banking Details */}
      {invoice.includeBankingDetails && invoice.bankingDetails && (
        <div className="px-6 pb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-bold text-blue-700 uppercase tracking-wider text-xs mb-3">Banking Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded border border-blue-100">
                <p className="text-xs text-blue-600">Bank Name</p>
                <p className="text-sm font-medium text-gray-900">{invoice.bankingDetails.bankName}</p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-100">
                <p className="text-xs text-blue-600">Account Name</p>
                <p className="text-sm font-medium text-gray-900">{invoice.bankingDetails.accountName}</p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-100">
                <p className="text-xs text-blue-600">Account Number</p>
                <p className="text-sm font-medium font-mono text-gray-900">{invoice.bankingDetails.accountNumber}</p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-100">
                <p className="text-xs text-blue-600">Branch Code</p>
                <p className="text-sm font-medium text-gray-900">{invoice.bankingDetails.routingNumber}</p>
              </div>
              {invoice.bankingDetails.swift && (
                <div className="bg-white p-3 rounded border border-blue-100">
                  <p className="text-xs text-blue-600">SWIFT Code</p>
                  <p className="text-sm font-medium text-gray-900">{invoice.bankingDetails.swift}</p>
                </div>
              )}
              <div className="bg-white p-3 rounded border border-blue-100 md:col-span-2">
                <p className="text-xs text-blue-600">Reference</p>
                <p className="text-sm font-medium text-gray-900">{invoice.bankingDetails.reference}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};