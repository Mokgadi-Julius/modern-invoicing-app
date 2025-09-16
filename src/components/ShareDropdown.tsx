import React, { useState, useEffect } from 'react';
import {
  ShareIcon,
  EnvelopeIcon,
  LinkIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import type { Invoice } from '../types';

interface ShareModalProps {
  invoice: Invoice;
  formatCurrency: (amount: number) => string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ invoice, formatCurrency, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [whatsappGenerating, setWhatsappGenerating] = useState(false);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const invoiceUrl = `${window.location.origin}/invoices/${invoice.id}`;
  const shareTitle = `Invoice ${invoice.invoiceNumber}`;
  const shareText = `Invoice ${invoice.invoiceNumber} from ${invoice.from?.name || 'Your Business'} for ${invoice.to?.name || 'Unknown Client'} - ${formatCurrency(invoice.total || 0)}`;

  const handleWhatsAppShare = async () => {
    try {
      setWhatsappGenerating(true);

      // Use the existing download functionality by opening the invoice view with download=true
      const downloadUrl = `/invoices/${invoice.id}?download=true`;
      const popup = window.open(downloadUrl, '_blank', 'width=800,height=600');

      // Close the popup after PDF is generated
      if (popup) {
        setTimeout(() => {
          popup.close();
        }, 3000);
      }

      // Generate proper filename
      const sanitizedClientName = (invoice.to?.name || 'Client').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Invoice_${invoice.invoiceNumber || 'INV-001'}_${sanitizedClientName}.pdf`;

      // Message for WhatsApp
      const whatsappMessage = `${shareText}\n\n📄 Invoice PDF downloaded as "${filename}" - please attach this file to your message.`;
      const whatsappText = encodeURIComponent(whatsappMessage);

      // Small delay to let PDF download start
      setTimeout(() => {
        // Detect if we're on mobile or desktop
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile) {
          // On mobile, use whatsapp:// protocol to open the app with contact picker
          const whatsappAppUrl = `whatsapp://send?text=${whatsappText}`;
          window.location.href = whatsappAppUrl;
        } else {
          // On desktop, open WhatsApp Web which shows contact picker
          const whatsappWebUrl = `https://web.whatsapp.com/send?text=${whatsappText}`;
          window.open(whatsappWebUrl, '_blank', 'noopener,noreferrer');
        }
      }, 1500);

      onClose();
    } catch (error) {
      console.error('Error sharing via WhatsApp:', error);
      alert('Failed to prepare WhatsApp sharing. Please try again.');
    } finally {
      setWhatsappGenerating(false);
    }
  };

  const handleEmailShare = async () => {
    try {
      setEmailSending(true);

      // Use the existing download functionality
      const downloadUrl = `/invoices/${invoice.id}?download=true`;
      const popup = window.open(downloadUrl, '_blank', 'width=800,height=600');

      // Close the popup after PDF is generated
      if (popup) {
        setTimeout(() => {
          popup.close();
        }, 3000);
      }

      // Generate proper filename
      const sanitizedClientName = (invoice.to?.name || 'Client').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Invoice_${invoice.invoiceNumber || 'INV-001'}_${sanitizedClientName}.pdf`;

      // Open email client with pre-filled content
      const subject = encodeURIComponent(shareTitle);
      const body = encodeURIComponent(
        `Hi,\n\nPlease find your invoice attached as a PDF file: "${filename}"\n\n${shareText}\n\nThank you for your business!\n\nBest regards`
      );
      const emailUrl = `mailto:${invoice.to?.email || ''}?subject=${subject}&body=${body}`;

      // Small delay to let PDF download start
      setTimeout(() => {
        window.location.href = emailUrl;
      }, 1500);

      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to prepare email. Please try again.');
    } finally {
      setEmailSending(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(invoiceUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      alert('Failed to copy link to clipboard');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: invoiceUrl,
        });
        onClose();
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Share Invoice</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Info */}
        <div className="px-6 py-4 border-b border-slate-700">
          <div className="text-sm text-slate-300">
            <div className="font-medium text-white">{shareTitle}</div>
            <div className="text-slate-400 mt-1">
              {invoice.to?.name || 'Unknown Client'} • {formatCurrency(invoice.total || 0)}
            </div>
          </div>
        </div>

        {/* Share Options */}
        <div className="p-6 space-y-3">
          <button
            onClick={handleWhatsAppShare}
            disabled={whatsappGenerating}
            className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-colors group ${
              whatsappGenerating
                ? 'bg-slate-600 cursor-not-allowed'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              whatsappGenerating ? 'bg-slate-500' : 'bg-green-500'
            }`}>
              {whatsappGenerating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.703"/>
                </svg>
              )}
            </div>
            <div className="text-left">
              <div className="font-medium text-white">
                {whatsappGenerating ? 'Generating PDF...' : 'WhatsApp'}
              </div>
              <div className="text-sm text-slate-400">
                {whatsappGenerating ? 'Please wait...' : 'Download PDF & open WhatsApp'}
              </div>
            </div>
          </button>

          <button
            onClick={handleEmailShare}
            disabled={emailSending}
            className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-colors group ${
              emailSending
                ? 'bg-slate-600 cursor-not-allowed'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              emailSending ? 'bg-slate-500' : 'bg-blue-500'
            }`}>
              {emailSending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <EnvelopeIcon className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="text-left">
              <div className="font-medium text-white">
                {emailSending ? 'Preparing Email...' : 'Email'}
              </div>
              <div className="text-sm text-slate-400">
                {emailSending ? 'Please wait...' : 'Send PDF via email'}
              </div>
            </div>
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full flex items-center space-x-4 p-4 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors group"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              copied ? 'bg-green-500' : 'bg-slate-600'
            }`}>
              <LinkIcon className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium text-white">
                {copied ? 'Copied!' : 'Copy Link'}
              </div>
              <div className="text-sm text-slate-400">
                {copied ? 'Link copied to clipboard' : 'Copy invoice link'}
              </div>
            </div>
          </button>

          {navigator.share && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center space-x-4 p-4 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <ShareIcon className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium text-white">More Options</div>
                <div className="text-sm text-slate-400">Use system share</div>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface ShareButtonProps {
  invoice: Invoice;
  formatCurrency: (amount: number) => string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ invoice, formatCurrency }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-700 rounded-lg transition-colors"
        title="Share invoice"
      >
        <ShareIcon className="w-4 h-4" />
      </button>

      <ShareModal
        invoice={invoice}
        formatCurrency={formatCurrency}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};