export interface CompanyDetails {
  name: string;
  address: string;
  email: string;
  phone: string;
  vatNumber?: string;
  clientReference?: string;
  contactNumber?: string;
}

export interface BankingDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber: string; // Sort code or routing number
  swift?: string; // Optional for international transfers
  reference?: string; // Payment reference
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
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
  bankingDetails?: BankingDetails;
  includeBankingDetails: boolean;
  templateId: TemplateId;
  userId: string;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  companyDetails?: CompanyDetails;
  bankingDetails?: BankingDetails;
  role: 'user' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  lastLogin?: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  companyName: string;
  role: 'admin' | 'user';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export type SavedInvoice = Invoice;

export type TemplateId = 'classic' | 'modern' | 'creative' | 'writenow' | 'premium';

export interface TemplateOption {
  id: TemplateId;
  name: string;
  previewImageUrl?: string; // Optional: for a visual picker
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
  userId: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
  category: string;
  taxRate: number;
  createdAt: string;
  userId: string;
}

export interface ProductTemplate {
  id: string;
  name: string;
  description: string;
  items: LineItem[];
  category: string;
  totalPrice: number;
  createdAt: string;
  userId: string;
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
