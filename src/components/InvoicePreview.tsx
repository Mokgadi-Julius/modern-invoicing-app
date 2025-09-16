import React from 'react';
import { Invoice, TemplateId } from '../../types';
import { BaseTemplate } from './templates/BaseTemplate';
import { WritenowTemplate } from './templates/WritenowTemplate';
import { ModernTemplate } from './templates/ModernTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { PremiumTemplate } from './templates/PremiumTemplate';

interface InvoicePreviewProps {
  invoice: Invoice;
  templateId: TemplateId;
  logoSrc?: string | null;
  currency?: string;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  invoice,
  templateId,
  logoSrc,
  currency = 'USD'
}) => {
  // Add null check for invoice
  if (!invoice) {
    return (
      <div className="w-full p-8 text-center text-gray-500">
        <p>Invoice data not available</p>
      </div>
    );
  }

  const renderTemplate = () => {
    switch (templateId) {
      case 'writenow':
        return <WritenowTemplate invoice={invoice} logoSrc={logoSrc} currency={currency} />;
      case 'modern':
        return <ModernTemplate invoice={invoice} logoSrc={logoSrc} currency={currency} />;
      case 'creative':
        return <CreativeTemplate invoice={invoice} logoSrc={logoSrc} currency={currency} />;
      case 'classic':
        return <ClassicTemplate invoice={invoice} logoSrc={logoSrc} currency={currency} />;
      case 'premium':
        return <PremiumTemplate invoice={invoice} logoSrc={logoSrc} currency={currency} />;
      default:
        return <BaseTemplate invoice={invoice} logoSrc={logoSrc} currency={currency} />;
    }
  };

  return (
    <div className="w-full">
      {renderTemplate()}
    </div>
  );
};