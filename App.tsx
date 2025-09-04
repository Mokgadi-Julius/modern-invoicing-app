
import React, { useState, useEffect, useCallback } from 'react';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { TemplateSelector } from './components/TemplateSelector';
import { Invoice, LineItem, CompanyDetails, TemplateId } from './types';
import { initialInvoiceData, TEMPLATES } from './constants';
import { PlusCircleIcon, PrinterIcon } from './components/Icons';

const App: React.FC = () => {
  const [invoice, setInvoice] = useState<Invoice>(initialInvoiceData);
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId>(TEMPLATES[0].id);
  const [logoSrc, setLogoSrc] = useState<string | null>(null);

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-4 gap-4 print:block print:p-0 print:bg-white print:text-black">
      <div className="w-full md:w-2/5 lg:w-1/3 bg-slate-800 p-6 rounded-xl shadow-2xl print:hidden overflow-y-auto max-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-sky-400">Create Invoice</h1>
        
        <TemplateSelector
          templates={TEMPLATES}
          selectedTemplateId={selectedTemplateId}
          onSelectTemplate={setSelectedTemplateId}
        />
        
        <InvoiceForm
          invoice={invoice}
          updateInvoiceField={updateInvoiceField}
          updateCompanyDetails={updateCompanyDetails}
          addLineItem={addLineItem}
          updateLineItem={updateLineItem}
          removeLineItem={removeLineItem}
          onLogoChange={handleLogoChange}
          logoSrc={logoSrc}
        />
        
        <button
          onClick={handlePrint}
          className="mt-8 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-150 ease-in-out flex items-center justify-center"
        >
          <PrinterIcon className="w-5 h-5 mr-2" />
          Print / Save PDF
        </button>
      </div>

      <div className="w-full md:w-3/5 lg:w-2/3 print:w-full overflow-y-auto max-h-screen print:max-h-none print:overflow-visible">
        <InvoicePreview invoice={invoice} templateId={selectedTemplateId} logoSrc={logoSrc} />
      </div>
    </div>
  );
};

export default App;