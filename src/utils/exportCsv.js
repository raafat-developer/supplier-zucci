
import api from '@/lib/axios';

/**
 * Reusable function to export CSV from an API endpoint
 * @param {string} endpoint - API endpoint to get the CSV data from
 * @param {Object} [options] - Additional options
 * @param {string} [options.defaultFilename='export.csv'] - Default filename if not provided by server
 * @param {boolean} [options.useSemicolonSeparator=false] - Whether to replace commas with semicolons for regional compatibility
 */
export async function exportCsv(endpoint, { 
  defaultFilename = 'export.csv', 
  useSemicolonSeparator = true 
} = {}) {
  try {
    const response = await api.get(endpoint, { responseType: 'blob' });
    
    let text;
    if (response.config.responseType === 'blob') {
      text = await response.data.text();
    } else {
      text = typeof response === 'string' ? response : '';
    }
    
    // Clean up and process CSV text
    const lines = text.trim().split(/\r?\n/).map(line => line.trim());
    let csvText = lines.join('\r\n');
    
    // Replace commas with semicolons if needed
    if (useSemicolonSeparator) {
      csvText = csvText.replace(/,/g, ';');
    }
    
    // Create blob with BOM for UTF-8 compatibility in Excel
    const blob = new Blob(['\ufeff' + csvText], { type: 'text/csv;charset=utf-8;' });
    
    // Get filename from Content-Disposition header or use default
    let filename = defaultFilename;
    const contentDisposition = response.headers?.['content-disposition'];
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }
    
    // Create and trigger download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url); // Clean up
  } catch (err) {
    console.error('Error exporting CSV:', err);
    throw err;
  }
}
