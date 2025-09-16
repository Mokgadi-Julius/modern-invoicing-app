import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { InvoiceService } from '../services/invoiceService';
import { SavedInvoice, Invoice } from '../types';

interface InvoiceManagerProps {
  onLoadInvoice: (invoice: Invoice) => void;
  currentInvoice: Invoice;
  onNewInvoice: () => void;
}

const InvoiceManager: React.FC<InvoiceManagerProps> = ({ 
  onLoadInvoice, 
  currentInvoice,
  onNewInvoice 
}) => {
  const { currentUser, userProfile, logout } = useAuth();
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadInvoices = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const invoices = await InvoiceService.getUserInvoices(currentUser.uid);
      setSavedInvoices(invoices);
    } catch (error: any) {
      setError('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [currentUser]);

  const handleSaveInvoice = async () => {
    if (!currentUser) return;

    setSaving(true);
    setError('');

    try {
      if (currentInvoice.id) {
        // Update existing invoice
        await InvoiceService.updateInvoice(currentInvoice.id, currentInvoice, currentUser.uid);
      } else {
        // Create new invoice
        const id = await InvoiceService.saveInvoice(currentInvoice, currentUser.uid);
        // You might want to update the current invoice with the new ID
        console.log('Invoice saved with ID:', id);
      }
      
      await loadInvoices(); // Refresh the list
    } catch (error: any) {
      setError(error.message || 'Failed to save invoice');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadInvoice = async (invoiceId: string) => {
    if (!currentUser) return;

    try {
      const invoice = await InvoiceService.getInvoice(invoiceId, currentUser.uid);
      if (invoice) {
        onLoadInvoice(invoice);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load invoice');
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!currentUser) return;
    
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      await InvoiceService.deleteInvoice(invoiceId, currentUser.uid);
      await loadInvoices(); // Refresh the list
    } catch (error: any) {
      setError(error.message || 'Failed to delete invoice');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-500 bg-gray-100';
      case 'sent': return 'text-blue-500 bg-blue-100';
      case 'paid': return 'text-green-500 bg-green-100';
      case 'overdue': return 'text-red-500 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  return (
    <div className="h-full flex flex-col overflow-x-hidden w-full max-w-full">
      {/* User Profile Section */}
      <div className="p-3 sm:p-4 border-b border-slate-600 overflow-x-hidden">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-white truncate">{userData?.displayName}</h3>
            <p className="text-xs sm:text-sm text-slate-400 truncate">{userData?.companyName}</p>
          </div>
          <button
            onClick={logout}
            className="text-xs sm:text-sm text-red-400 hover:text-red-300 transition-colors ml-2 touch-target"
          >
            Logout
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onNewInvoice}
            className="bg-sky-500 hover:bg-sky-600 text-white text-xs sm:text-sm font-medium py-2 px-2 sm:px-3 rounded-lg transition duration-150 ease-in-out touch-target"
          >
            New Invoice
          </button>
          <button
            onClick={handleSaveInvoice}
            disabled={saving}
            className="bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white text-xs sm:text-sm font-medium py-2 px-2 sm:px-3 rounded-lg transition duration-150 ease-in-out flex items-center justify-center touch-target"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="hidden sm:inline">Saving...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-2 sm:mx-4 mt-2 sm:mt-4 bg-red-500/20 border border-red-500 text-red-400 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm">
          {error}
          <button 
            onClick={() => setError('')}
            className="float-right text-red-300 hover:text-red-200 ml-2 touch-target"
          >
            ×
          </button>
        </div>
      )}

      {/* Saved Invoices Section */}
      <div className="flex-1 overflow-hidden w-full max-w-full">
        <div className="p-3 sm:p-4 border-b border-slate-600 overflow-x-hidden">
          <h4 className="text-sm sm:text-md font-medium text-slate-300 mb-2">Saved Invoices</h4>
          <button
            onClick={loadInvoices}
            disabled={loading}
            className="text-xs sm:text-sm text-sky-400 hover:text-sky-300 transition-colors touch-target"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        <div className="overflow-y-auto overflow-x-hidden h-full w-full max-w-full">
          {loading ? (
            <div className="p-3 sm:p-4 text-center text-slate-400">
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-sky-400 mx-auto mb-2"></div>
              <p className="text-xs sm:text-sm">Loading invoices...</p>
            </div>
          ) : savedInvoices.length === 0 ? (
            <div className="p-3 sm:p-4 text-center text-slate-400">
              <p className="text-xs sm:text-sm">No saved invoices yet.</p>
              <p className="text-xs mt-1">Create your first invoice to get started!</p>
            </div>
          ) : (
            <div className="space-y-2 p-2 sm:p-4">
              {savedInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="bg-slate-700/50 border border-slate-600 rounded-lg p-2 sm:p-3 hover:bg-slate-700/70 transition-colors cursor-pointer group touch-target"
                  onClick={() => handleLoadInvoice(invoice.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs sm:text-sm font-medium text-white truncate">{invoice.invoiceNumber}</h5>
                      <p className="text-xs text-slate-400 truncate">{invoice.clientName}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteInvoice(invoice.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 sm:opacity-100 text-red-400 hover:text-red-300 transition-all ml-2 p-1 touch-target"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-slate-200">
                      R{invoice.total.toFixed(2)}
                    </span>
                    <span className={`text-xs px-1.5 sm:px-2 py-1 rounded-full font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(invoice.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceManager;