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
  <div className={`p-5 sm:p-6 bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    <div className="flex items-center gap-3 mb-4">
      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800">{title}</h3>
    </div>
    <div className="space-y-2">
      <p className="font-bold text-gray-900 text-lg">{details.name || 'N/A'}</p>
      <p className="text-gray-600 text-sm leading-relaxed">{details.address || 'N/A'}</p>
      <p className="text-gray-600 text-sm break-all sm:break-normal font-medium">{details.email || 'N/A'}</p>
      <p className="text-gray-600 text-sm font-medium">{details.phone || 'N/A'}</p>
    </div>
  </div>
);


// Base styles common to all templates (applied to the wrapper)
const basePreviewClasses = "bg-white text-gray-800 shadow-elegant rounded-lg sm:rounded-xl lg:rounded-2xl p-2 sm:p-4 lg:p-6 xl:p-8 print:shadow-none print:rounded-none print:p-0 animate-fade-in overflow-hidden w-full max-w-full";

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, templateId, logoSrc }) => {
  const displayLogoSrc = logoSrc || defaultLogoPlaceholder;
  const paymentTypeDisplay = invoice.paymentType === 'once-off' ? 'Once-off' : 'Monthly';

  const renderHeader = () => {
    switch (templateId) {
      case 'writenow':
        return (
          <div className="mb-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-xl mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{invoice.from.name || 'Your Company'}</h1>
                  <p className="text-emerald-100">Professional Services</p>
                </div>
                <div className="text-right">
                  <div className="bg-white/20 rounded-lg p-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-100 mb-1">Invoice</h2>
                    <p className="text-xl font-bold">#{invoice.invoiceNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mb-2"></div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">Issue Date</p>
                <p className="text-gray-900 font-bold text-sm">{formatDate(invoice.date)}</p>
              </div>
              <div className="bg-teal-50 p-3 rounded-lg border border-teal-200">
                <div className="w-2 h-2 bg-teal-500 rounded-full mb-2"></div>
                <p className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-1">Due Date</p>
                <p className="text-gray-900 font-bold text-sm">{formatDate(invoice.dueDate)}</p>
              </div>
              <div className="bg-cyan-50 p-3 rounded-lg border border-cyan-200">
                <div className="w-2 h-2 bg-cyan-500 rounded-full mb-2"></div>
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-700 mb-1">Payment</p>
                <p className="text-gray-900 font-bold text-sm">{paymentTypeDisplay}</p>
              </div>
            </div>

            {/* Logo Section */}
            {displayLogoSrc && (
              <div className="text-center mb-4">
                <img src={displayLogoSrc} alt="Company Logo" className="h-20 object-contain mx-auto" />
              </div>
            )}
          </div>
        );
      case 'modern':
        return (
          <div className="relative mb-8">
            {/* Modern floating elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-3xl opacity-60 blur-2xl"></div>
            <div className="absolute top-4 -left-4 w-20 h-20 bg-gradient-to-br from-cyan-100 to-blue-200 rounded-2xl opacity-40 blur-xl"></div>

            <div className="relative bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
              {/* Modern gradient header */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-600 p-8 text-white">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-6">
                    {displayLogoSrc && (
                      <div className="bg-white/25 backdrop-blur-md p-4 rounded-2xl border border-white/40 shadow-xl">
                        <img src={displayLogoSrc} alt="Company Logo" className="h-16 object-contain" />
                      </div>
                    )}
                    <div>
                      <h1 className="text-3xl font-black tracking-tight">
                        {invoice.from.name || 'Your Company'}
                      </h1>
                      <p className="text-slate-200 font-medium mt-1">Digital Solutions</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30 shadow-lg">
                      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-200 mb-2">Invoice</h2>
                      <p className="text-2xl font-black text-white">#{invoice.invoiceNumber}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modern glass cards */}
              <div className="p-8">
                <div className="grid grid-cols-3 gap-4 -mt-12 relative z-10">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-lg">
                    <div className="w-3 h-3 bg-slate-600 rounded-full mb-2"></div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Issue Date</p>
                    <p className="text-slate-900 font-bold">{formatDate(invoice.date)}</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-lg">
                    <div className="w-3 h-3 bg-slate-700 rounded-full mb-2"></div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Due Date</p>
                    <p className="text-slate-900 font-bold">{formatDate(invoice.dueDate)}</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-lg">
                    <div className="w-3 h-3 bg-slate-800 rounded-full mb-2"></div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Payment</p>
                    <p className="text-slate-900 font-bold">{paymentTypeDisplay}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'creative':
        return (
          <div className="relative mb-8 overflow-hidden">
            {/* Creative abstract shapes */}
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-purple-200 rounded-[3rem] opacity-30 blur-xl rotate-12"></div>
            <div className="absolute top-12 -left-6 w-24 h-24 bg-pink-200 rounded-2xl opacity-40 blur-lg -rotate-12"></div>
            <div className="absolute bottom-4 right-12 w-16 h-16 bg-blue-200 rounded-full opacity-25 blur-md"></div>

            <div className="relative bg-white rounded-[2rem] shadow-2xl border border-gray-200 overflow-hidden">
              {/* Creative header with artistic elements */}
              <div className="relative">
                <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-8">
                  {/* Decorative dots pattern */}
                  <div className="absolute top-0 left-0 w-full h-full opacity-20">
                    <div className="grid grid-cols-12 gap-2 h-full">
                      {Array.from({ length: 48 }, (_, i) => (
                        <div key={i} className="w-1 h-1 bg-white rounded-full"></div>
                      ))}
                    </div>
                  </div>

                  <div className="relative flex justify-between items-start">
                    <div className="flex items-center gap-6">
                      {displayLogoSrc && (
                        <div className="bg-white/25 backdrop-blur-md p-4 rounded-3xl border border-white/50 shadow-xl">
                          <img src={displayLogoSrc} alt="Company Logo" className="h-16 object-contain" />
                        </div>
                      )}
                      <div>
                        <div className="bg-white/25 backdrop-blur-sm rounded-2xl px-4 py-2 inline-block mb-3">
                          <span className="text-white text-xs font-bold uppercase tracking-widest">Creative Studio</span>
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">
                          {invoice.from.name || 'Your Company'}
                        </h1>
                        <p className="text-violet-100 font-medium mt-1">Innovative Design</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="bg-white px-6 py-4 rounded-3xl shadow-2xl">
                        <h2 className="text-xs font-black uppercase tracking-widest text-violet-600 mb-2">Invoice</h2>
                        <p className="text-2xl font-black text-gray-900">
                          #{invoice.invoiceNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Creative floating cards */}
                <div className="px-8 -mt-8 relative z-10">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl shadow-xl border border-violet-200 transform rotate-1 hover:rotate-0 transition-transform">
                      <div className="w-3 h-3 bg-violet-500 rounded-full mb-3"></div>
                      <p className="text-xs font-bold uppercase tracking-wider text-violet-600 mb-1">Issue Date</p>
                      <p className="text-gray-900 font-black">{formatDate(invoice.date)}</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-xl border border-purple-200 transform -rotate-1 hover:rotate-0 transition-transform">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mb-3"></div>
                      <p className="text-xs font-bold uppercase tracking-wider text-purple-600 mb-1">Due Date</p>
                      <p className="text-gray-900 font-black">{formatDate(invoice.dueDate)}</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-xl border border-pink-200 transform rotate-1 hover:rotate-0 transition-transform">
                      <div className="w-3 h-3 bg-pink-500 rounded-full mb-3"></div>
                      <p className="text-xs font-bold uppercase tracking-wider text-pink-600 mb-1">Payment</p>
                      <p className="text-gray-900 font-black">{paymentTypeDisplay}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4"></div>
              </div>
            </div>
          </div>
        );
      case 'classic':
      default:
        return (
          <div className="relative mb-8">
            {/* Geometric background elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-100 rounded-full opacity-40"></div>
            <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-gray-100 rounded-xl opacity-30"></div>

            <div className="relative bg-white border border-blue-200 rounded-2xl shadow-xl overflow-hidden">
              {/* Top accent line */}
              <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-6">
                    {displayLogoSrc && (
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-sm">
                        <img src={displayLogoSrc} alt="Company Logo" className="h-16 object-contain" />
                      </div>
                    )}
                    <div>
                      <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        {invoice.from.name || 'Your Company'}
                      </h1>
                      <p className="text-blue-600 font-medium mt-1">Professional Services</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg">
                      <h2 className="text-xs font-semibold uppercase tracking-widest text-blue-100 mb-1">Invoice</h2>
                      <p className="text-2xl font-black text-white">#{invoice.invoiceNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Modern info cards */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-500">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">Issue Date</p>
                    <p className="text-gray-900 font-bold">{formatDate(invoice.date)}</p>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-xl border-l-4 border-indigo-500">
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">Due Date</p>
                    <p className="text-gray-900 font-bold">{formatDate(invoice.dueDate)}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl border-l-4 border-purple-500">
                    <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 mb-1">Payment</p>
                    <p className="text-gray-900 font-bold">{paymentTypeDisplay}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const renderCompanyInfo = () => {
    const fromDetails = invoice.from;
    const toDetails = invoice.to;
    
    switch(templateId) {
        case 'writenow':
            return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                            <h3 className="font-bold text-emerald-800 uppercase tracking-wider text-xs">From</h3>
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-gray-900 text-sm">{fromDetails.name || 'N/A'}</p>
                            <p className="text-gray-600 text-xs">{fromDetails.address || 'N/A'}</p>
                            <p className="text-gray-600 text-xs">{fromDetails.email || 'N/A'}</p>
                            <p className="text-gray-600 text-xs">{fromDetails.phone || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                            <h3 className="font-bold text-teal-800 uppercase tracking-wider text-xs">To</h3>
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-gray-900 text-sm">{toDetails.name || 'N/A'}</p>
                            <p className="text-gray-600 text-xs">{toDetails.address || 'N/A'}</p>
                            <p className="text-gray-600 text-xs">{toDetails.email || 'N/A'}</p>
                            <p className="text-gray-600 text-xs">{toDetails.phone || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            );
        case 'creative':
            return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <div className="relative bg-gradient-to-br from-rose-50 via-pink-50 to-violet-50 p-6 rounded-[2rem] border border-rose-200/60 shadow-2xl transform hover:rotate-1 transition-all duration-300">
                        {/* Creative corner decoration */}
                        <div className="absolute top-2 right-2 w-4 h-4 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full opacity-70"></div>
                        <div className="absolute bottom-2 left-2 w-3 h-3 bg-gradient-to-br from-pink-400 to-violet-500 rounded-full opacity-60"></div>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-4 h-4 bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl shadow-lg"></div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-rose-700">From</h3>
                        </div>
                        <div className="space-y-2">
                            <p className="font-black text-slate-900 text-lg">{fromDetails.name || 'N/A'}</p>
                            <p className="text-slate-600 text-sm leading-relaxed">{fromDetails.address || 'N/A'}</p>
                            <p className="text-slate-600 text-sm font-medium">{fromDetails.email || 'N/A'}</p>
                            <p className="text-slate-600 text-sm font-medium">{fromDetails.phone || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="relative bg-gradient-to-br from-violet-50 via-purple-50 to-rose-50 p-6 rounded-[2rem] border border-violet-200/60 shadow-2xl transform hover:-rotate-1 transition-all duration-300">
                        {/* Creative corner decoration */}
                        <div className="absolute top-2 left-2 w-4 h-4 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full opacity-70"></div>
                        <div className="absolute bottom-2 right-2 w-3 h-3 bg-gradient-to-br from-purple-400 to-rose-500 rounded-full opacity-60"></div>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-4 h-4 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl shadow-lg"></div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-violet-700">To</h3>
                        </div>
                        <div className="space-y-2">
                            <p className="font-black text-slate-900 text-lg">{toDetails.name || 'N/A'}</p>
                            <p className="text-slate-600 text-sm leading-relaxed">{toDetails.address || 'N/A'}</p>
                            <p className="text-slate-600 text-sm font-medium">{toDetails.email || 'N/A'}</p>
                            <p className="text-slate-600 text-sm font-medium">{toDetails.phone || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            );
        case 'modern':
             return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 p-6 rounded-3xl border border-slate-300/60 shadow-xl backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-3 h-3 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full shadow-lg"></div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">From</h3>
                        </div>
                        <div className="space-y-2">
                            <p className="font-black text-slate-900 text-lg">{fromDetails.name || 'N/A'}</p>
                            <p className="text-slate-600 text-sm leading-relaxed">{fromDetails.address || 'N/A'}</p>
                            <p className="text-slate-600 text-sm font-medium">{fromDetails.email || 'N/A'}</p>
                            <p className="text-slate-600 text-sm font-medium">{fromDetails.phone || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-3xl border border-blue-300/60 shadow-xl backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg"></div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-700">Billed To</h3>
                        </div>
                        <div className="space-y-2">
                            <p className="font-black text-slate-900 text-lg">{toDetails.name || 'N/A'}</p>
                            <p className="text-slate-600 text-sm leading-relaxed">{toDetails.address || 'N/A'}</p>
                            <p className="text-slate-600 text-sm font-medium">{toDetails.email || 'N/A'}</p>
                            <p className="text-slate-600 text-sm font-medium">{toDetails.phone || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            );
        case 'classic':
        default:
            return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-700">From</h3>
                        </div>
                        <div className="space-y-2">
                            <p className="font-bold text-slate-900 text-lg">{fromDetails.name || 'N/A'}</p>
                            <p className="text-slate-600 text-sm leading-relaxed">{fromDetails.address || 'N/A'}</p>
                            <p className="text-slate-600 text-sm font-medium">{fromDetails.email || 'N/A'}</p>
                            <p className="text-slate-600 text-sm font-medium">{fromDetails.phone || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="bg-blue-50 border border-indigo-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-3 h-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-700">To</h3>
                        </div>
                        <div className="space-y-2">
                            <p className="font-bold text-slate-900 text-lg">{toDetails.name || 'N/A'}</p>
                            <p className="text-slate-600 text-sm leading-relaxed">{toDetails.address || 'N/A'}</p>
                            <p className="text-slate-600 text-sm font-medium">{toDetails.email || 'N/A'}</p>
                            <p className="text-slate-600 text-sm font-medium">{toDetails.phone || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            );
    }
  };

  const renderItemsTable = () => {
    const headClasses = templateId === 'modern' ? "py-4 px-6 bg-gradient-to-r from-slate-700 to-slate-600 text-white font-bold uppercase text-sm tracking-wider text-left" :
                        templateId === 'creative' ? "py-4 px-6 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold uppercase text-sm tracking-wider text-left" :
                        templateId === 'writenow' ? "py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold uppercase text-sm tracking-wide text-left" :
                        "py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold uppercase text-sm tracking-wider text-left";
    const bodyCellClasses = templateId === 'modern' ? "py-4 px-6 border-b border-gray-200 text-sm text-gray-700 font-medium" :
                            templateId === 'creative' ? "py-4 px-6 border-b border-gray-200 text-sm text-gray-700 font-medium" :
                            templateId === 'writenow' ? "py-4 px-6 border-b border-gray-200 text-sm text-gray-700 font-medium" :
                            "py-4 px-6 border-b border-gray-200 text-sm text-gray-700 font-medium";
    const tableClasses = templateId === 'creative' ? "w-full mb-8 bg-white shadow-lg rounded-xl overflow-hidden border border-violet-200" :
                         templateId === 'modern' ? "w-full mb-8 bg-white shadow-lg rounded-xl overflow-hidden border border-slate-200" :
                         templateId === 'writenow' ? "w-full mb-8 bg-white shadow-lg rounded-xl overflow-hidden border border-emerald-200" :
                         "w-full mb-8 bg-white shadow-lg rounded-xl overflow-hidden border border-blue-200";


    return (
      <div className={`${tableClasses} animate-slide-up`}>
        <div className="overflow-x-auto -mx-2 sm:mx-0 w-full">
        <table className="w-full min-w-[280px] sm:min-w-[400px] lg:min-w-full">
          <thead>
            <tr>
              <th className={`${headClasses} ${templateId === 'creative' ? 'rounded-tl-lg' : ''} min-w-[100px] sm:min-w-[120px]`}>
                {templateId === 'writenow' ? 'DESCRIPTION' : 'Description'}
              </th>
              <th className={`${headClasses} min-w-[40px] sm:min-w-[60px]`}>
                {templateId === 'writenow' ? 'QUANTITY' : 'Qty'}
              </th>
              <th className={`${headClasses} min-w-[60px] sm:min-w-[80px]`}>
                {templateId === 'writenow' ? 'UNIT PRICE' : 'Price'}
              </th>
              <th className={`${headClasses} text-right ${templateId === 'creative' ? 'rounded-tr-lg' : ''} min-w-[60px] sm:min-w-[80px]`}>
                {templateId === 'writenow' ? 'TOTAL' : 'Total'}
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
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
      </div>
    );
  };

  const renderSummary = () => {
    if (templateId === 'writenow') {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="space-y-6">
            <div className={templateId === 'creative' ? 'bg-gradient-to-r from-violet-50 to-purple-50 p-6 rounded-xl border border-violet-200' : templateId === 'modern' ? 'bg-gradient-to-r from-slate-50 to-gray-50 p-6 rounded-xl border border-slate-200' : templateId === 'writenow' ? 'bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-200' : 'bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200'}>
              <h4 className={`font-bold mb-3 text-lg ${templateId === 'creative' ? 'text-violet-800' : templateId === 'modern' ? 'text-slate-800' : templateId === 'writenow' ? 'text-emerald-800' : 'text-blue-800'}`}>Notes & Terms:</h4>
              <p className="text-gray-700 leading-relaxed">{invoice.notes || 'Transforming Ideas into Reality, One Pixel at a Time :)'}</p>
            </div>

            {invoice.includeBankingDetails && (
              <div className={templateId === 'creative' ? 'bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200' : templateId === 'modern' ? 'bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200' : templateId === 'writenow' ? 'bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-xl border border-teal-200' : 'bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200'}>
                <h4 className={`font-bold mb-3 text-lg ${templateId === 'creative' ? 'text-purple-800' : templateId === 'modern' ? 'text-slate-800' : templateId === 'writenow' ? 'text-teal-800' : 'text-indigo-800'}`}>Payment Details</h4>
                <div className="space-y-2">
                  {invoice.bankingDetails.bankName && (
                    <p className="text-gray-700"><span className="font-medium text-gray-800">Bank:</span> {invoice.bankingDetails.bankName}</p>
                  )}
                  {invoice.bankingDetails.accountNumber && (
                    <p className="text-gray-700"><span className="font-medium text-gray-800">Account Number:</span> {invoice.bankingDetails.accountNumber}</p>
                  )}
                  {invoice.bankingDetails.routingNumber && (
                    <p className="text-gray-700"><span className="font-medium text-gray-800">Branch Code:</span> {invoice.bankingDetails.routingNumber}</p>
                  )}
                </div>
                <div className="mt-4 p-3 bg-white rounded-lg border border-gray-300">
                  <p className="text-gray-800 font-medium">Please use your invoice number as reference:</p>
                  <p className="font-bold text-gray-900 text-lg">{invoice.invoiceNumber}</p>
                </div>
              </div>
            )}
          </div>

          <div className={templateId === 'creative' ? 'bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 p-6 rounded-xl border border-violet-200 shadow-lg' : templateId === 'modern' ? 'bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 p-6 rounded-xl border border-slate-200 shadow-lg' : templateId === 'writenow' ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 rounded-xl border border-emerald-200 shadow-lg' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-xl border border-blue-200 shadow-lg'}>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span className="font-medium">Subtotal:</span>
                <span className="font-bold">{formatCurrency(invoice.subTotal)}</span>
              </div>
              {invoice.taxRate > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">Tax ({invoice.taxRate}%):</span>
                  <span className="font-bold">{formatCurrency(invoice.taxAmount)}</span>
                </div>
              )}
              {invoice.discountValue > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">Discount:</span>
                  <span className="font-bold text-green-600">- {formatCurrency(invoice.discountAmount)}</span>
                </div>
              )}
              <div className={`flex justify-between font-bold text-xl bg-white p-4 rounded-lg mt-4 ${templateId === 'creative' ? 'border border-violet-300' : templateId === 'modern' ? 'border border-slate-300' : templateId === 'writenow' ? 'border border-emerald-300' : 'border border-blue-300'}`}>
                <span className="text-gray-800">Total:</span>
                <span className="text-gray-900">{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const summaryRowClass = "flex justify-between py-3";
    const summaryLabelClass = templateId === 'modern' ? "text-slate-600 font-medium" : templateId === 'creative' ? "text-slate-600 font-medium" : "text-slate-600 font-medium";
    const summaryValueClass = templateId === 'modern' ? "font-bold text-slate-800 text-lg" : templateId === 'creative' ? "font-bold text-slate-800 text-lg" : "font-bold text-slate-800 text-lg";
    const totalClass = "text-gray-900 text-2xl font-bold tracking-wide";

    return (
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 xl:gap-8 ${templateId === 'creative' ? 'mt-4 sm:mt-6 lg:mt-8' : ''} animate-scale-in w-full max-w-full overflow-hidden`}>
        <div className="space-y-4">
          <div className={
            'text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200'
          }>
            <h4 className="font-bold mb-2 text-slate-800">Notes & Terms:</h4>
            <p className="whitespace-pre-wrap">{invoice.notes || 'N/A'}</p>
          </div>

          {invoice.includeBankingDetails && (
            <div className={
              'text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200'
            }>
              <h4 className="font-bold mb-2 text-slate-800">Payment Details:</h4>
              <div className="space-y-1">
                {invoice.bankingDetails.bankName && (
                  <p><span className="font-medium">Bank:</span> {invoice.bankingDetails.bankName}</p>
                )}
                {invoice.bankingDetails.accountName && (
                  <p><span className="font-medium">Account Name:</span> {invoice.bankingDetails.accountName}</p>
                )}
                {invoice.bankingDetails.accountNumber && (
                  <p><span className="font-medium">Account Number:</span> {invoice.bankingDetails.accountNumber}</p>
                )}
                {invoice.bankingDetails.routingNumber && (
                  <p><span className="font-medium">Sort Code:</span> {invoice.bankingDetails.routingNumber}</p>
                )}
                {invoice.bankingDetails.swift && (
                  <p><span className="font-medium">SWIFT:</span> {invoice.bankingDetails.swift}</p>
                )}
                {invoice.bankingDetails.reference && (
                  <p><span className="font-medium">Reference:</span> {invoice.bankingDetails.reference}</p>
                )}
              </div>
            </div>
          )}
        </div>
        <div className={
          'bg-gray-50 p-6 rounded-lg border border-gray-200'
        }>
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
          <div className={`${summaryRowClass} mt-4 pt-4 border-t-2 border-gray-300 bg-white p-3 rounded-lg`}>
            <span className={`font-bold ${totalClass}`}>Total:</span>
            <span className={`font-bold ${totalClass}`}>{formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderFooter = () => {
    if (templateId === 'writenow') {
        return null;
    }
    if (templateId === 'modern') {
        return (
            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t-2 border-sky-500 text-center text-gray-500 text-xs sm:text-sm">
                <p className="font-medium">Thank you for your business!</p>
                <p className="mt-1">{invoice.from.name || 'Your Company'} | {invoice.from.email || ''} | {invoice.from.phone || ''}</p>
                {invoice.includeBankingDetails && (
                  <p className="mt-2 text-xs text-gray-400">Please use the above banking details for payment</p>
                )}
            </div>
        );
    }
    if (templateId === 'creative') {
        return (
            <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t-2 border-teal-200 text-center text-teal-700 text-xs">
                <p className="font-bold">Questions? Email us at {invoice.from.email || 'yourcompany@example.com'}</p>
                <p>Generated on {new Date().toLocaleDateString()}</p>
                {invoice.includeBankingDetails && (
                  <p className="mt-2 text-teal-600">Banking details provided above for your convenience</p>
                )}
            </div>
        );
    }
    // Classic footer with modern styling
    if (templateId === 'classic') {
        return (
            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t-2 border-gradient-to-r from-indigo-400 to-purple-400 text-center text-gray-600 text-xs sm:text-sm bg-white/50 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                    <p className="font-semibold text-gray-800">Thank you for your business!</p>
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
                </div>
                <p className="text-gray-600">{invoice.from.name || 'Your Company'} | {invoice.from.email || ''} | {invoice.from.phone || ''}</p>
                {invoice.includeBankingDetails && (
                  <p className="mt-2 text-xs text-indigo-600 font-medium">Please reference your invoice number when making payment: <span className="font-bold">{invoice.invoiceNumber}</span></p>
                )}
            </div>
        );
    }
    return null;
  };


  return (
    <div className={`${basePreviewClasses} font-sans animate-fade-in`}>
      {renderHeader()}
      {templateId === 'classic' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 text-xs sm:text-sm">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-gray-700"><span className="font-semibold text-blue-700">Date:</span> {formatDate(invoice.date)}</p>
                <p className="text-gray-700"><span className="font-semibold text-blue-700">Payment:</span> {paymentTypeDisplay}</p>
            </div>
            <div className="text-left sm:text-right bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                <p className="text-gray-700"><span className="font-semibold text-indigo-700">Due Date:</span> {formatDate(invoice.dueDate)}</p>
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
