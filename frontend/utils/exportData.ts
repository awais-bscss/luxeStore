import * as XLSX from 'xlsx';

/**
 * Enhanced Excel Export with Professional Formatting
 * Creates properly formatted Excel files with:
 * - Header rows with branding
 * - Column widths
 * - Cell styling
 * - Multiple sheets support
 */

interface ExportOptions {
  filename: string;
  sheetName?: string;
  title?: string;
  subtitle?: string;
  exportedBy?: string;
  additionalInfo?: Record<string, string>;
}

/**
 * Export data to professionally formatted Excel file
 */
export const exportToExcel = (data: any[], options: ExportOptions) => {
  const {
    filename,
    sheetName = 'Data',
    title = 'Report',
    subtitle,
    exportedBy,
    additionalInfo = {}
  } = options;

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Prepare header rows
  const headerRows: any[] = [];

  // Title row
  headerRows.push([title]);

  // Subtitle (if provided)
  if (subtitle) {
    headerRows.push([subtitle]);
  }

  // Export info
  const now = new Date();
  headerRows.push([`Generated: ${now.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })}`]);

  // Exported by
  if (exportedBy) {
    headerRows.push([`Exported by: ${exportedBy}`]);
  }

  // Additional info
  Object.entries(additionalInfo).forEach(([key, value]) => {
    headerRows.push([`${key}: ${value}`]);
  });

  // Empty row for spacing
  headerRows.push([]);

  // Convert data to worksheet format - Start with headers
  const ws = XLSX.utils.aoa_to_sheet(headerRows);

  // Add JSON data below headers
  XLSX.utils.sheet_add_json(ws, data, {
    origin: headerRows.length,
    skipHeader: false
  });

  // Auto-size columns
  const colWidths: any[] = [];

  // Get max width for each column
  if (data.length > 0) {
    const keys = Object.keys(data[0]);
    keys.forEach((key, index) => {
      const maxLength = Math.max(
        key.length,
        ...data.map(row => {
          const value = row[key];
          return value ? value.toString().length : 0;
        })
      );
      colWidths.push({ wch: Math.min(maxLength + 2, 50) }); // Max 50 chars
    });
  }

  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Generate Excel file
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

/**
 * Export multiple sheets to one Excel file
 */
export const exportMultipleSheets = (
  sheets: Array<{ data: any[]; sheetName: string }>,
  filename: string,
  globalInfo?: {
    title?: string;
    exportedBy?: string;
  }
) => {
  const wb = XLSX.utils.book_new();

  sheets.forEach(({ data, sheetName }) => {
    // Prepare header
    const headerRows: any[] = [];

    if (globalInfo?.title) {
      headerRows.push([globalInfo.title]);
    }

    headerRows.push([sheetName]);
    headerRows.push([`Generated: ${new Date().toLocaleString()}`]);

    if (globalInfo?.exportedBy) {
      headerRows.push([`Exported by: ${globalInfo.exportedBy}`]);
    }

    headerRows.push([]);

    // Create worksheet - Start with headers
    const ws = XLSX.utils.aoa_to_sheet(headerRows);

    // Add JSON data below headers
    XLSX.utils.sheet_add_json(ws, data, {
      origin: headerRows.length,
      skipHeader: false
    });

    // Auto-size columns
    if (data.length > 0) {
      const keys = Object.keys(data[0]);
      const colWidths = keys.map(key => {
        const maxLength = Math.max(
          key.length,
          ...data.map(row => {
            const value = row[key];
            return value ? value.toString().length : 0;
          })
        );
        return { wch: Math.min(maxLength + 2, 50) };
      });
      ws['!cols'] = colWidths;
    }

    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  XLSX.writeFile(wb, `${filename}.xlsx`);
};

/**
 * Legacy CSV export (kept for backwards compatibility)
 */
export const exportToCSV = (data: any[], filename: string) => {
  // Convert to CSV
  const headers = Object.keys(data[0] || {});
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = value?.toString() || '';
        return stringValue.includes(',') || stringValue.includes('"')
          ? `"${stringValue.replace(/"/g, '""')}"`
          : stringValue;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Format date for export
 */
export const formatDateForExport = (date: string | Date | null): string => {
  if (!date) return 'N/A';

  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format currency for export
 */
export const formatCurrencyForExport = (
  amount: number,
  currency: string = 'USD'
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'PKR' ? 'PKR' : 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};
