import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker explicitly for Vite/Browser environments
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export const extractTextFromPDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Limit to first 10 pages to avoid performance issues and token limits
    const numPages = Math.min(pdf.numPages, 10);
    
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error("PDF Extraction Error:", error);
    throw new Error("Failed to extract text from the PDF file. Please ensure it is a valid PDF.");
  }
};
