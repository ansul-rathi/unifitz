import { useState } from 'react';
import { Upload, Download, FileText, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function PDFExtractor() {
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const extractTextFromPDF = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let extractedText = '';
      let items = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Sort items by their vertical position
        items = [...items, ...textContent.items.map(item => ({
          text: item.str,
          x: item.transform[4],
          y: item.transform[5],
          fontName: item.fontName || '',
          fontSize: item.fontSize || 0
        }))];

        const lineItems = {};
        textContent.items.forEach(item => {
          const y = Math.round(item.transform[5]);
          if (!lineItems[y]) lineItems[y] = [];
          lineItems[y].push(item.str);
        });

        const sortedYPositions = Object.keys(lineItems).sort((a, b) => b - a);
        sortedYPositions.forEach(y => {
          extractedText += lineItems[y].join(' ') + '\n';
        });
      }

      // Sort all items by vertical position (top to bottom)
      items.sort((a, b) => b.y - a.y);

      return analyzeBillContent(extractedText, items);
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw error;
    }
  };

  const analyzeBillContent = (text, items) => {
    const billData = {
      billNumber: '',
      date: '',
      companyName: '',
      companyAddress: '',
      customerName: '',
      customerAddress: '',
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0
    };

    // Common patterns in bills
    const patterns = {
      billNumber: /(?:invoice|bill|order)(?:\s+#|\s+no\.?|\s+number:?)?[\s:]*([\w\d-]+)/i,
      date: /(?:date|dated|invoice date)[\s:]*([\d/.-]+)/i,
      amount: /(?:amount|total|sum)[\s:]*[$₹£€]?([\d,]+\.?\d*)/i,
      taxPattern: /(?:tax|gst|vat|hst)[\s:]*[$₹£€]?([\d,]+\.?\d*)/i,
      phonePattern: /(?:phone|tel|telephone)[\s:]*([+\d()-\s]+)/i,
      emailPattern: /[\w.-]+@[\w.-]+\.\w+/i
    };

    // Function to extract address (usually multiple consecutive lines with postal code/zip)
    const extractAddress = (startIndex, items) => {
      let address = [];
      let i = startIndex;
      const postalCodePattern = /[A-Z]\d[A-Z]\s?\d[A-Z]\d|^\d{5}(?:[-\s]\d{4})?$/;
      
      while (i < items.length && address.length < 4) {
        const line = items[i].text.trim();
        if (line && (address.length === 0 || postalCodePattern.test(line))) {
          address.push(line);
        }
        i++;
      }
      return address.join(', ');
    };

    // Extract basic information
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    
    // Process each line
    lines.forEach((line, index) => {
      // Bill Number
      const billMatch = line.match(patterns.billNumber);
      if (billMatch && !billData.billNumber) {
        billData.billNumber = billMatch[1];
      }

      // Date
      const dateMatch = line.match(patterns.date);
      if (dateMatch && !billData.date) {
        billData.date = dateMatch[1];
      }

      // Look for company name (usually at the top, in larger font)
      if (!billData.companyName && index < 5 && line.length > 2) {
        const relevantItem = items.find(item => item.text.includes(line) && item.fontSize > 10);
        if (relevantItem) {
          billData.companyName = line;
          // Try to extract company address from subsequent lines
          billData.companyAddress = extractAddress(items.indexOf(relevantItem) + 1, items);
        }
      }

      // Look for items (usually have quantity and price)
      const itemMatch = line.match(/(\d+)\s+x\s+(.+?)\s+[$₹£€]?([\d,]+\.?\d*)/i);
      if (itemMatch) {
        billData.items.push({
          quantity: parseInt(itemMatch[1]),
          description: itemMatch[2].trim(),
          price: parseFloat(itemMatch[3].replace(',', ''))
        });
      }

      // Extract totals
      const totalMatch = line.match(/total:?\s*[$₹£€]?([\d,]+\.?\d*)/i);
      if (totalMatch) {
        billData.total = parseFloat(totalMatch[1].replace(',', ''));
      }

      const taxMatch = line.match(patterns.taxPattern);
      if (taxMatch) {
        billData.tax = parseFloat(taxMatch[1].replace(',', ''));
      }
    });

    // Calculate subtotal if not found
    if (billData.total && billData.tax && !billData.subtotal) {
      billData.subtotal = billData.total - billData.tax;
    }

    return billData;
  };

  const handleFile = async (file) => {
    if (!file) return;

    if (!file.type.includes('pdf')) {
      setError('Please upload a PDF file');
      return;
    }

    setUploadedFile(file);
    setLoading(true);
    setError('');

    try {
      const data = await extractTextFromPDF(file);
      setExtractedData(data);
      console.log('Extracted Data:', data);
    } catch (error) {
      console.error('Error processing PDF:', error);
      setError('Failed to process PDF file');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!extractedData) return;

    // Prepare data for Excel
    const workbook = XLSX.utils.book_new();

    // Main bill information
    const mainInfo = {
      'Bill Number': extractedData.billNumber,
      'Date': extractedData.date,
      'Company Name': extractedData.companyName,
      'Company Address': extractedData.companyAddress,
      'Customer Name': extractedData.customerName,
      'Customer Address': extractedData.customerAddress,
      'Subtotal': extractedData.subtotal,
      'Tax': extractedData.tax,
      'Total': extractedData.total
    };

    // Create main info worksheet
    const mainWorksheet = XLSX.utils.json_to_sheet([mainInfo]);
    XLSX.utils.book_append_sheet(workbook, mainWorksheet, 'Bill Information');

    // Create items worksheet if there are items
    if (extractedData.items && extractedData.items.length > 0) {
      const itemsWorksheet = XLSX.utils.json_to_sheet(extractedData.items);
      XLSX.utils.book_append_sheet(workbook, itemsWorksheet, 'Items');
    }

    // Save the file
    XLSX.writeFile(workbook, `Bill_${extractedData.billNumber || 'Data'}.xlsx`);
  };

  // ... [drag and drop handlers remain the same] ...

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearFile = () => {
    setUploadedFile(null);
    setExtractedData(null);
    setError('');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Bill Data Extractor</h1>

        {/* Upload Section */}
        <div className="space-y-6">
          {!uploadedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center border-2 border-dashed ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
              } rounded-lg p-6 transition-colors duration-300 cursor-pointer`}
            >
              <Upload className={`w-12 h-12 mb-2 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
              <label className="cursor-pointer text-center">
                <span className="text-gray-600 mb-2 block">
                  Drag & drop your PDF bill here, or
                </span>
                <span className="mt-2 text-base leading-normal px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors inline-block">
                  Browse Files
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleChange}
                />
              </label>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-blue-500" />
                <span className="font-medium">{uploadedFile.name}</span>
                <span className="text-sm text-gray-500">
                  ({(uploadedFile.size / 1024).toFixed(2)} KB)
                </span>
              </div>
              <button
                onClick={clearFile}
                className="p-2 hover:bg-blue-100 rounded-full transition-colors"
              >
                <Trash2 className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-center">{error}</div>
          )}

          {loading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2">Processing PDF...</p>
            </div>
          )}

          {/* Extracted Data Display */}
          {extractedData && (
            <div className="mt-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Extracted Bill Data</h2>
                <button
                  onClick={exportToExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export to Excel
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Basic Information</h3>
                    <div className="space-y-2">
                      <p><span className="text-gray-600">Bill Number:</span> {extractedData.billNumber}</p>
                      <p><span className="text-gray-600">Date:</span> {extractedData.date}</p>
                      <p><span className="text-gray-600">Company:</span> {extractedData.companyName}</p>
                      <p><span className="text-gray-600">Address:</span> {extractedData.companyAddress}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Summary</h3>
                    <div className="space-y-2">
                      <p><span className="text-gray-600">Subtotal:</span> ${extractedData.subtotal?.toFixed(2)}</p>
                      <p><span className="text-gray-600">Tax:</span> ${extractedData.tax?.toFixed(2)}</p>
                      <p><span className="text-gray-600">Total:</span> ${extractedData.total?.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {extractedData.items && extractedData.items.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Items</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left">Quantity</th>
                            <th className="px-4 py-2 text-left">Description</th>
                            <th className="px-4 py-2 text-right">Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {extractedData.items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2">{item.quantity}</td>
                              <td className="px-4 py-2">{item.description}</td>
                              <td className="px-4 py-2 text-right">${item.price.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PDFExtractor;