export interface CompanyDetails {
  name: string;
  address: string;
  email: string;
  phone: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  taxId?: string;
  createdAt: string;
  totalInvoices: number;
  totalAmount: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
  category: string;
  taxRate: number;
  createdAt: string;
}

export interface ProductTemplate {
  id: string;
  name: string;
  description: string;
  items: LineItem[];
  category: string;
  totalPrice: number;
  createdAt: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'overdue';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  from: CompanyDetails;
  to: CompanyDetails;
  customerId: string;
  items: LineItem[];
  notes: string;
  paymentType: 'once-off' | 'monthly';
  taxRate: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  sentAt?: string;
}

export type TemplateId = 'classic' | 'modern' | 'creative';

export interface TemplateOption {
  id: TemplateId;
  name: string;
  previewImageUrl?: string;
}

export interface AppSettings {
  companyDetails: CompanyDetails;
  defaultTaxRate: number;
  defaultPaymentTerms: number;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  currency: string;
  defaultTemplate: TemplateId;
  logoUrl?: string;
  theme: 'light' | 'dark';
  notifications: {
    emailReminders: boolean;
    overdueAlerts: boolean;
    paymentConfirmations: boolean;
  };
}

export interface DashboardStats {
  totalInvoices: number;
  totalRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  paidInvoices: number;
  unpaidInvoices: number;
  recentInvoices: Invoice[];
}