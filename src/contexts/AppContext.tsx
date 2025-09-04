import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Invoice, Customer, Product, ProductTemplate, AppSettings, DashboardStats } from '../types';
import { initialAppSettings, generateMockData } from '../utils/mockData';

interface AppState {
  invoices: Invoice[];
  customers: Customer[];
  products: Product[];
  productTemplates: ProductTemplate[];
  settings: AppSettings;
  dashboardStats: DashboardStats;
  isLoading: boolean;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INVOICES'; payload: Invoice[] }
  | { type: 'ADD_INVOICE'; payload: Invoice }
  | { type: 'UPDATE_INVOICE'; payload: Invoice }
  | { type: 'DELETE_INVOICE'; payload: string }
  | { type: 'SET_CUSTOMERS'; payload: Customer[] }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'DELETE_CUSTOMER'; payload: string }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SET_PRODUCT_TEMPLATES'; payload: ProductTemplate[] }
  | { type: 'ADD_PRODUCT_TEMPLATE'; payload: ProductTemplate }
  | { type: 'UPDATE_PRODUCT_TEMPLATE'; payload: ProductTemplate }
  | { type: 'DELETE_PRODUCT_TEMPLATE'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'UPDATE_DASHBOARD_STATS'; payload: DashboardStats };

const initialState: AppState = {
  invoices: [],
  customers: [],
  products: [],
  productTemplates: [],
  settings: initialAppSettings,
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
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_INVOICES':
      return { ...state, invoices: action.payload };
    case 'ADD_INVOICE':
      return { ...state, invoices: [...state.invoices, action.payload] };
    case 'UPDATE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.map(inv =>
          inv.id === action.payload.id ? action.payload : inv
        ),
      };
    case 'DELETE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.filter(inv => inv.id !== action.payload),
      };
    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload };
    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.payload] };
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map(cust =>
          cust.id === action.payload.id ? action.payload : cust
        ),
      };
    case 'DELETE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.filter(cust => cust.id !== action.payload),
      };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(prod =>
          prod.id === action.payload.id ? action.payload : prod
        ),
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(prod => prod.id !== action.payload),
      };
    case 'SET_PRODUCT_TEMPLATES':
      return { ...state, productTemplates: action.payload };
    case 'ADD_PRODUCT_TEMPLATE':
      return { ...state, productTemplates: [...state.productTemplates, action.payload] };
    case 'UPDATE_PRODUCT_TEMPLATE':
      return {
        ...state,
        productTemplates: state.productTemplates.map(template =>
          template.id === action.payload.id ? action.payload : template
        ),
      };
    case 'DELETE_PRODUCT_TEMPLATE':
      return {
        ...state,
        productTemplates: state.productTemplates.filter(template => template.id !== action.payload),
      };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'UPDATE_DASHBOARD_STATS':
      return { ...state, dashboardStats: action.payload };
    default:
      return state;
  }
}

interface AppContextType extends AppState {
  dispatch: React.Dispatch<AppAction>;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addProductTemplate: (template: Omit<ProductTemplate, 'id' | 'createdAt'>) => void;
  updateProductTemplate: (template: ProductTemplate) => void;
  deleteProductTemplate: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  calculateDashboardStats: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Helper functions
  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    const invoice: Invoice = {
      ...invoiceData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_INVOICE', payload: invoice });
  };

  const updateInvoice = (invoice: Invoice) => {
    const updatedInvoice = { ...invoice, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_INVOICE', payload: updatedInvoice });
  };

  const deleteInvoice = (id: string) => {
    dispatch({ type: 'DELETE_INVOICE', payload: id });
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    const customer: Customer = {
      ...customerData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_CUSTOMER', payload: customer });
  };

  const updateCustomer = (customer: Customer) => {
    dispatch({ type: 'UPDATE_CUSTOMER', payload: customer });
  };

  const deleteCustomer = (id: string) => {
    dispatch({ type: 'DELETE_CUSTOMER', payload: id });
  };

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const product: Product = {
      ...productData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_PRODUCT', payload: product });
  };

  const updateProduct = (product: Product) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: product });
  };

  const deleteProduct = (id: string) => {
    dispatch({ type: 'DELETE_PRODUCT', payload: id });
  };

  const addProductTemplate = (templateData: Omit<ProductTemplate, 'id' | 'createdAt'>) => {
    const template: ProductTemplate = {
      ...templateData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_PRODUCT_TEMPLATE', payload: template });
  };

  const updateProductTemplate = (template: ProductTemplate) => {
    dispatch({ type: 'UPDATE_PRODUCT_TEMPLATE', payload: template });
  };

  const deleteProductTemplate = (id: string) => {
    dispatch({ type: 'DELETE_PRODUCT_TEMPLATE', payload: id });
  };

  const updateSettings = (settings: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const calculateDashboardStats = () => {
    const totalInvoices = state.invoices.length;
    const totalRevenue = state.invoices
      .filter(inv => inv.paymentStatus === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);
    const pendingAmount = state.invoices
      .filter(inv => inv.paymentStatus === 'unpaid')
      .reduce((sum, inv) => sum + inv.total, 0);
    const overdueAmount = state.invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.total, 0);
    const paidInvoices = state.invoices.filter(inv => inv.paymentStatus === 'paid').length;
    const unpaidInvoices = state.invoices.filter(inv => inv.paymentStatus === 'unpaid').length;
    const recentInvoices = state.invoices
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

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

  // Initialize with mock data
  useEffect(() => {
    const mockData = generateMockData();
    dispatch({ type: 'SET_INVOICES', payload: mockData.invoices });
    dispatch({ type: 'SET_CUSTOMERS', payload: mockData.customers });
    dispatch({ type: 'SET_PRODUCTS', payload: mockData.products });
    dispatch({ type: 'SET_PRODUCT_TEMPLATES', payload: mockData.productTemplates });
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  // Recalculate stats when invoices change
  useEffect(() => {
    if (state.invoices.length > 0) {
      calculateDashboardStats();
    }
  }, [state.invoices]);

  const contextValue: AppContextType = {
    ...state,
    dispatch,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addProduct,
    updateProduct,
    deleteProduct,
    addProductTemplate,
    updateProductTemplate,
    deleteProductTemplate,
    updateSettings,
    calculateDashboardStats,
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