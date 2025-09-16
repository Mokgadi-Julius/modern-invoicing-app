
import React, { useState, useEffect, useCallback } from 'react';
import { InvoiceForm } from './src/components/InvoiceForm';
import { InvoicePreview } from './src/components/InvoicePreview';
import { TemplateSelector } from './src/components/TemplateSelector';
import InvoiceManager from './src/components/InvoiceManager';
import AdminDashboard from './src/components/AdminDashboard';
import { Invoice, LineItem, CompanyDetails, TemplateId, BankingDetails } from './types';
import { initialInvoiceData, TEMPLATES } from './constants';
import { PlusCircleIcon, PrinterIcon, EyeIcon, XMarkIcon } from './src/components/Icons';
import { useAuth } from './src/contexts/AuthContext';
import { InvoiceService } from './src/services/invoiceService';
import { checkForUpdates, getVersionInfo } from './src/utils/version';

const App: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const [invoice, setInvoice] = useState<Invoice>(initialInvoiceData);
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId>(TEMPLATES[0].id);
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState<string>('INV-001');
  const [showFullScreen, setShowFullScreen] = useState(false);

  const updateInvoiceField = useCallback(<K extends keyof Invoice>(field: K, value: Invoice[K]) => {
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

  // Initialize with next invoice number on mount
  useEffect(() => {
    if (currentUser) {
      handleNewInvoice();
    }
  }, [currentUser]);

  // Check for app updates on mount
  useEffect(() => {
    const handleUpdates = async () => {
      try {
        const hasUpdates = await checkForUpdates();
        if (hasUpdates) {
          console.log('App updated to new version:', getVersionInfo());
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    };

    handleUpdates();
  }, []);

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

  const handlePrint = () => {
    window.print();
  };

  const handleLoadInvoice = (loadedInvoice: Invoice) => {
    setInvoice(loadedInvoice);
    // Reset logo if the loaded invoice doesn't have one
    if (!loadedInvoice.from.name) {
      setLogoSrc(null);
    }
  };

  const handleNewInvoice = async () => {
    if (currentUser) {
      try {
        const newNumber = await InvoiceService.getNextInvoiceNumber(currentUser.uid);
        setNextInvoiceNumber(newNumber);
        setInvoice({
          ...initialInvoiceData,
          invoiceNumber: newNumber,
          id: undefined // Clear ID for new invoice
        });
        setLogoSrc(null);
      } catch (error) {
        console.error('Error generating invoice number:', error);
      }
    } else {
      setInvoice(initialInvoiceData);
      setLogoSrc(null);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col lg:flex-row bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 print:block print:p-0 print:bg-white print:text-black">
      {/* Invoice Manager Sidebar */}
      <div className="w-full lg:w-80 bg-slate-800 shadow-2xl print:hidden flex flex-col h-auto lg:max-h-screen">
        <InvoiceManager 
          onLoadInvoice={handleLoadInvoice}
          currentInvoice={invoice}
          onNewInvoice={handleNewInvoice}
        />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row p-1 sm:p-2 lg:p-4 gap-1 sm:gap-2 lg:gap-4 w-full max-w-full overflow-x-hidden">
        <div className="w-full lg:w-2/5 xl:w-1/3 bg-slate-800 p-3 sm:p-4 lg:p-6 rounded-lg lg:rounded-xl shadow-2xl print:hidden overflow-y-auto overflow-x-hidden h-auto lg:max-h-screen">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 lg:mb-6 text-sky-400">Create Invoice</h1>
        
        <TemplateSelector
          templates={TEMPLATES}
          selectedTemplateId={selectedTemplateId}
          onSelectTemplate={setSelectedTemplateId}
        />
        
        <InvoiceForm
          invoice={invoice}
          updateInvoiceField={updateInvoiceField}
          updateCompanyDetails={updateCompanyDetails}
          updateBankingDetails={updateBankingDetails}
          addLineItem={addLineItem}
          updateLineItem={updateLineItem}
          removeLineItem={removeLineItem}
          onLogoChange={handleLogoChange}
          logoSrc={logoSrc}
        />
        
          <button
            onClick={handlePrint}
            className="mt-4 sm:mt-6 lg:mt-8 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 sm:py-3 px-3 sm:px-4 rounded-lg shadow-md transition duration-150 ease-in-out flex items-center justify-center text-sm sm:text-base touch-target"
          >
            <PrinterIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Print / Save PDF
          </button>
        </div>

        <div className="w-full lg:w-3/5 xl:w-2/3 print:w-full overflow-y-auto overflow-x-hidden h-auto lg:max-h-screen print:max-h-none print:overflow-visible relative mt-2 lg:mt-0">
          <div className="flex items-center justify-between mb-4 print:hidden">
            <h2 className="text-lg sm:text-xl font-semibold text-white">Invoice Preview</h2>
            <button
              onClick={() => setShowFullScreen(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="View Full Screen"
            >
              <EyeIcon className="w-5 sm:w-6 h-5 sm:h-6" />
            </button>
          </div>
          <InvoicePreview invoice={invoice} templateId={selectedTemplateId} logoSrc={logoSrc} />
        </div>
      </div>
      
      {/* Admin Dashboard Overlay */}
      {isAdmin && <AdminDashboard />}

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
              <div className="max-w-4xl mx-auto">
                <InvoicePreview
                  invoice={invoice}
                  templateId={selectedTemplateId}
                  logoSrc={logoSrc}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;