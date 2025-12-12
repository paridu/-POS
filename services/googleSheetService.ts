import { Sale } from '../types';

export const exportToCSV = (sales: Sale[]) => {
  // Define CSV Headers
  const headers = ['Sale ID', 'Date', 'Time', 'Total Amount', 'Payment Method', 'Items Count'];
  
  // Format Data Rows
  const rows = sales.map(sale => {
    const d = new Date(sale.date);
    const dateStr = d.toLocaleDateString('th-TH');
    const timeStr = d.toLocaleTimeString('th-TH');
    return [
      sale.id,
      dateStr,
      timeStr,
      sale.finalAmount,
      sale.paymentMethod,
      sale.items.length
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','), 
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create Blob and Download Link
  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel Thai support
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `sales_report_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};