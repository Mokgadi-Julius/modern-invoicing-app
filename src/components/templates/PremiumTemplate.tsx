import React from 'react';
import { Invoice } from '../../types';

interface PremiumTemplateProps {
  invoice: Invoice;
  logoSrc?: string | null;
  currency?: string;
}

export const PremiumTemplate: React.FC<PremiumTemplateProps> = ({ invoice, logoSrc, currency = 'USD' }) => {
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

  // Calculate days until due
  const daysUntilDue = Math.ceil(
    (new Date(invoice.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const getStatusColor = () => {
    if (daysUntilDue < 0) return 'bg-red-100 text-red-800';
    if (daysUntilDue <= 7) return 'bg-amber-100 text-amber-800';
    return 'bg-emerald-100 text-emerald-800';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-4xl mx-auto border border-gray-200">
      {/* Header with Premium Gradient */}
      <div className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 p-8 text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full translate-y-24 -translate-x-24"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          {/* Company Info with Logo */}
          <div className="flex-1">
            {logoSrc ? (
              <div className="mb-4">
                <img 
                  src={logoSrc} 
                  alt="Company Logo" 
                  className="max-h-16 object-contain"
                />
              </div>
            ) : (
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                {invoice.from.name}
              </h1>
            )}
            <p className="text-blue-200 text-lg mb-4">{invoice.from.address}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center text-blue-200">
                <svg className="w-5 h-5 mr-2 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="text-sm">{invoice.from.email}</span>
              </div>
              <div className="flex items-center text-blue-200">
                <svg className="w-5 h-5 mr-2 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span className="text-sm">{invoice.from.phone}</span>
              </div>
            </div>
          </div>
          
          {/* Invoice Info Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 mb-3">
                <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-blue-200 mb-1">Invoice</h2>
              <p className="text-3xl font-black text-white">{invoice.invoiceNumber}</p>
              <div className={`mt-4 px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor()} inline-flex items-center`}>
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {daysUntilDue < 0 ? 'OVERDUE' : daysUntilDue <= 7 ? `DUE IN ${daysUntilDue} DAYS` : 'CURRENT'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards with Icons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Issue Date</p>
              <p className="text-gray-900 font-bold text-lg">{formatDate(invoice.date)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start">
            <div className="p-3 bg-indigo-100 rounded-lg mr-4">
              <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Due Date</p>
              <p className="text-gray-900 font-bold text-lg">{formatDate(invoice.dueDate)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start">
            <div className="p-3 bg-emerald-100 rounded-lg mr-4">
              <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Payment</p>
              <p className="text-gray-900 font-bold text-lg capitalize">{invoice.paymentType.replace('-', ' ')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-6">
        <div className="bg-gradient-to-br from-blue-50/50 to-white p-6 rounded-xl border border-blue-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.789a1 1 0 01.787 0l4.772 2.121a1 1 0 00.788 0l7-3a1 1 0 000-1.84l-7-3zM3.25 9.888l7-3 7 3-7 3-7-3zm7 3.888l7-3 7 3-7 3-7-3zm-7 3l7-3 7 3-7 3-7-3z" />
              </svg>
            </div>
            <h3 className="font-bold text-blue-700 uppercase tracking-wider text-sm">From</h3>
          </div>
          <div className="pl-11">
            <p className="font-bold text-gray-900 text-lg">{invoice.from.name}</p>
            <p className="text-gray-600 mt-2">{invoice.from.address}</p>
            <div className="mt-3 space-y-1">
              <p className="text-gray-600 flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                {invoice.from.email}
              </p>
              <p className="text-gray-600 flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {invoice.from.phone}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-50/50 to-white p-6 rounded-xl border border-indigo-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.789a1 1 0 01.787 0l4.772 2.121a1 1 0 00.788 0l7-3a1 1 0 000-1.84l-7-3zM3.25 9.888l7-3 7 3-7 3-7-3zm7 3.888l7-3 7 3-7 3-7-3zm-7 3l7-3 7 3-7 3-7-3z" />
              </svg>
            </div>
            <h3 className="font-bold text-indigo-700 uppercase tracking-wider text-sm">Billed To</h3>
          </div>
          <div className="pl-11">
            <p className="font-bold text-gray-900 text-lg">{invoice.to.name}</p>
            <p className="text-gray-600 mt-2">{invoice.to.address}</p>
            <div className="mt-3 space-y-1">
              <p className="text-gray-600 flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                {invoice.to.email}
              </p>
              <p className="text-gray-600 flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {invoice.to.phone}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                  <th className="py-4 px-6 text-left text-sm font-bold uppercase tracking-wider">Description</th>
                  <th className="py-4 px-6 text-center text-sm font-bold uppercase tracking-wider">Qty</th>
                  <th className="py-4 px-6 text-right text-sm font-bold uppercase tracking-wider">Price</th>
                  <th className="py-4 px-6 text-right text-sm font-bold uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr 
                    key={item.id} 
                    className={`border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="py-4 px-6 text-gray-700 font-medium">{item.description}</td>
                    <td className="py-4 px-6 text-center text-gray-700">{item.quantity}</td>
                    <td className="py-4 px-6 text-right text-gray-700">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-4 px-6 text-right text-gray-900 font-bold">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Summary with Premium Styling */}
      <div className="px-6 pb-6">
        <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6 rounded-xl border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-gray-800 uppercase tracking-wider text-sm mb-4 flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Notes
              </h3>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-gray-700">
                  {invoice.notes || 'Thank you for your business!'}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900 font-medium">{formatCurrency(invoice.subTotal)}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Discount:</span>
                  <span className="text-emerald-600 font-medium">-{formatCurrency(invoice.discountAmount)}</span>
                </div>
              )}
              {invoice.taxAmount > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Tax ({invoice.taxRate}%):</span>
                  <span className="text-gray-900 font-medium">{formatCurrency(invoice.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-4 border-t border-gray-300 mt-2">
                <span className="text-gray-900 font-bold text-lg">Total:</span>
                <span className="text-blue-700 font-bold text-xl">{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banking Details */}
      {invoice.includeBankingDetails && invoice.bankingDetails && (
        <div className="px-6 pb-8">
          <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 uppercase tracking-wider text-sm mb-5 flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
              Banking Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Bank Name</p>
                <p className="text-sm font-medium text-gray-900">{invoice.bankingDetails.bankName}</p>
              </div>
              <div className="bg-white p-4 rounded border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Account Name</p>
                <p className="text-sm font-medium text-gray-900">{invoice.bankingDetails.accountName}</p>
              </div>
              <div className="bg-white p-4 rounded border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Account Number</p>
                <p className="text-sm font-medium font-mono text-gray-900 tracking-wider">{invoice.bankingDetails.accountNumber}</p>
              </div>
              <div className="bg-white p-4 rounded border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Branch Code</p>
                <p className="text-sm font-medium text-gray-900">{invoice.bankingDetails.routingNumber}</p>
              </div>
              {invoice.bankingDetails.swift && (
                <div className="bg-white p-4 rounded border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">SWIFT Code</p>
                  <p className="text-sm font-medium text-gray-900">{invoice.bankingDetails.swift}</p>
                </div>
              )}
              <div className="bg-blue-50 p-4 rounded border border-blue-200 md:col-span-2">
                <p className="text-xs text-blue-600 uppercase tracking-wider mb-1">Reference</p>
                <p className="text-sm font-medium text-blue-800">{invoice.bankingDetails.reference}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer with Branding */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 text-center">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-left">
            <p className="text-gray-400 text-sm">
              Thank you for your business!
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Payment is due within {Math.ceil((new Date(invoice.dueDate).getTime() - new Date(invoice.date).getTime()) / (1000 * 60 * 60 * 24))} days.
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-xs">
              Invoice generated on {formatDate(invoice.date)}
            </p>
            <p className="text-gray-600 text-xs mt-1">
              Powered by InvoiceWriteNow
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};