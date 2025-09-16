import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { AppSettings } from '../types';

const COLLECTION_NAME = 'settings';

export class SettingsService {
  // Get user settings
  static async getUserSettings(userId: string): Promise<AppSettings | null> {
    try {
      const settingsRef = doc(db, COLLECTION_NAME, userId);
      const settingsDoc = await getDoc(settingsRef);
      
      if (!settingsDoc.exists()) {
        // Return default settings if none exist
        return this.getDefaultSettings();
      }
      
      const settingsData = settingsDoc.data();
      return {
        ...settingsData,
        // Ensure all required fields exist with defaults
        ...this.getDefaultSettings(),
        ...settingsData,
      } as AppSettings;
    } catch (error) {
      console.error('Error getting user settings:', error);
      throw new Error('Failed to get user settings');
    }
  }

  // Update user settings
  static async updateUserSettings(userId: string, updates: Partial<AppSettings>): Promise<void> {
    try {
      const settingsRef = doc(db, COLLECTION_NAME, userId);
      
      await updateDoc(settingsRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      // If document doesn't exist, create it
      if (error instanceof Error && error.message.includes('No document to update')) {
        await this.createUserSettings(userId, updates);
      } else {
        console.error('Error updating user settings:', error);
        throw new Error('Failed to update user settings');
      }
    }
  }

  // Create initial user settings
  static async createUserSettings(userId: string, initialSettings: Partial<AppSettings> = {}): Promise<void> {
    try {
      const settingsRef = doc(db, COLLECTION_NAME, userId);
      const defaultSettings = this.getDefaultSettings();
      
      const settingsData = {
        ...defaultSettings,
        ...initialSettings,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(settingsRef, settingsData);
    } catch (error) {
      console.error('Error creating user settings:', error);
      throw new Error('Failed to create user settings');
    }
  }

  // Get default settings
  static getDefaultSettings(): AppSettings {
    return {
      companyDetails: {
        name: 'Your Company Name',
        address: '123 Main St, Anytown, USA',
        email: 'your@email.com',
        phone: '555-1234',
      },
      defaultTaxRate: 15,
      defaultPaymentTerms: 30,
      invoicePrefix: 'INV',
      nextInvoiceNumber: 1001,
      currency: 'ZAR',
      defaultTemplate: 'premium',
      theme: 'light',
      notifications: {
        emailReminders: true,
        overdueAlerts: true,
        paymentConfirmations: true,
      },
    };
  }

  // Real-time listener for user settings
  static subscribeToSettings(userId: string, callback: (settings: AppSettings) => void): Unsubscribe {
    const settingsRef = doc(db, COLLECTION_NAME, userId);

    return onSnapshot(settingsRef, (doc) => {
      if (doc.exists()) {
        const settingsData = doc.data();
        const settings = {
          ...this.getDefaultSettings(),
          ...settingsData,
        } as AppSettings;
        callback(settings);
      } else {
        // If settings don't exist, create default ones
        this.createUserSettings(userId);
        callback(this.getDefaultSettings());
      }
    }, (error) => {
      console.error('Error in settings subscription:', error);
    });
  }

  // Update company details
  static async updateCompanyDetails(userId: string, companyDetails: Partial<AppSettings['companyDetails']>): Promise<void> {
    try {
      const currentSettings = await this.getUserSettings(userId);
      if (!currentSettings) {
        throw new Error('Settings not found');
      }

      await this.updateUserSettings(userId, {
        companyDetails: {
          ...currentSettings.companyDetails,
          ...companyDetails,
        },
      });
    } catch (error) {
      console.error('Error updating company details:', error);
      throw new Error('Failed to update company details');
    }
  }

  // Update notification preferences
  static async updateNotificationSettings(userId: string, notifications: Partial<AppSettings['notifications']>): Promise<void> {
    try {
      const currentSettings = await this.getUserSettings(userId);
      if (!currentSettings) {
        throw new Error('Settings not found');
      }

      await this.updateUserSettings(userId, {
        notifications: {
          ...currentSettings.notifications,
          ...notifications,
        },
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw new Error('Failed to update notification settings');
    }
  }

  // Get and increment next invoice number
  static async getNextInvoiceNumber(userId: string): Promise<string> {
    try {
      const settings = await this.getUserSettings(userId);
      if (!settings) {
        throw new Error('Settings not found');
      }

      const nextNumber = settings.nextInvoiceNumber;
      const invoiceNumber = `${settings.invoicePrefix}-${nextNumber.toString().padStart(3, '0')}`;

      // Increment the next invoice number
      await this.updateUserSettings(userId, {
        nextInvoiceNumber: nextNumber + 1,
      });

      return invoiceNumber;
    } catch (error) {
      console.error('Error getting next invoice number:', error);
      // Fallback to timestamp-based number
      return `INV-${Date.now().toString().slice(-6)}`;
    }
  }

  // Reset invoice numbering
  static async resetInvoiceNumbering(userId: string, startNumber: number = 1): Promise<void> {
    try {
      await this.updateUserSettings(userId, {
        nextInvoiceNumber: startNumber,
      });
    } catch (error) {
      console.error('Error resetting invoice numbering:', error);
      throw new Error('Failed to reset invoice numbering');
    }
  }
}