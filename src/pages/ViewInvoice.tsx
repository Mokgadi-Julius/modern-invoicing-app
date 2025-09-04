import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import {
  ArrowLeftIcon,
  PencilIcon,
  PrinterIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export const ViewInvoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoices, settings, updateInvoice } = useApp();
  
  const invoice = invoices.find(inv => inv.id === id);

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Invoice Not Found</h1>
          <p className="text-slate-400 mb-6">The invoice you're looking for doesn't exist.</p>
          <Link
            to="/invoices"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency || 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
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

  const handlePrint = () => {
    window.print();
  };

  const handleMarkAsPaid = () => {
    const updatedInvoice = {
      ...invoice,
      status: 'paid' as const,
      paymentStatus: 'paid' as const,
      paidAt: new Date().toISOString(),
    };
    updateInvoice(updatedInvoice);
  };

  const handleSendInvoice = () => {
    if (invoice.status === 'draft') {
      const updatedInvoice = {
        ...invoice,
        status: 'sent' as const,
        sentAt: new Date().toISOString(),
      };
      updateInvoice(updatedInvoice);
      alert('Invoice sent successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-6 print:bg-white print:text-black">
      <div className="max-w-4xl mx-auto">
        {/* Header - Hidden in print */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/invoices')}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Invoice {invoice.invoiceNumber}</h1>
              <p className="text-slate-400 mt-1">
                Created on {format(new Date(invoice.createdAt), 'MMMM dd, yyyy')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </span>
            {invoice.paymentStatus !== 'paid' && (
              <button
                onClick={handleMarkAsPaid}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
              >
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Mark as Paid
              </button>
            )}
            {invoice.status === 'draft' && (
              <button
                onClick={handleSendInvoice}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
              >
                <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                Send Invoice
              </button>
            )}
            <Link
              to={`/invoices/${invoice.id}/edit`}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={handlePrint}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
            >
              <PrinterIcon className="w-4 h-4 mr-2" />
              Print
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="bg-white text-black p-8 rounded-xl shadow-2xl print:shadow-none print:p-0">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2">INVOICE</h1>
              <p className="text-xl text-slate-600">#{invoice.invoiceNumber}</p>
            </div>
            {settings.logoUrl && (
              <img src={settings.logoUrl} alt="Company Logo" className="h-20 object-contain" />
            )}
          </div>

          {/* Company Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">FROM</h3>
              <div className="text-slate-700">
                <p className="font-medium text-lg">{invoice.from.name}</p>
                <p className="whitespace-pre-line">{invoice.from.address}</p>
                <p>{invoice.from.email}</p>
                <p>{invoice.from.phone}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">TO</h3>
              <div className="text-slate-700">
                <p className="font-medium text-lg">{invoice.to.name}</p>
                <p className="whitespace-pre-line">{invoice.to.address}</p>
                <p>{invoice.to.email}</p>
                <p>{invoice.to.phone}</p>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <p className="text-slate-600">Invoice Date</p>
                <p className="font-medium">{format(new Date(invoice.date), 'MMMM dd, yyyy')}</p>
              </div>
              <div className="mb-4">
                <p className="text-slate-600">Due Date</p>
                <p className="font-medium">{format(new Date(invoice.dueDate), 'MMMM dd, yyyy')}</p>
              </div>
            </div>
            <div>
              <div className="mb-4">
                <p className="text-slate-600">Payment Type</p>
                <p className="font-medium">
                  {invoice.paymentType === 'once-off' ? 'One-time Payment' : 'Monthly Recurring'}
                </p>
              </div>
              {invoice.paidAt && (
                <div className="mb-4">
                  <p className="text-slate-600">Payment Date</p>
                  <p className="font-medium text-green-600">
                    {format(new Date(invoice.paidAt), 'MMMM dd, yyyy')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-300">
                  <th className="text-left py-3 font-semibold text-slate-800">Description</th>
                  <th className="text-right py-3 font-semibold text-slate-800">Qty</th>
                  <th className="text-right py-3 font-semibold text-slate-800">Unit Price</th>
                  <th className="text-right py-3 font-semibold text-slate-800">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-200">
                    <td className="py-3 text-slate-700">{item.description}</td>
                    <td className="text-right py-3 text-slate-700">{item.quantity}</td>
                    <td className="text-right py-3 text-slate-700">{formatCurrency(item.unitPrice)}</td>
                    <td className="text-right py-3 font-medium text-slate-800">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-full max-w-xs">
              <div className="flex justify-between py-2 text-slate-700">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.subTotal)}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between py-2 text-slate-700">
                  <span>
                    Discount {invoice.discountType === 'percentage' ? `(${invoice.discountValue}%)` : ''}:
                  </span>
                  <span>-{formatCurrency(invoice.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 text-slate-700">
                <span>Tax ({invoice.taxRate}%):</span>
                <span>{formatCurrency(invoice.taxAmount)}</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-slate-300 font-bold text-lg text-slate-800">
                <span>Total:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="mb-8 p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center">
              {invoice.paymentStatus === 'paid' ? (
                <CheckCircleIcon className="w-6 h-6 text-green-600 mr-3" />
              ) : (
                <ClockIcon className="w-6 h-6 text-yellow-600 mr-3" />
              )}
              <div>
                <p className="font-medium text-slate-800">
                  Payment Status: {invoice.paymentStatus.charAt(0).toUpperCase() + invoice.paymentStatus.slice(1)}
                </p>
                {invoice.paymentStatus === 'paid' && invoice.paidAt && (
                  <p className="text-sm text-slate-600">
                    Paid on {format(new Date(invoice.paidAt), 'MMMM dd, yyyy')}
                  </p>
                )}
                {invoice.paymentStatus !== 'paid' && (
                  <p className="text-sm text-slate-600">
                    Due on {format(new Date(invoice.dueDate), 'MMMM dd, yyyy')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Notes & Terms</h3>
              <p className="text-slate-700 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};