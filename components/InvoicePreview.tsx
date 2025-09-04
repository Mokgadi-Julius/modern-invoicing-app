import React from 'react';
import { Invoice, TemplateId } from '../types';
import { defaultLogoPlaceholder } from '../constants';

interface InvoicePreviewProps {
  invoice: Invoice;
  templateId: TemplateId;
  logoSrc: string | null;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Helper to render address
const AddressBlock: React.FC<{ title: string; details: Invoice['from'] | Invoice['to']; className?: string }> = ({ title, details, className }) => (
  <div className={className}>
    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-1">{title}</h3>
    <p className="font-bold text-gray-800">{details.name || 'N/A'}</p>
    <p className="text-gray-600 text-sm">{details.address || 'N/A'}</p>
    <p className="text-gray-600 text-sm">{details.email || 'N/A'}</p>
    <p className="text-gray-600 text-sm">{details.phone || 'N/A'}</p>
  </div>
);


// Base styles common to all templates (applied to the wrapper)
const basePreviewClasses = "bg-white text-gray-800 shadow-lg rounded-lg p-8 md:p-12 print:shadow-none print:rounded-none print:p-0";

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, templateId, logoSrc }) => {
  const displayLogoSrc = logoSrc || defaultLogoPlaceholder;
  const paymentTypeDisplay = invoice.paymentType === 'once-off' ? 'Once-off' : 'Monthly';

  const renderHeader = () => {
    switch (templateId) {
      case 'modern':
        return (
          <div className="flex justify-between items-start pb-8 mb-8 border-b-2 border-sky-500">
            <div>
              {displayLogoSrc && <img src={displayLogoSrc} alt="Company Logo" className="h-16 max-w-xs object-contain mb-4" />}
              <h1 className="text-4xl font-bold text-sky-600">{invoice.from.name || 'Your Company'}</h1>
              <p className="text-gray-500">{invoice.from.address}</p>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-light uppercase text-gray-400">Invoice</h2>
              <p className="text-gray-600"># {invoice.invoiceNumber}</p>
              <p className="text-sm text-gray-500 mt-2">Date: <span className="text-gray-700 font-medium">{formatDate(invoice.date)}</span></p>
              <p className="text-sm text-gray-500">Due Date: <span className="text-gray-700 font-medium">{formatDate(invoice.dueDate)}</span></p>
              <p className="text-sm text-gray-500">Payment: <span className="text-gray-700 font-medium">{paymentTypeDisplay}</span></p>
            </div>
          </div>
        );
      case 'creative':
        return (
          <div className="mb-8 relative">
            <div className="bg-teal-600 text-white p-8 rounded-t-lg -mx-8 -mt-8 md:-mx-12 md:-mt-12 print:bg-teal-600 print:-mx-0 print:-mt-0">
              <div className="flex justify-between items-center">
                <h1 className="text-5xl font-extrabold">{invoice.invoiceNumber}</h1>
                {displayLogoSrc && <img src={displayLogoSrc} alt="Company Logo" className="h-20 object-contain rounded bg-white p-1" />}
              </div>
              <p className="text-xl mt-2">Invoice</p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="text-left">
                    <p className="text-sm text-gray-500">Date: <span className="text-gray-700 font-medium">{formatDate(invoice.date)}</span></p>
                    <p className="text-sm text-gray-500">Due Date: <span className="text-red-500 font-medium">{formatDate(invoice.dueDate)}</span></p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Payment Type</p>
                    <p className="text-gray-700 font-medium">{paymentTypeDisplay}</p>
                </div>
            </div>
          </div>
        );
      case 'classic':
      default:
        return (
          <div className="flex justify-between items-start pb-6 mb-6 border-b border-gray-300">
            {displayLogoSrc && <img src={displayLogoSrc} alt="Company Logo" className="h-20 max-w-xs object-contain" />}
            <div className="text-right">
              <h2 className="text-2xl font-semibold uppercase text-gray-700">Invoice</h2>
              <p># {invoice.invoiceNumber}</p>
            </div>
          </div>
        );
    }
  };

  const renderCompanyInfo = () => {
    const fromDetails = invoice.from;
    const toDetails = invoice.to;
    
    switch(templateId) {
        case 'creative':
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <AddressBlock title="From" details={fromDetails} className="p-4 bg-gray-50 rounded-lg"/>
                    <AddressBlock title="To" details={toDetails} className="p-4 bg-teal-50 rounded-lg border-l-4 border-teal-500"/>
                </div>
            );
        case 'modern':
             return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <AddressBlock title="Billed To" details={toDetails} />
                    <div className="text-right md:text-left">
                       <AddressBlock title="From" details={fromDetails} className="md:text-right"/>
                    </div>
                </div>
            );
        case 'classic':
        default:
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <AddressBlock title="From" details={fromDetails} />
                    <AddressBlock title="To" details={toDetails} />
                </div>
            );
    }
  };

  const renderItemsTable = () => {
    const headClasses = templateId === 'modern' ? "py-3 px-4 bg-sky-500 text-white font-semibold uppercase text-sm text-left" : 
                        templateId === 'creative' ? "py-3 px-5 bg-teal-500 text-white font-bold uppercase text-sm text-left" :
                        "py-2 px-3 bg-gray-100 text-gray-600 font-semibold uppercase text-sm text-left";
    const bodyCellClasses = templateId === 'modern' ? "py-3 px-4 border-b border-gray-200" :
                            templateId === 'creative' ? "py-3 px-5 border-b border-gray-200" :
                            "py-2 px-3 border-b border-gray-200";
    const tableClasses = templateId === 'creative' ? "w-full mb-8 shadow-lg rounded-lg overflow-hidden" : "w-full mb-8";


    return (
      <div className={tableClasses}>
        <table className="w-full">
          <thead>
            <tr>
              <th className={`${headClasses} ${templateId === 'creative' ? 'rounded-tl-lg' : ''}`}>Description</th>
              <th className={headClasses}>Quantity</th>
              <th className={headClasses}>Unit Price</th>
              <th className={`${headClasses} text-right ${templateId === 'creative' ? 'rounded-tr-lg' : ''}`}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map(item => (
              <tr key={item.id} className={templateId === 'modern' ? "hover:bg-sky-50 transition-colors" : templateId === 'creative' ? "hover:bg-teal-50 transition-colors" : "hover:bg-gray-50 transition-colors"}>
                <td className={bodyCellClasses}>{item.description}</td>
                <td className={bodyCellClasses}>{item.quantity}</td>
                <td className={bodyCellClasses}>{formatCurrency(item.unitPrice)}</td>
                <td className={`${bodyCellClasses} text-right`}>{formatCurrency(item.quantity * item.unitPrice)}</td>
              </tr>
            ))}
             {invoice.items.length === 0 && (
                <tr>
                    <td colSpan={4} className={`${bodyCellClasses} text-center text-gray-500`}>No items added yet.</td>
                </tr>
             )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSummary = () => {
    const summaryRowClass = "flex justify-between py-2";
    const summaryLabelClass = templateId === 'modern' ? "text-gray-500" : "text-gray-600";
    const summaryValueClass = templateId === 'modern' ? "font-semibold text-gray-700" : "font-medium text-gray-800";
    const totalClass = templateId === 'modern' ? "text-sky-600 text-2xl" : templateId === 'creative' ? "text-teal-600 text-2xl" : "text-gray-800 text-xl";

    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${templateId === 'creative' ? 'mt-12' : ''}`}>
        <div className={templateId === 'creative' ? 'text-sm text-gray-600 bg-gray-50 p-4 rounded-lg' : 'text-sm text-gray-600'}>
          <h4 className="font-semibold mb-2 text-gray-700">Notes & Terms:</h4>
          <p className="whitespace-pre-wrap">{invoice.notes || 'N/A'}</p>
        </div>
        <div className={templateId === 'creative' ? 'bg-teal-50 p-6 rounded-lg' : ''}>
          <div className={summaryRowClass}>
            <span className={summaryLabelClass}>Subtotal:</span>
            <span className={summaryValueClass}>{formatCurrency(invoice.subTotal)}</span>
          </div>
          {invoice.taxRate > 0 && (
            <div className={summaryRowClass}>
              <span className={summaryLabelClass}>Tax ({invoice.taxRate}%):</span>
              <span className={summaryValueClass}>{formatCurrency(invoice.taxAmount)}</span>
            </div>
          )}
          {invoice.discountValue > 0 && (
            <div className={summaryRowClass}>
              <span className={summaryLabelClass}>Discount ({invoice.discountType === 'percentage' ? `${invoice.discountValue}%` : formatCurrency(invoice.discountValue)}):</span>
              <span className={`${summaryValueClass} text-green-600`}>- {formatCurrency(invoice.discountAmount)}</span>
            </div>
          )}
          <div className={`${summaryRowClass} mt-2 pt-2 border-t ${templateId === 'creative' ? 'border-teal-300' : 'border-gray-300'}`}>
            <span className={`font-bold ${totalClass}`}>Total:</span>
            <span className={`font-bold ${totalClass}`}>{formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </div>
    );
  };
  
  const renderFooter = () => {
    if (templateId === 'modern') {
        return (
            <div className="mt-12 pt-8 border-t-2 border-sky-500 text-center text-gray-500 text-sm">
                <p>Thank you for your business!</p>
                <p>{invoice.from.name || 'Your Company'} | {invoice.from.email || ''} | {invoice.from.phone || ''}</p>
            </div>
        );
    }
    if (templateId === 'creative') {
        return (
            <div className="mt-12 pt-6 border-t-2 border-teal-200 text-center text-teal-700 text-xs">
                <p className="font-bold">Questions? Email us at {invoice.from.email || 'yourcompany@example.com'}</p>
                <p>Generated on {new Date().toLocaleDateString()}</p>
            </div>
        );
    }
    // Classic footer is implicit or part of notes.
    return null;
  };


  return (
    <div className={`${basePreviewClasses} font-sans`}>
      {renderHeader()}
      {templateId === 'classic' && (
         <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
            <div>
                <p><strong>Date:</strong> {formatDate(invoice.date)}</p>
                <p><strong>Payment:</strong> {paymentTypeDisplay}</p>
            </div>
            <div className="text-right">
                <p><strong>Due Date:</strong> {formatDate(invoice.dueDate)}</p>
            </div>
        </div>
      )}
      {renderCompanyInfo()}
      {renderItemsTable()}
      {renderSummary()}
      {renderFooter()}
    </div>
  );
};
