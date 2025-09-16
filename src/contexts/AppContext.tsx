import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Invoice, Customer, Product, ProductTemplate, AppSettings, DashboardStats, SavedInvoice } from '../types';
import { useAuth } from './AuthContext';
import { InvoiceService } from '../services/invoiceService';
import { CustomerService } from '../services/customerService';
import { ProductService } from '../services/productService';
import { ProductTemplateService } from '../services/productTemplateService';
import { SettingsService } from '../services/settingsService';

interface AppState {
  invoices: SavedInvoice[];
  customers: Customer[];
  products: Product[];
  productTemplates: ProductTemplate[];
  settings: AppSettings;
  dashboardStats: DashboardStats;
  isLoading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INVOICES'; payload: SavedInvoice[] }
  | { type: 'SET_CUSTOMERS'; payload: Customer[] }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_PRODUCT_TEMPLATES'; payload: ProductTemplate[] }
  | { type: 'SET_SETTINGS'; payload: AppSettings }
  | { type: 'UPDATE_DASHBOARD_STATS'; payload: DashboardStats };

const initialState: AppState = {
  invoices: [],
  customers: [],
  products: [],
  productTemplates: [],
  settings: SettingsService.getDefaultSettings(),
  dashboardStats: {
    totalInvoices: 0,
    totalRevenue: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    paidInvoices: 0,
    unpaidInvoices: 0,
    recentInvoices: [],
  },
  isLoading: true,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_INVOICES':
      return { ...state, invoices: action.payload };
    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'SET_PRODUCT_TEMPLATES':
      return { ...state, productTemplates: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'UPDATE_DASHBOARD_STATS':
      return { ...state, dashboardStats: action.payload };
    default:
      return state;
  }
}

interface AppContextType extends AppState {
  // Invoice methods
  createInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateInvoice: (invoiceId: string, updates: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (invoiceId: string) => Promise<void>;
  duplicateInvoice: (invoiceId: string) => Promise<string>;
  markInvoiceAsSent: (invoiceId: string) => Promise<void>;
  markInvoiceAsPaid: (invoiceId: string) => Promise<void>;
  getInvoice: (invoiceId: string) => Promise<Invoice | null>;
  
  // Customer methods
  createCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<string>;
  updateCustomer: (customerId: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (customerId: string) => Promise<void>;
  getCustomer: (customerId: string) => Promise<Customer | null>;
  
  // Product methods
  createProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<string>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  getProduct: (productId: string) => Promise<Product | null>;
  getProductCategories: () => Promise<string[]>;
  
  // Product Template methods
  createProductTemplate: (template: Omit<ProductTemplate, 'id' | 'createdAt'>) => Promise<string>;
  updateProductTemplate: (templateId: string, updates: Partial<ProductTemplate>) => Promise<void>;
  deleteProductTemplate: (templateId: string) => Promise<void>;
  duplicateProductTemplate: (templateId: string, newName?: string) => Promise<string>;
  getProductTemplate: (templateId: string) => Promise<ProductTemplate | null>;
  getTemplateCategories: () => Promise<string[]>;
  
  // Settings methods
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  updateCompanyDetails: (details: Partial<AppSettings['companyDetails']>) => Promise<void>;
  updateNotificationSettings: (notifications: Partial<AppSettings['notifications']>) => Promise<void>;
  getNextInvoiceNumber: () => Promise<string>;
  
  // Utility methods
  refreshData: () => Promise<void>;
  clearError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { currentUser, isApproved } = useAuth();

  // Error handling helper
  const handleError = (error: any, context: string) => {
    console.error(`Error in ${context}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    dispatch({ type: 'SET_ERROR', payload: `${context}: ${errorMessage}` });
    throw error;
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  // Invoice methods
  const createInvoice = async (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      clearError();
      return await InvoiceService.saveInvoice(invoiceData, currentUser.uid);
    } catch (error) {
      handleError(error, 'Create Invoice');
    }
  };

  const updateInvoice = async (invoiceId: string, updates: Partial<Invoice>): Promise<void> => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      clearError();
      await InvoiceService.updateInvoice(invoiceId, updates, currentUser.uid);
    } catch (error) {
      handleError(error, 'Update Invoice');
    }
  };

  const deleteInvoice = async (invoiceId: string): Promise<void> => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      clearError();
      await InvoiceService.deleteInvoice(invoiceId, currentUser.uid);
    } catch (error) {
      handleError(error, 'Delete Invoice');
    }
  };

  const duplicateInvoice = async (invoiceId: string): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      clearError();
      return await InvoiceService.duplicateInvoice(invoiceId, currentUser.uid);
    } catch (error) {
      handleError(error, 'Duplicate Invoice');
    }
  };

  const markInvoiceAsSent = async (invoiceId: string): Promise<void> => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      clearError();
      await InvoiceService.markAsSent(invoiceId, currentUser.uid);
    } catch (error) {
      handleError(error, 'Mark Invoice as Sent');
    }
  };

  const markInvoiceAsPaid = async (invoiceId: string): Promise<void> => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      clearError();
      await InvoiceService.markAsPaid(invoiceId, currentUser.uid);
    } catch (error) {
      handleError(error, 'Mark Invoice as Paid');
    }
  };

  const getInvoice = async (invoiceId: string): Promise<Invoice | null> => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      clearError();
      return await InvoiceService.getInvoice(invoiceId, currentUser.uid);
    } catch (error) {
      handleError(error, 'Get Invoice');
    }
  };

  // Customer methods
  const createCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt'>): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      clearError();
      return await CustomerService.createCustomer(customerData, currentUser.uid);
    } catch (error) {
      handleError(error, 'Create Customer');
    }
  };

  const updateCustomer = async (customerId: string, updates: Partial<Customer>): Promise<void> => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      clearError();
      await CustomerService.updateCustomer(customerId, updates, currentUser.uid);
    } catch (error) {
      handleError(error, 'Update Customer');
    }
  };

  const deleteCustomer = async (customerId: string): Promise<void> => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      clearError();
      await CustomerService.deleteCustomer(customerId, currentUser.uid);
    } catch (error) {
      handleError(error, 'Delete Customer');
    }
  };

  const getCustomer = async (customerId: string): Promise<Customer | null> => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      clearError();
      return await CustomerService.getCustomer(customerId, currentUser.uid);
    } catch (error) {
      handleError(error, 'Get Customer');
    }
  };

  // Product methods
  const createProduct = async (productData: Omit<Product, 'id' | 'createdAt'>): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      clearError();
      return await ProductService.createProduct(productData, currentUser.uid);
    } catch (error) {
      handleError(error, 'Create Product');
    }
  };

  const updateProduct = async (productId: string, updates: Partial<Product>): Promise<void> => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      clearError();
      await ProductService.updateProduct(productId, updates, currentUser.uid);
    } catch (error) {
      handleError(error, 'Update Product');
    }
  };

  const deleteProduct = async (productId: string): Promise<void> => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      clearError();
      await ProductService.deleteProduct(productId, currentUser.uid);
    } catch (error) {
      handleError(error, 'Delete Product');
    }
  };

  const getProduct = async (productId: string): Promise<Product | null> => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      clearError();
      return await ProductService.getProduct(productId, currentUser.uid);
    } catch (error) {
      handleError(error, 'Get Product');
    }
  };

  const getProductCategories = async (): Promise<string[]> => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      clearError();
      return await ProductService.getUserProductCategories(currentUser.uid);
    } catch (error) {
      handleError(error, 'Get Product Categories');
    }
  };

  // Product Template methods
  const createProductTemplate = async (templateData: Omit<ProductTemplate, 'id' | 'createdAt'>): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      clearError();
      return await ProductTemplateService.createProductTemplate(templateData, currentUser.uid);
    } catch (error) {
      handleError(error, 'Create Product Template');
    }
  };

  const updateProductTemplate = async (templateId: string, updates: Partial<ProductTemplate>): Promise<void> => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      clearError();
      await ProductTemplateService.updateProductTemplate(templateId, updates, currentUser.uid);
    } catch (error) {
      handleError(error, 'Update Product Template');
    }
  };

  const deleteProductTemplate = async (templateId: string): Promise<void> => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      clearError();
      await ProductTemplateService.deleteProductTemplate(templateId, currentUser.uid);
    } catch (error) {
      handleError(error, 'Delete Product Template');
    }
  };

  const duplicateProductTemplate = async (templateId: string, newName?: string): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      clearError();
      return await ProductTemplateService.duplicateProductTemplate(templateId, currentUser.uid, newName);
    } catch (error) {
      handleError(error, 'Duplicate Product Template');
    }
  };

  const getProductTemplate = async (templateId: string): Promise<ProductTemplate | null> => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      clearError();
      return await ProductTemplateService.getProductTemplate(templateId, currentUser.uid);
    } catch (error) {
      handleError(error, 'Get Product Template');
    }
  };

  const getTemplateCategories = async (): Promise<string[]> => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      clearError();
      return await ProductTemplateService.getUserTemplateCategories(currentUser.uid);
    } catch (error) {
      handleError(error, 'Get Template Categories');
    }
  };

  // Settings methods
  const updateSettings = async (settingsData: Partial<AppSettings>): Promise<void> => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      clearError();
      await SettingsService.updateUserSettings(currentUser.uid, settingsData);
    } catch (error) {
      handleError(error, 'Update Settings');
    }
  };

  const updateCompanyDetails = async (details: Partial<AppSettings['companyDetails']>): Promise<void> => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      clearError();
      await SettingsService.updateCompanyDetails(currentUser.uid, details);
    } catch (error) {
      handleError(error, 'Update Company Details');
    }
  };

  const updateNotificationSettings = async (notifications: Partial<AppSettings['notifications']>): Promise<void> => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      clearError();
      await SettingsService.updateNotificationSettings(currentUser.uid, notifications);
    } catch (error) {
      handleError(error, 'Update Notification Settings');
    }
  };

  const getNextInvoiceNumber = async (): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      clearError();
      return await SettingsService.getNextInvoiceNumber(currentUser.uid);
    } catch (error) {
      handleError(error, 'Get Next Invoice Number');
    }
  };

  // Utility methods
  const refreshData = async (): Promise<void> => {
    if (!currentUser) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      clearError();
      
      // Load all data in parallel
      const [invoices, customers, products, templates, settings] = await Promise.all([
        InvoiceService.getUserInvoices(currentUser.uid),
        CustomerService.getUserCustomers(currentUser.uid),
        ProductService.getUserProducts(currentUser.uid),
        ProductTemplateService.getUserProductTemplates(currentUser.uid),
        SettingsService.getUserSettings(currentUser.uid),
      ]);

      dispatch({ type: 'SET_INVOICES', payload: invoices });
      dispatch({ type: 'SET_CUSTOMERS', payload: customers });
      dispatch({ type: 'SET_PRODUCTS', payload: products });
      dispatch({ type: 'SET_PRODUCT_TEMPLATES', payload: templates });
      if (settings) {
        dispatch({ type: 'SET_SETTINGS', payload: settings });
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Error refreshing data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const calculateDashboardStats = (invoices: SavedInvoice[]) => {
    const totalInvoices = invoices.length;
    const totalRevenue = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);
    const pendingAmount = invoices
      .filter(inv => inv.status === 'sent')
      .reduce((sum, inv) => sum + inv.total, 0);
    const overdueAmount = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.total, 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const unpaidInvoices = invoices.filter(inv => inv.status !== 'paid').length;
    const recentInvoices = invoices.slice(0, 5);

    const stats: DashboardStats = {
      totalInvoices,
      totalRevenue,
      pendingAmount,
      overdueAmount,
      paidInvoices,
      unpaidInvoices,
      recentInvoices,
    };

    dispatch({ type: 'UPDATE_DASHBOARD_STATS', payload: stats });
  };

  // Set up real-time subscriptions when currentUser is authenticated and approved
  useEffect(() => {
    if (!currentUser || !isApproved) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    
    let isMounted = true;
    
    // Set up real-time subscriptions with error handling
    const setupSubscriptions = async () => {
      try {
        const unsubscribeInvoices = InvoiceService.subscribeToInvoices(currentUser.uid, (invoices) => {
          if (!isMounted) return;
          dispatch({ type: 'SET_INVOICES', payload: invoices });
          calculateDashboardStats(invoices);
        });

        const unsubscribeCustomers = CustomerService.subscribeToCustomers(currentUser.uid, (customers) => {
          if (!isMounted) return;
          dispatch({ type: 'SET_CUSTOMERS', payload: customers });
        });

        const unsubscribeProducts = ProductService.subscribeToProducts(currentUser.uid, (products) => {
          if (!isMounted) return;
          dispatch({ type: 'SET_PRODUCTS', payload: products });
        });

        const unsubscribeTemplates = ProductTemplateService.subscribeToProductTemplates(currentUser.uid, (templates) => {
          if (!isMounted) return;
          dispatch({ type: 'SET_PRODUCT_TEMPLATES', payload: templates });
        });

        const unsubscribeSettings = SettingsService.subscribeToSettings(currentUser.uid, (settings) => {
          if (!isMounted) return;
          dispatch({ type: 'SET_SETTINGS', payload: settings });
        });

        if (isMounted) {
          dispatch({ type: 'SET_LOADING', payload: false });
        }

        // Return cleanup function
        return () => {
          isMounted = false;
          unsubscribeInvoices();
          unsubscribeCustomers();
          unsubscribeProducts();
          unsubscribeTemplates();
          unsubscribeSettings();
        };
      } catch (error) {
        console.error('Error setting up subscriptions:', error);
        if (isMounted) {
          dispatch({ type: 'SET_ERROR', payload: 'Failed to set up data subscriptions' });
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    const cleanup = setupSubscriptions();

    // Cleanup subscriptions
    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [currentUser, isApproved]);

  const contextValue: AppContextType = {
    ...state,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    duplicateInvoice,
    markInvoiceAsSent,
    markInvoiceAsPaid,
    getInvoice,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomer,
    createProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    getProductCategories,
    createProductTemplate,
    updateProductTemplate,
    deleteProductTemplate,
    duplicateProductTemplate,
    getProductTemplate,
    getTemplateCategories,
    updateSettings,
    updateCompanyDetails,
    updateNotificationSettings,
    getNextInvoiceNumber,
    refreshData,
    clearError,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}