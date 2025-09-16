import { Invoice, TemplateOption, TemplateId, BankingDetails } from './src/types';

export const initialCompanyDetails = {
  name: '',
  address: '',
  email: '',
  phone: '',
};

export const initialBankingDetails: BankingDetails = {
  bankName: 'Capitec Business Account',
  accountName: 'Your Company Name',
  accountNumber: '1054 0348 18',
  routingNumber: '450105',
  swift: '',
  reference: 'Please use your invoice number as reference',
};

export const initialInvoiceData: Invoice = {
  invoiceNumber: 'INV-001',
  date: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
  from: { ...initialCompanyDetails, name: "Your Company Name", address: "123 Main St, Anytown, USA", email: "your@email.com", phone: "555-1234" },
  to: { ...initialCompanyDetails, name: "Client Company Name", address: "456 Oak Ave, Otherville, USA", email: "client@email.com", phone: "555-5678" },
  items: [
    { id: '1', description: 'Web Design Services', quantity: 10, unitPrice: 50 },
    { id: '2', description: 'Consulting Hours', quantity: 5, unitPrice: 100 },
  ],
  notes: 'Thank you for your business! Payment is due within 30 days.',
  paymentType: 'once-off',
  taxRate: 0, // Default no tax
  discountType: 'fixed',
  discountValue: 0, // Default no discount
  subTotal: 0, // Will be calculated
  taxAmount: 0, // Will be calculated
  discountAmount: 0, // Will be calculated
  total: 0, // Will be calculated
  bankingDetails: { ...initialBankingDetails },
  includeBankingDetails: false, // Default to not showing banking details
};

export const TEMPLATES: TemplateOption[] = [
  { id: 'classic', name: 'Classic Professional' },
  { id: 'modern', name: 'Modern Minimalist' },
  { id: 'creative', name: 'Creative Touch' },
  { id: 'writenow', name: 'Writenow Professional' },
  { id: 'premium', name: 'Premium Designer' },
];

export const defaultLogoPlaceholder = "https://picsum.photos/seed/logo/200/100?grayscale";
