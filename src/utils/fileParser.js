/**
 * fileParser.js — Client-side file parsing for Portfolio intake.
 *
 * D.R.A.F.T. protocol: NEW file. No existing code modified.
 *
 * Supports: PDF (.pdf), DOCX (.docx), TXT (.txt)
 * All processing is client-side — no server upload needed.
 * Dependencies (pdfjs-dist, mammoth) are dynamically imported
 * so they add ZERO bytes to the initial page load.
 */

/** Max file size in bytes (10 MB) */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Supported MIME types → friendly labels */
export const SUPPORTED_TYPES = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'text/plain': 'TXT',
};

/** File extensions we accept (for the input accept attribute) */
export const ACCEPT_STRING = '.pdf,.docx,.txt';

/**
 * Parse a file and extract plain text content.
 *
 * @param {File} file — File object from <input type="file"> or drop event
 * @returns {Promise<{ text: string, fileName: string, fileType: string, charCount: number }>}
 * @throws {Error} if file type unsupported, too large, or parsing fails
 */
export async function parseFile(file) {
  if (!file) throw new Error('No file provided');

  // Size check
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`File is too large (${sizeMB} MB). Maximum is 10 MB.`);
  }

  // Type check — first try extension/MIME, then fall back to content sniffing
  const ext = file.name.split('.').pop()?.toLowerCase();
  const mimeType = file.type;
  // If filename has no dot, ext equals the full filename — treat as no extension
  const hasExtension = file.name.includes('.');

  let parser;
  if (ext === 'pdf' || mimeType === 'application/pdf') {
    parser = parsePDF;
  } else if (ext === 'docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    parser = parseDOCX;
  } else if (ext === 'txt' || mimeType === 'text/plain') {
    parser = parseTXT;
  } else {
    // Content sniffing fallback for extensionless files (e.g. "Capstone" instead of "Capstone.docx")
    const detected = await sniffFileType(file);
    if (detected) {
      parser = detected;
    } else {
      throw new Error(
        hasExtension
          ? `Unsupported file type: .${ext}. Please upload a PDF, DOCX, or TXT file.`
          : `Could not determine file type for "${file.name}". Try renaming it with an extension (e.g. ${file.name}.docx or ${file.name}.pdf).`
      );
    }
  }

  const text = await parser(file);
  const cleaned = text.trim();

  if (!cleaned) {
    throw new Error('No text content could be extracted from this file. It may be a scanned image or empty document.');
  }

  return {
    text: cleaned,
    fileName: file.name,
    fileType: ext?.toUpperCase() || 'UNKNOWN',
    charCount: cleaned.length,
  };
}

/**
 * Content-sniff a file by reading its first 4 bytes (magic number).
 * DOCX files are ZIP archives (magic bytes: PK\x03\x04).
 * PDF files start with %PDF.
 * Returns the appropriate parser function, or null if unrecognized.
 */
async function sniffFileType(file) {
  try {
    const header = new Uint8Array(await file.slice(0, 4).arrayBuffer());
    // ZIP archive (PK\x03\x04) → likely DOCX
    if (header[0] === 0x50 && header[1] === 0x4B && header[2] === 0x03 && header[3] === 0x04) {
      return parseDOCX;
    }
    // PDF (%PDF)
    if (header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46) {
      return parsePDF;
    }
  } catch {
    // If we can't read the header, fall through to error
  }
  return null;
}

/**
 * Parse a PDF file using pdfjs-dist (dynamically imported).
 * Extracts text from all pages, concatenated with newlines.
 */
async function parsePDF(file) {
  try {
    const pdfjsLib = await import('pdfjs-dist');

    // Configure worker — use unpkg (mirrors npm directly) to avoid Vite bundling issues
    // Note: cdnjs often lags behind npm releases; unpkg always has the exact version
    const version = pdfjsLib.version;
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const pages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map(item => item.str)
        .join(' ');
      if (pageText.trim()) pages.push(pageText.trim());
    }

    return pages.join('\n\n');
  } catch (err) {
    console.error('PDF parsing error:', err);
    throw new Error(`Could not read PDF: ${err.message}`);
  }
}

/**
 * Parse a DOCX file using mammoth (dynamically imported).
 * Extracts raw text (no HTML formatting needed).
 */
async function parseDOCX(file) {
  try {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    if (result.messages?.length) {
      console.warn('DOCX parsing warnings:', result.messages);
    }

    return result.value || '';
  } catch (err) {
    console.error('DOCX parsing error:', err);
    throw new Error(`Could not read DOCX: ${err.message}`);
  }
}

/**
 * Parse a TXT file using native FileReader API.
 */
async function parseTXT(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || '');
    reader.onerror = () => reject(new Error('Could not read text file'));
    reader.readAsText(file);
  });
}
