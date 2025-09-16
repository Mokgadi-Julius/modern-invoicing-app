import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateInvoicePDF = async (
  invoiceElement: HTMLElement,
  invoiceNumber: string,
  clientName: string
): Promise<void> => {
  try {
    // Create canvas from the invoice element
    const canvas = await html2canvas(invoiceElement, {
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: invoiceElement.scrollWidth,
      height: invoiceElement.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png');

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Calculate dimensions to fit A4
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    // Generate filename
    const sanitizedClientName = clientName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Invoice_${invoiceNumber}_${sanitizedClientName}.pdf`;

    // Download the PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

export const downloadInvoicePDF = async (
  invoiceId: string,
  invoiceNumber: string,
  clientName: string
): Promise<void> => {
  // Look for the invoice preview element
  const invoiceElement = document.querySelector(`[data-invoice-id="${invoiceId}"]`) as HTMLElement;

  if (!invoiceElement) {
    // Fallback: look for any invoice preview element
    const fallbackElement = document.querySelector('.invoice-preview, [class*="invoice"], [class*="template"]') as HTMLElement;
    if (!fallbackElement) {
      throw new Error('Invoice preview not found. Please ensure the invoice is displayed.');
    }
    await generateInvoicePDF(fallbackElement, invoiceNumber, clientName);
  } else {
    await generateInvoicePDF(invoiceElement, invoiceNumber, clientName);
  }
};

// Generate PDF as Blob for sharing (doesn't automatically download)
export const generateInvoicePDFBlob = async (
  invoiceElement: HTMLElement,
  invoiceNumber: string,
  clientName: string
): Promise<{ blob: Blob; filename: string }> => {
  try {
    // Create canvas from the invoice element
    const canvas = await html2canvas(invoiceElement, {
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: invoiceElement.scrollWidth,
      height: invoiceElement.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png');

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Calculate dimensions to fit A4
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    // Generate filename
    const sanitizedClientName = clientName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Invoice_${invoiceNumber}_${sanitizedClientName}.pdf`;

    // Return blob instead of downloading
    const pdfBlob = pdf.output('blob');
    return { blob: pdfBlob, filename };
  } catch (error) {
    console.error('Error generating PDF blob:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

// Generate PDF blob from invoice ID (for sharing)
export const generateInvoicePDFBlobById = async (
  invoiceId: string,
  invoiceNumber: string,
  clientName: string
): Promise<{ blob: Blob; filename: string }> => {
  // Look for the invoice preview element
  const invoiceElement = document.querySelector(`[data-invoice-id="${invoiceId}"]`) as HTMLElement;

  if (!invoiceElement) {
    // Fallback: look for any invoice preview element
    const fallbackElement = document.querySelector('.invoice-preview, [class*="invoice"], [class*="template"]') as HTMLElement;
    if (!fallbackElement) {
      throw new Error('Invoice preview not found. Please ensure the invoice is displayed.');
    }
    return await generateInvoicePDFBlob(fallbackElement, invoiceNumber, clientName);
  } else {
    return await generateInvoicePDFBlob(invoiceElement, invoiceNumber, clientName);
  }
};