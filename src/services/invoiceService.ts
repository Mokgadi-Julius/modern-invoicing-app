import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Invoice, SavedInvoice } from '../types';
import { CustomerService } from './customerService';

const COLLECTION_NAME = 'invoices';

export class InvoiceService {
  // Save a new invoice
  static async saveInvoice(invoice: Omit<Invoice, 'id'>, userId: string): Promise<string> {
    try {
      const invoiceData = {
        ...invoice,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        status: invoice.status || 'draft',
        sentAt: invoice.status === 'sent' ? Timestamp.now() : null,
        paidAt: invoice.status === 'paid' ? Timestamp.now() : null,
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), invoiceData);
      
      // Update customer statistics if customer exists
      if (invoice.customerId) {
        try {
          await CustomerService.updateCustomerStats(invoice.customerId, userId, invoice.total, true);
        } catch (error) {
          console.error('Error updating customer stats:', error);
          // Don't fail the invoice creation if customer stats update fails
        }
      }
      
      return docRef.id;
    } catch (error) {
      console.error('Error saving invoice:', error);
      throw new Error('Failed to save invoice');
    }
  }

  // Update an existing invoice
  static async updateInvoice(invoiceId: string, updates: Partial<Invoice>, userId: string): Promise<void> {
    try {
      const invoiceRef = doc(db, COLLECTION_NAME, invoiceId);
      
      // Verify ownership
      const invoiceDoc = await getDoc(invoiceRef);
      if (!invoiceDoc.exists()) {
        throw new Error('Invoice not found');
      }
      
      const invoiceData = invoiceDoc.data();
      if (invoiceData.userId !== userId) {
        throw new Error('Unauthorized: You can only update your own invoices');
      }

      await updateDoc(invoiceRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw new Error('Failed to update invoice');
    }
  }

  // Get a specific invoice by ID
  static async getInvoice(invoiceId: string, userId: string): Promise<Invoice | null> {
    try {
      const invoiceRef = doc(db, COLLECTION_NAME, invoiceId);
      const invoiceDoc = await getDoc(invoiceRef);
      
      if (!invoiceDoc.exists()) {
        return null;
      }
      
      const invoiceData = invoiceDoc.data();
      
      // Verify ownership
      if (invoiceData.userId !== userId) {
        throw new Error('Unauthorized: You can only access your own invoices');
      }
      
      const result = {
        id: invoiceDoc.id,
        ...invoiceData,
        createdAt: invoiceData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: invoiceData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        paidAt: invoiceData.paidAt?.toDate?.()?.toISOString(),
        sentAt: invoiceData.sentAt?.toDate?.()?.toISOString(),
        // Ensure required fields have defaults
        from: invoiceData.from || { name: '', address: '', email: '', phone: '' },
        to: invoiceData.to || { name: 'Unknown Client', address: '', email: '', phone: '' },
        customerId: invoiceData.customerId || '',
        items: invoiceData.items || [],
        notes: invoiceData.notes || '',
        paymentType: invoiceData.paymentType || 'once-off',
        taxRate: invoiceData.taxRate || 0,
        discountType: invoiceData.discountType || 'fixed',
        discountValue: invoiceData.discountValue || 0,
        subTotal: invoiceData.subTotal || 0,
        taxAmount: invoiceData.taxAmount || 0,
        discountAmount: invoiceData.discountAmount || 0,
        total: invoiceData.total || 0,
        status: invoiceData.status || 'draft',
        paymentStatus: invoiceData.paymentStatus || 'unpaid',
        includeBankingDetails: invoiceData.includeBankingDetails || false,
        templateId: invoiceData.templateId || 'classic',
        userId: invoiceData.userId
      } as Invoice;
      
      return result;
    } catch (error) {
      console.error('Error getting invoice:', error);
      throw new Error('Failed to get invoice');
    }
  }

  // Get all invoices for a user
  static async getUserInvoices(userId: string): Promise<SavedInvoice[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const invoices: SavedInvoice[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        invoices.push({
          id: doc.id,
          invoiceNumber: data.invoiceNumber,
          date: data.date,
          dueDate: data.dueDate,
          from: data.from || { name: '', address: '', email: '', phone: '' },
          to: data.to || { name: 'Unknown Client', address: '', email: '', phone: '' },
          customerId: data.customerId || '',
          items: data.items || [],
          notes: data.notes || '',
          paymentType: data.paymentType || 'once-off',
          taxRate: data.taxRate || 0,
          discountType: data.discountType || 'fixed',
          discountValue: data.discountValue || 0,
          subTotal: data.subTotal || 0,
          taxAmount: data.taxAmount || 0,
          discountAmount: data.discountAmount || 0,
          total: data.total || 0,
          status: data.status || 'draft',
          paymentStatus: data.paymentStatus || 'unpaid',
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          paidAt: data.paidAt?.toDate?.()?.toISOString(),
          sentAt: data.sentAt?.toDate?.()?.toISOString(),
          bankingDetails: data.bankingDetails,
          includeBankingDetails: data.includeBankingDetails || false,
          templateId: data.templateId || 'classic',
          userId: data.userId
        } as SavedInvoice);
      });

      return invoices;
    } catch (error) {
      console.error('Error getting user invoices:', error);
      throw new Error('Failed to get invoices');
    }
  }

  // Delete an invoice
  static async deleteInvoice(invoiceId: string, userId: string): Promise<void> {
    try {
      const invoiceRef = doc(db, COLLECTION_NAME, invoiceId);
      
      // Verify ownership
      const invoiceDoc = await getDoc(invoiceRef);
      if (!invoiceDoc.exists()) {
        throw new Error('Invoice not found');
      }
      
      const invoiceData = invoiceDoc.data();
      if (invoiceData.userId !== userId) {
        throw new Error('Unauthorized: You can only delete your own invoices');
      }
      
      await deleteDoc(invoiceRef);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw new Error('Failed to delete invoice');
    }
  }

  // Get recent invoices (limited number) - delegating to getUserInvoices with limit
  static async getRecentInvoices(userId: string, limitCount: number = 5): Promise<SavedInvoice[]> {
    try {
      const allInvoices = await this.getUserInvoices(userId);
      return allInvoices.slice(0, limitCount);
    } catch (error) {
      console.error('Error getting recent invoices:', error);
      throw new Error('Failed to get recent invoices');
    }
  }

  // Generate next invoice number
  static async getNextInvoiceNumber(userId: string): Promise<string> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return 'INV-001';
      }
      
      const lastInvoice = querySnapshot.docs[0].data();
      const lastNumber = lastInvoice.invoiceNumber;
      
      // Extract number from format like "INV-001"
      const match = lastNumber.match(/INV-(\d+)/);
      if (match) {
        const nextNumber = parseInt(match[1]) + 1;
        return `INV-${nextNumber.toString().padStart(3, '0')}`;
      }
      
      return 'INV-001';
    } catch (error) {
      console.error('Error generating invoice number:', error);
      return `INV-${Date.now().toString().slice(-3)}`;
    }
  }

  // Update invoice status
  static async updateInvoiceStatus(invoiceId: string, status: Invoice['status'], userId: string): Promise<void> {
    try {
      const updates: Partial<Invoice> = { status };

      // Add timestamps for status changes
      if (status === 'sent') {
        updates.sentAt = new Date().toISOString();
      } else if (status === 'paid') {
        updates.paidAt = new Date().toISOString();
      }
      
      await InvoiceService.updateInvoice(invoiceId, updates, userId);
    } catch (error) {
      console.error('Error updating invoice status:', error);
      throw new Error('Failed to update invoice status');
    }
  }

  // Real-time listener for user invoices
  static subscribeToInvoices(userId: string, callback: (invoices: SavedInvoice[]) => void): Unsubscribe {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const invoices: SavedInvoice[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        invoices.push({
          id: doc.id,
          invoiceNumber: data.invoiceNumber,
          date: data.date,
          dueDate: data.dueDate,
          from: data.from || { name: '', address: '', email: '', phone: '' },
          to: data.to || { name: 'Unknown Client', address: '', email: '', phone: '' },
          customerId: data.customerId || '',
          items: data.items || [],
          notes: data.notes || '',
          paymentType: data.paymentType || 'once-off',
          taxRate: data.taxRate || 0,
          discountType: data.discountType || 'fixed',
          discountValue: data.discountValue || 0,
          subTotal: data.subTotal || 0,
          taxAmount: data.taxAmount || 0,
          discountAmount: data.discountAmount || 0,
          total: data.total || 0,
          status: data.status || 'draft',
          paymentStatus: data.paymentStatus || 'unpaid',
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          paidAt: data.paidAt?.toDate?.()?.toISOString(),
          sentAt: data.sentAt?.toDate?.()?.toISOString(),
          bankingDetails: data.bankingDetails,
          includeBankingDetails: data.includeBankingDetails || false,
          templateId: data.templateId || 'classic',
          userId: data.userId
        } as SavedInvoice);
      });
      callback(invoices);
    }, (error) => {
      console.error('Error in invoices subscription:', error);
    });
  }

  // Get invoices by status - filter from getUserInvoices
  static async getInvoicesByStatus(userId: string, status: Invoice['status']): Promise<SavedInvoice[]> {
    try {
      const allInvoices = await this.getUserInvoices(userId);
      return allInvoices.filter(invoice => invoice.status === status);
    } catch (error) {
      console.error('Error getting invoices by status:', error);
      throw new Error('Failed to get invoices by status');
    }
  }

  // Get overdue invoices - filter from getUserInvoices
  static async getOverdueInvoices(userId: string): Promise<SavedInvoice[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const allInvoices = await this.getUserInvoices(userId);

      // Filter overdue invoices and update their status
      const overdueInvoices = allInvoices.filter(invoice =>
        ['sent', 'overdue'].includes(invoice.status) &&
        invoice.dueDate < today
      );

      // Update status to overdue for these invoices
      const updatePromises = overdueInvoices.map(invoice =>
        this.updateInvoiceStatus(invoice.id, 'overdue', userId)
      );
      await Promise.allSettled(updatePromises);

      // Return with updated status
      return overdueInvoices.map(invoice => ({ ...invoice, status: 'overdue' as const }));
    } catch (error) {
      console.error('Error getting overdue invoices:', error);
      throw new Error('Failed to get overdue invoices');
    }
  }

  // Duplicate an invoice
  static async duplicateInvoice(invoiceId: string, userId: string): Promise<string> {
    try {
      const originalInvoice = await this.getInvoice(invoiceId, userId);
      if (!originalInvoice) {
        throw new Error('Invoice not found');
      }

      const duplicateData = {
        ...originalInvoice,
        invoiceNumber: await this.getNextInvoiceNumber(userId),
        status: 'draft' as const,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      };

      // Remove id and timestamps as these will be generated
      delete (duplicateData as any).id;
      delete (duplicateData as any).createdAt;
      delete (duplicateData as any).updatedAt;
      delete (duplicateData as any).sentAt;
      delete (duplicateData as any).paidAt;

      return await this.saveInvoice(duplicateData, userId);
    } catch (error) {
      console.error('Error duplicating invoice:', error);
      throw new Error('Failed to duplicate invoice');
    }
  }

  // Mark invoice as sent
  static async markAsSent(invoiceId: string, userId: string): Promise<void> {
    try {
      await this.updateInvoiceStatus(invoiceId, 'sent', userId);
    } catch (error) {
      console.error('Error marking invoice as sent:', error);
      throw new Error('Failed to mark invoice as sent');
    }
  }

  // Mark invoice as paid
  static async markAsPaid(invoiceId: string, userId: string): Promise<void> {
    try {
      await this.updateInvoiceStatus(invoiceId, 'paid', userId);
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      throw new Error('Failed to mark invoice as paid');
    }
  }
}