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
  onSnapshot,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Customer } from '../types';

const COLLECTION_NAME = 'customers';

export class CustomerService {
  // Create a new customer
  static async createCustomer(customer: Omit<Customer, 'id' | 'createdAt'>, userId: string): Promise<string> {
    try {
      const customerData = {
        ...customer,
        userId,
        createdAt: Timestamp.now(),
        totalInvoices: 0,
        totalAmount: 0,
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), customerData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  // Update an existing customer
  static async updateCustomer(customerId: string, updates: Partial<Customer>, userId: string): Promise<void> {
    try {
      const customerRef = doc(db, COLLECTION_NAME, customerId);
      
      // Verify ownership
      const customerDoc = await getDoc(customerRef);
      if (!customerDoc.exists()) {
        throw new Error('Customer not found');
      }
      
      const customerData = customerDoc.data();
      if (customerData.userId !== userId) {
        throw new Error('Unauthorized: You can only update your own customers');
      }

      await updateDoc(customerRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating customer:', error);
      throw new Error('Failed to update customer');
    }
  }

  // Get a specific customer by ID
  static async getCustomer(customerId: string, userId: string): Promise<Customer | null> {
    try {
      const customerRef = doc(db, COLLECTION_NAME, customerId);
      const customerDoc = await getDoc(customerRef);
      
      if (!customerDoc.exists()) {
        return null;
      }
      
      const customerData = customerDoc.data();
      
      // Verify ownership
      if (customerData.userId !== userId) {
        throw new Error('Unauthorized: You can only access your own customers');
      }
      
      return {
        id: customerDoc.id,
        ...customerData,
        createdAt: customerData.createdAt?.toDate().toISOString() || new Date().toISOString()
      } as Customer;
    } catch (error) {
      console.error('Error getting customer:', error);
      throw new Error('Failed to get customer');
    }
  }

  // Get all customers for a user
  static async getUserCustomers(userId: string): Promise<Customer[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const customers: Customer[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        customers.push({
          id: doc.id,
          name: data.name,
          email: data.email,
          address: data.address,
          phone: data.phone,
          taxId: data.taxId,
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
          totalInvoices: data.totalInvoices || 0,
          totalAmount: data.totalAmount || 0,
        });
      });
      
      return customers;
    } catch (error) {
      console.error('Error getting user customers:', error);
      throw new Error('Failed to get customers');
    }
  }

  // Delete a customer
  static async deleteCustomer(customerId: string, userId: string): Promise<void> {
    try {
      const customerRef = doc(db, COLLECTION_NAME, customerId);
      
      // Verify ownership
      const customerDoc = await getDoc(customerRef);
      if (!customerDoc.exists()) {
        throw new Error('Customer not found');
      }
      
      const customerData = customerDoc.data();
      if (customerData.userId !== userId) {
        throw new Error('Unauthorized: You can only delete your own customers');
      }
      
      await deleteDoc(customerRef);
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw new Error('Failed to delete customer');
    }
  }

  // Real-time listener for user customers
  static subscribeToCustomers(userId: string, callback: (customers: Customer[]) => void): Unsubscribe {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const customers: Customer[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        customers.push({
          id: doc.id,
          name: data.name,
          email: data.email,
          address: data.address,
          phone: data.phone,
          taxId: data.taxId,
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
          totalInvoices: data.totalInvoices || 0,
          totalAmount: data.totalAmount || 0,
        });
      });
      callback(customers);
    }, (error) => {
      console.error('Error in customers subscription:', error);
    });
  }

  // Update customer invoice statistics
  static async updateCustomerStats(customerId: string, userId: string, invoiceAmount: number, increment: boolean = true): Promise<void> {
    try {
      const customerRef = doc(db, COLLECTION_NAME, customerId);
      
      // Verify ownership
      const customerDoc = await getDoc(customerRef);
      if (!customerDoc.exists()) {
        throw new Error('Customer not found');
      }
      
      const customerData = customerDoc.data();
      if (customerData.userId !== userId) {
        throw new Error('Unauthorized: You can only update your own customers');
      }

      const totalInvoicesChange = increment ? 1 : -1;
      const totalAmountChange = increment ? invoiceAmount : -invoiceAmount;

      await updateDoc(customerRef, {
        totalInvoices: (customerData.totalInvoices || 0) + totalInvoicesChange,
        totalAmount: (customerData.totalAmount || 0) + totalAmountChange,
      });
    } catch (error) {
      console.error('Error updating customer stats:', error);
      throw new Error('Failed to update customer statistics');
    }
  }
}