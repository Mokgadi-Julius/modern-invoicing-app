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

export interface Invoice {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  from: CompanyDetails;
  to: CompanyDetails;
  items: LineItem[];
  notes: string;
  paymentType: 'once-off' | 'monthly';
  taxRate: number; // Percentage, e.g., 10 for 10%
  discountType: 'percentage' | 'fixed';
  discountValue: number; // Actual value or percentage
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
}

export type TemplateId = 'classic' | 'modern' | 'creative';

export interface TemplateOption {
  id: TemplateId;
  name: string;
  previewImageUrl?: string; // Optional: for a visual picker
}
