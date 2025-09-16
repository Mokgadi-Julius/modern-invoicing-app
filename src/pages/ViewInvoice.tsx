import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { InvoicePreview } from '../components/InvoicePreview';
import {
  ArrowLeftIcon,
  PencilIcon,
  PrinterIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { generateInvoicePDF } from '../utils/pdfGenerator';

export const ViewInvoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shouldDownload = searchParams.get('download') === 'true';
  const { invoices, settings, getInvoice, updateInvoice } = useApp();
  const [invoice, setInvoice] = useState<any>(null);
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
  }, [id]);

  // Auto-download PDF if requested via query parameter
  useEffect(() => {
    if (invoice && shouldDownload && !loading) {
      // Small delay to ensure the DOM is fully rendered
      const timer = setTimeout(() => {
        handleDownloadPDF();
        // Close the tab after download (for popup windows)
        if (window.opener) {
          window.close();
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [invoice, shouldDownload, loading]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading invoice...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Error Loading Invoice</h1>
          <p className="text-slate-400 mb-6">{error}</p>
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

  // Check if required invoice properties exist
  if (!invoice.from || !invoice.to) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Invoice Data Incomplete</h1>
          <p className="text-slate-400 mb-6">The invoice data is missing required information.</p>
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

  const handleDownloadPDF = async () => {
    if (!invoice) return;

    try {
      const invoiceElement = document.querySelector('.invoice-preview-container') as HTMLElement;
      if (!invoiceElement) {
        alert('Invoice preview not found. Please ensure the invoice is fully loaded.');
        return;
      }

      await generateInvoicePDF(
        invoiceElement,
        invoice.invoiceNumber,
        invoice.to?.name || 'Unknown Client'
      );
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const handleMarkAsPaid = async () => {
    if (!invoice) return;
    try {
      await updateInvoice(invoice.id, {
        status: 'paid',
        paymentStatus: 'paid',
        paidAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      alert('Failed to mark invoice as paid. Please try again.');
    }
  };

  const handleSendInvoice = async () => {
    if (!invoice || invoice.status !== 'draft') return;
    try {
      await updateInvoice(invoice.id, {
        status: 'sent',
        sentAt: new Date().toISOString(),
      });
      alert('Invoice sent successfully!');
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert('Failed to send invoice. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-6 print:bg-white print:text-black">
      <div className="max-w-4xl mx-auto">
        {/* Header - Hidden in print */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 print:hidden gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/invoices')}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Invoice {invoice.invoiceNumber}</h1>
              <p className="text-slate-400 mt-1 text-sm sm:text-base">
                Created on {format(new Date(invoice.createdAt), 'MMMM dd, yyyy')}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(invoice.status)}`}>
              {(invoice.status || 'draft').charAt(0).toUpperCase() + (invoice.status || 'draft').slice(1)}
            </span>
            {invoice.paymentStatus !== 'paid' && (
              <button
                onClick={handleMarkAsPaid}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium flex items-center transition-colors text-sm sm:text-base"
              >
                <CheckCircleIcon className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Mark as Paid</span>
                <span className="xs:hidden">Paid</span>
              </button>
            )}
            {invoice.status === 'draft' && (
              <button
                onClick={handleSendInvoice}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium flex items-center transition-colors text-sm sm:text-base"
              >
                <PaperAirplaneIcon className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Send Invoice</span>
                <span className="xs:hidden">Send</span>
              </button>
            )}
            <Link
              to={`/invoices/${invoice.id}/edit`}
              className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium flex items-center transition-colors text-sm sm:text-base"
            >
              <PencilIcon className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Edit</span>
            </Link>
            <button
              onClick={handleDownloadPDF}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium flex items-center transition-colors text-sm sm:text-base"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Download PDF</span>
              <span className="xs:hidden">PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium flex items-center transition-colors text-sm sm:text-base"
            >
              <PrinterIcon className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Invoice Content - Using Template-Based Preview */}
        <div className="invoice-preview-container bg-white rounded-xl shadow-2xl print:shadow-none overflow-hidden">
          <InvoicePreview
            invoice={invoice}
            templateId={invoice.templateId || 'classic'}
            logoSrc={settings.logoUrl}
            currency={settings.currency}
          />
        </div>
      </div>
    </div>
  );
};