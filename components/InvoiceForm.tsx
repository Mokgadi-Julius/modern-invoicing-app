import React from 'react';
import { Invoice, CompanyDetails, LineItem, BankingDetails } from '../types';
import { LogoUpload } from './LogoUpload';
import { TrashIcon, PlusCircleIcon } from './Icons';

interface InvoiceFormProps {
  invoice: Invoice;
  updateInvoiceField: <K extends keyof Invoice>(field: K, value: Invoice[K]) => void;
  updateCompanyDetails: (party: 'from' | 'to', field: keyof CompanyDetails, value: string) => void;
  updateBankingDetails: (field: keyof BankingDetails, value: string) => void;
  addLineItem: () => void;
  updateLineItem: (id: string, field: keyof Omit<LineItem, 'id'>, value: string | number) => void;
  removeLineItem: (id: string) => void;
  onLogoChange: (file: File | null) => void;
  logoSrc: string | null;
}

const InputField: React.FC<{ label: string; type?: string; value: string | number; placeholder?: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; className?: string }> = 
  ({ label, type = "text", value, onChange, placeholder, className = "" }) => (
  <div className={`mb-2 sm:mb-3 lg:mb-4 ${className}`}>
    <label className="block text-xs sm:text-sm font-medium text-sky-300 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-2 sm:p-2.5 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out text-slate-100 placeholder-slate-400 text-sm sm:text-base touch-target"
    />
  </div>
);

const TextAreaField: React.FC<{ label: string; value: string; placeholder?: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; rows?: number }> = 
  ({ label, value, onChange, placeholder, rows = 3 }) => (
  <div className="mb-2 sm:mb-3 lg:mb-4">
    <label className="block text-xs sm:text-sm font-medium text-sky-300 mb-1">{label}</label>
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full p-2 sm:p-2.5 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out text-slate-100 placeholder-slate-400 text-sm sm:text-base min-h-[44px]"
    />
  </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-sky-400 border-b border-slate-600 pb-2 mb-2 sm:mb-3 lg:mb-4">{children}</h2>
);

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoice,
  updateInvoiceField,
  updateCompanyDetails,
  updateBankingDetails,
  addLineItem,
  updateLineItem,
  removeLineItem,
  onLogoChange,
  logoSrc
}) => {

  const handleCompanyDetailChange = (party: 'from' | 'to', field: keyof CompanyDetails, value: string) => {
    updateCompanyDetails(party, field, value);
  };
  
  const currencyFormatter = React.useMemo(() => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }), []);

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      <div>
        <SectionTitle>Company Logo</SectionTitle>
        <LogoUpload onLogoChange={onLogoChange} currentLogo={logoSrc} />
      </div>

      <div>
        <SectionTitle>From</SectionTitle>
        <InputField label="Company Name" value={invoice.from.name} onChange={e => handleCompanyDetailChange('from', 'name', e.target.value)} placeholder="Your Company LLC"/>
        <InputField label="Address" value={invoice.from.address} onChange={e => handleCompanyDetailChange('from', 'address', e.target.value)} placeholder="123 Main St, City, Country"/>
        <InputField label="Email" type="email" value={invoice.from.email} onChange={e => handleCompanyDetailChange('from', 'email', e.target.value)} placeholder="you@example.com"/>
        <InputField label="Phone" type="tel" value={invoice.from.phone} onChange={e => handleCompanyDetailChange('from', 'phone', e.target.value)} placeholder="(555) 123-4567"/>
      </div>

      <div>
        <SectionTitle>To</SectionTitle>
        <InputField label="Client Company Name" value={invoice.to.name} onChange={e => handleCompanyDetailChange('to', 'name', e.target.value)} placeholder="Client Inc."/>
        <InputField label="Client Address" value={invoice.to.address} onChange={e => handleCompanyDetailChange('to', 'address', e.target.value)} placeholder="456 Oak Ave, City, Country"/>
        <InputField label="Client Email" type="email" value={invoice.to.email} onChange={e => handleCompanyDetailChange('to', 'email', e.target.value)} placeholder="client@example.com"/>
        <InputField label="Client Phone" type="tel" value={invoice.to.phone} onChange={e => handleCompanyDetailChange('to', 'phone', e.target.value)} placeholder="(555) 987-6543"/>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
          <InputField label="VAT Number (Optional)" value={invoice.from.vatNumber || ''} onChange={e => handleCompanyDetailChange('from', 'vatNumber', e.target.value)} placeholder="4490279934"/>
          <InputField label="Client Reference (Optional)" value={invoice.to.clientReference || ''} onChange={e => handleCompanyDetailChange('to', 'clientReference', e.target.value)} placeholder="Phokela Holdings"/>
        </div>
        <InputField label="Contact Number (Optional)" value={invoice.to.contactNumber || ''} onChange={e => handleCompanyDetailChange('to', 'contactNumber', e.target.value)} placeholder="+27 83 594 0966"/>
      </div>
      
      <div>
        <SectionTitle>Invoice Details</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
            <InputField label="Invoice Number" value={invoice.invoiceNumber} onChange={e => updateInvoiceField('invoiceNumber', e.target.value)} placeholder="INV-001"/>
            <InputField label="Invoice Date" type="date" value={invoice.date} onChange={e => updateInvoiceField('date', e.target.value)} />
            <InputField label="Due Date" type="date" value={invoice.dueDate} onChange={e => updateInvoiceField('dueDate', e.target.value)} />
            <div className="mb-2 sm:mb-3 lg:mb-4">
               <label className="block text-xs sm:text-sm font-medium text-sky-300 mb-1">Payment Frequency</label>
               <select
                   value={invoice.paymentType}
                   onChange={e => updateInvoiceField('paymentType', e.target.value as 'once-off' | 'monthly')}
                   className="w-full p-2 sm:p-2.5 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out text-slate-100 text-sm sm:text-base touch-target"
               >
                   <option value="once-off">Once-off</option>
                   <option value="monthly">Monthly</option>
               </select>
            </div>
        </div>
      </div>

      <div>
        <SectionTitle>Items</SectionTitle>
        {invoice.items.map((item, index) => (
          <div key={item.id} className="p-2 sm:p-3 lg:p-4 mb-2 sm:mb-3 lg:mb-4 border border-slate-600 rounded-lg bg-slate-700/50 relative">
            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              <InputField 
                label={`Item ${index + 1} Description`} 
                value={item.description} 
                onChange={e => updateLineItem(item.id, 'description', e.target.value)} 
                placeholder="Service or Product"
              />
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <InputField 
                  label="Quantity" 
                  type="number" 
                  value={item.quantity.toString()} 
                  onChange={e => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                />
                <InputField 
                  label="Unit Price" 
                  type="number" 
                  value={item.unitPrice.toString()} 
                  onChange={e => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="flex justify-between items-center pt-1">
                <p className="text-xs sm:text-sm text-slate-300 font-medium">Total: {currencyFormatter.format(item.quantity * item.unitPrice)}</p>
                <button
                  onClick={() => removeLineItem(item.id)}
                  className="p-1.5 sm:p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full transition-colors touch-target"
                  aria-label="Remove item"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={addLineItem}
          className="mt-2 flex items-center justify-center w-full py-2 sm:py-2.5 px-3 sm:px-4 border-2 border-dashed border-sky-500 text-sky-400 hover:bg-sky-500 hover:text-slate-900 rounded-lg transition duration-150 ease-in-out font-medium text-sm sm:text-base touch-target"
        >
          <PlusCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Add Item
        </button>
      </div>

      <div>
        <SectionTitle>Summary & Notes</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
            <InputField 
              label="Tax Rate (%)" 
              type="number" 
              value={invoice.taxRate.toString()} 
              onChange={e => updateInvoiceField('taxRate', parseFloat(e.target.value) || 0)} 
              placeholder="e.g. 10 for 10%"
            />
             <div className="mb-2 sm:mb-3 lg:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-sky-300 mb-1">Discount Type</label>
                <select
                    value={invoice.discountType}
                    onChange={e => updateInvoiceField('discountType', e.target.value as 'percentage' | 'fixed')}
                    className="w-full p-2 sm:p-2.5 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out text-slate-100 text-sm sm:text-base touch-target"
                >
                    <option value="fixed">Fixed Amount (R)</option>
                    <option value="percentage">Percentage (%)</option>
                </select>
            </div>
        </div>
        <InputField 
            label={`Discount Value (${invoice.discountType === 'fixed' ? 'R' : '%'})`}
            type="number" 
            value={invoice.discountValue.toString()} 
            onChange={e => updateInvoiceField('discountValue', parseFloat(e.target.value) || 0)} 
            placeholder="e.g. 50 or 5"
        />
        <TextAreaField 
          label="Notes / Terms & Conditions" 
          value={invoice.notes} 
          onChange={e => updateInvoiceField('notes', e.target.value)} 
          placeholder="Payment terms, thank you note, etc."
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <SectionTitle>Banking Details</SectionTitle>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={invoice.includeBankingDetails}
              onChange={e => updateInvoiceField('includeBankingDetails', e.target.checked)}
              className="mr-2 h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-600 rounded bg-slate-700"
            />
            <span className="text-sm text-slate-300">Include on invoice</span>
          </label>
        </div>
        
        {invoice.includeBankingDetails && (
          <div className="space-y-2 sm:space-y-3 lg:space-y-4 p-2 sm:p-3 lg:p-4 bg-slate-700/30 rounded-lg border border-slate-600">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
              <InputField 
                label="Bank Name" 
                value={invoice.bankingDetails.bankName} 
                onChange={e => updateBankingDetails('bankName', e.target.value)} 
                placeholder="e.g. First National Bank"
              />
              <InputField 
                label="Account Name" 
                value={invoice.bankingDetails.accountName} 
                onChange={e => updateBankingDetails('accountName', e.target.value)} 
                placeholder="Your Company Name"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
              <InputField 
                label="Account Number" 
                value={invoice.bankingDetails.accountNumber} 
                onChange={e => updateBankingDetails('accountNumber', e.target.value)} 
                placeholder="123456789"
              />
              <InputField 
                label="Branch Code / Sort Code" 
                value={invoice.bankingDetails.routingNumber} 
                onChange={e => updateBankingDetails('routingNumber', e.target.value)} 
                placeholder="450105"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
              <InputField 
                label="SWIFT Code (Optional)" 
                value={invoice.bankingDetails.swift || ''} 
                onChange={e => updateBankingDetails('swift', e.target.value)} 
                placeholder="ABCDUS33XXX"
              />
              <InputField 
                label="Payment Reference (Optional)" 
                value={invoice.bankingDetails.reference || ''} 
                onChange={e => updateBankingDetails('reference', e.target.value)} 
                placeholder="Invoice reference"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
