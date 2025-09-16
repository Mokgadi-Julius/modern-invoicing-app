import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';
import { Invoice } from '../types';

interface EmailInvoiceRequest {
  invoiceId: string;
  recipientEmail?: string;
  message?: string;
}

interface EmailInvoiceResponse {
  success: boolean;
  message: string;
}

export class EmailService {
  // Send invoice via email with PDF attachment
  static async sendInvoiceByEmail(
    invoice: Invoice,
    recipientEmail?: string,
    customMessage?: string
  ): Promise<EmailInvoiceResponse> {
    try {
      const sendInvoiceEmail = httpsCallable<EmailInvoiceRequest, EmailInvoiceResponse>(
        functions,
        'sendInvoiceEmail'
      );

      const result = await sendInvoiceEmail({
        invoiceId: invoice.id,
        recipientEmail: recipientEmail || invoice.to?.email,
        message: customMessage,
      });

      return result.data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email. Please check your internet connection and try again.');
    }
  }

  // Generate shareable PDF URL (for WhatsApp and other sharing)
  static async generateShareablePDF(invoiceId: string): Promise<string> {
    try {
      const generatePDF = httpsCallable<{ invoiceId: string }, { pdfUrl: string }>(
        functions,
        'generateShareablePDF'
      );

      const result = await generatePDF({ invoiceId });
      return result.data.pdfUrl;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }
}