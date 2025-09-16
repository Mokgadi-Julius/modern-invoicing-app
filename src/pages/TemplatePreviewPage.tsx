import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useTheme, getThemeClasses } from '../contexts/ThemeContext';
import { InvoicePreview } from '../components/InvoicePreview';
import { TEMPLATES } from '../../constants';
import { TemplateId } from '../types';
import type { Invoice } from '../types';

export const TemplatePreviewPage: React.FC = () => {
  const { settings } = useApp();
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('premium');
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('grid');

  // Sample invoice data for preview
  const sampleInvoice: Invoice = {
    id: 'preview-1',
    invoiceNumber: 'INV-2024-001',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    from: {
      name: settings.companyDetails.name || 'Your Company Name',
      address: settings.companyDetails.address || '123 Main Street, City, State 12345',
      email: settings.companyDetails.email || 'hello@yourcompany.com',
      phone: settings.companyDetails.phone || '(555) 123-4567',
    },
    to: {
      name: 'Client Company Name',
      address: '456 Client Street, Client City, State 67890',
      email: 'client@clientcompany.com',
      phone: '(555) 987-6543',
    },
    customerId: 'client-1',
    items: [
      { id: '1', description: 'Website Design', quantity: 1, unitPrice: 1500 },
      { id: '2', description: 'Development Hours', quantity: 10, unitPrice: 75 },
      { id: '3', description: 'Consultation', quantity: 5, unitPrice: 50 },
    ],
    notes: 'Thank you for your business! Payment is due within 30 days. Please include the invoice number with your payment.',
    paymentType: 'once-off',
    taxRate: settings.defaultTaxRate,
    discountType: 'percentage',
    discountValue: 10,
    subTotal: 2500,
    taxAmount: 0,
    discountAmount: 250,
    total: 2250,
    status: 'draft',
    paymentStatus: 'unpaid',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    bankingDetails: {
      bankName: 'Bank of America',
      accountName: 'Your Company Name',
      accountNumber: '1234567890',
      routingNumber: '021000021',
      reference: 'INV-2024-001',
    },
    includeBankingDetails: true,
    userId: 'preview-user',
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoSrc(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`min-h-screen ${themeClasses.background} ${themeClasses.text.primary} p-4 sm:p-6 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-2xl sm:text-3xl font-bold ${themeClasses.text.primary} mb-2`}>Template Gallery</h1>
          <p className={`${themeClasses.text.muted}`}>
            Preview all invoice templates with your company details
          </p>
        </div>

        {/* Controls */}
        <div className={`${themeClasses.card} rounded-xl p-4 sm:p-6 mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* View Mode Toggle */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">View Mode</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? themeClasses.button.primary
                      : themeClasses.button.secondary
                  }`}
                >
                  Grid View
                </button>
                <button
                  onClick={() => setViewMode('single')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'single'
                      ? themeClasses.button.primary
                      : themeClasses.button.secondary
                  }`}
                >
                  Single View
                </button>
              </div>
            </div>

            {/* Template Selector (Single View Only) */}
            {viewMode === 'single' && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-3">Select Template</h2>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value as TemplateId)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500"
                >
                  {TEMPLATES.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Logo Upload */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">Company Logo</h2>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <label className={`${themeClasses.button.secondary} px-4 py-2 rounded-lg cursor-pointer transition-colors text-sm`}>
                    Upload Logo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={() => setLogoSrc(null)}
                    className="text-slate-400 hover:text-white text-sm"
                  >
                    Remove
                  </button>
                </div>
                {logoSrc && (
                  <div className="mt-2">
                    <img 
                      src={logoSrc} 
                      alt="Preview" 
                      className="max-h-12 object-contain border border-slate-600 rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className={`${themeClasses.card} rounded-xl p-4 sm:p-6`}>
          <h2 className="text-lg font-semibold text-white mb-4">
            {viewMode === 'single' ? 'Template Preview' : 'All Templates'}
          </h2>
          
          {viewMode === 'single' ? (
            <div className="flex justify-center">
              <div className="w-full max-w-4xl">
                <InvoicePreview 
                  invoice={sampleInvoice} 
                  templateId={selectedTemplate} 
                  logoSrc={logoSrc || settings.logoUrl || null} 
                  currency={settings.currency}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {TEMPLATES.map((template) => (
                <div key={template.id} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
                  <h3 className="font-semibold text-white text-center mb-4">{template.name}</h3>
                  <div className="flex justify-center">
                    <div className="w-full max-w-2xl scale-75 origin-top">
                      <InvoicePreview 
                        invoice={sampleInvoice} 
                        templateId={template.id} 
                        logoSrc={logoSrc || settings.logoUrl || null} 
                        currency={settings.currency}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => {
                        setSelectedTemplate(template.id);
                        setViewMode('single');
                      }}
                      className={`${themeClasses.button.primary} px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
                    >
                      View Full Size
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};