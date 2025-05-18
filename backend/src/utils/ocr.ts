import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';
import Tesseract from 'tesseract.js';
import pdfParse from 'pdf-parse';
import pdf2pic from 'pdf2pic';
import sharp from 'sharp';

export async function performOCR(fileBuffer: Buffer, fileUrl?: string): Promise<string> {
  try {
    const isPdf = fileUrl?.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      console.log('Processing PDF buffer, size:', fileBuffer.length);

      // First, try to extract text directly from PDF
      try {
        const result = await pdfParse(fileBuffer);

        if (result && result.text && result.text.trim().length > 0) {
          console.log('Successfully extracted text from PDF');
          return result.text;
        } else {
          console.log('PDF appears to be image-based, converting to images for OCR...');
        }
      } catch (pdfError) {
        console.error('Error extracting text from PDF:', pdfError);
        console.log('Attempting image-based OCR...');
      }

      // If direct text extraction fails, convert PDF to images and perform OCR
      try {
        const extractedText = await performPDFImageOCR(fileBuffer);
        return extractedText;
      } catch (imageOcrError) {
        console.error('Error performing image-based OCR on PDF:', imageOcrError);
        return "Unable to extract text from this PDF. It may be corrupted or in an unsupported format.";
      }
    } else {
      // Handle regular images
      console.log('Processing image buffer, size:', fileBuffer.length);
      const { data: { text } } = await Tesseract.recognize(
        fileBuffer,
        'eng',
        {
          logger: m => console.log('Tesseract progress:', m)
        }
      );
      console.log('OCR completed for image');
      return text;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error in performOCR:', errorMessage, errorStack);
    return `Error processing file: ${errorMessage}`;
  }
}

async function performPDFImageOCR(pdfBuffer: Buffer): Promise<string> {
  const tempDir = os.tmpdir();
  const tempPdfPath = path.join(tempDir, `temp_${uuidv4()}.pdf`);

  try {
    // Write PDF buffer to temporary file
    fs.writeFileSync(tempPdfPath, pdfBuffer);

    // Configure pdf2pic
    const convert = pdf2pic.fromPath(tempPdfPath, {
      density: 200,           // Higher density for better OCR accuracy
      saveFilename: "page",
      savePath: tempDir,
      format: "png",
      width: 2000,           // High resolution for better OCR
      height: 2000
    });

    let allText = '';
    let pageNumber = 1;

    // Convert PDF pages to images and perform OCR
    while (true) {
      try {
        console.log(`Converting PDF page ${pageNumber} to image...`);
        const result = await convert(pageNumber);

        if (!result || !result.path) break;

        // Read the generated image
        const imagePath = result.path;
        const imageBuffer = fs.readFileSync(imagePath);

        // Enhance image for better OCR results
        const enhancedBuffer = await sharp(imageBuffer)
          .grayscale()
          .normalize()
          .sharpen()
          .toBuffer();

        // Perform OCR on the image
        console.log(`Performing OCR on page ${pageNumber}...`);
        const { data: { text } } = await Tesseract.recognize(
          enhancedBuffer,
          'eng',
          {
            logger: m => console.log(`Page ${pageNumber} OCR:`, m)
          }
        );

        allText += `\n--- Page ${pageNumber} ---\n${text}\n`;

        // Clean up the temporary image file
        fs.unlinkSync(imagePath);
        pageNumber++;

      } catch (pageError: unknown) {
        const errorMessage = pageError instanceof Error ? pageError.message : 'Unknown error';
        console.log(`No more pages or error on page ${pageNumber}:`, errorMessage);
        break;
      }
    }

    return allText.trim();

  } finally {
    // Clean up temporary PDF file
    if (fs.existsSync(tempPdfPath)) {
      fs.unlinkSync(tempPdfPath);
    }
  }
}

// Alternative approach with more granular OCR control
async function performAdvancedOCR(imageBuffer: Buffer): Promise<string> {
  try {
    const worker = await Tesseract.createWorker('eng');

    // Set OCR parameters for better accuracy
    await worker.setParameters({
      tessedit_pageseg_mode: Tesseract.PSM.AUTO, // Automatic page segmentation
      tessedit_ocr_engine_mode: Tesseract.OEM.TESSERACT_LSTM_COMBINED, // LSTM neural nets
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz :.-/',
    });

    const { data: { text } } = await worker.recognize(imageBuffer);
    await worker.terminate();

    return text;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in advanced OCR:', errorMessage);
    throw error;
  }
}

// Enhanced PDF processing with better error handling
async function performEnhancedPDFImageOCR(pdfBuffer: Buffer): Promise<string> {
  const tempDir = os.tmpdir();
  const tempPdfPath = path.join(tempDir, `temp_${uuidv4()}.pdf`);

  try {
    // Write PDF buffer to temporary file
    fs.writeFileSync(tempPdfPath, pdfBuffer);

    // Configure pdf2pic with better settings
    const convert = pdf2pic.fromPath(tempPdfPath, {
      density: 300,           // Even higher density
      saveFilename: "page",
      savePath: tempDir,
      format: "png",
      width: 3000,           // Very high resolution
      height: 3000
    });

    let allText = '';
    let pageNumber = 1;

    // Convert PDF pages to images and perform OCR
    while (true) {
      try {
        console.log(`Converting PDF page ${pageNumber} to image...`);
        const result = await convert(pageNumber);

        if (!result || !result.path) break;

        // Read and enhance the generated image
        const imagePath = result.path;
        const imageBuffer = fs.readFileSync(imagePath);

        // More aggressive image enhancement
        const enhancedBuffer = await sharp(imageBuffer)
          .resize(3000, 3000, { fit: 'inside', withoutEnlargement: true })
          .grayscale()
          .normalize()
          .sharpen({ sigma: 1, m1: 0.5, m2: 2 })
          .threshold(128)
          .toBuffer();

        // Perform advanced OCR
        console.log(`Performing advanced OCR on page ${pageNumber}...`);
        const text = await performAdvancedOCR(enhancedBuffer);

        allText += `\n--- Page ${pageNumber} ---\n${text}\n`;

        // Clean up the temporary image file
        fs.unlinkSync(imagePath);
        pageNumber++;

      } catch (pageError: unknown) {
        const errorMessage = pageError instanceof Error ? pageError.message : 'Unknown error';
        console.log(`No more pages or error on page ${pageNumber}:`, errorMessage);
        break;
      }
    }

    return allText.trim();

  } finally {
    // Clean up temporary PDF file
    if (fs.existsSync(tempPdfPath)) {
      fs.unlinkSync(tempPdfPath);
    }
  }
}

// Usage example
export async function extractVehicleInfo(fileBuffer: Buffer, fileUrl?: string) {
  try {
    const extractedText = await performOCR(fileBuffer, fileUrl);

    // Parse the extracted text to find vehicle information
    const vehicleInfo = parseVehicleInfo(extractedText);

    return {
      success: true,
      rawText: extractedText,
      parsedInfo: vehicleInfo
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
      rawText: '',
      parsedInfo: null
    };
  }
}

function parseVehicleInfo(text: string) {
  const info: Record<string, string> = {};

  // Registration Certificate patterns
  const rcPatterns = {
    ownerName: /Owner Name:\s*([^\n]+)/i,
    carModel: /Car Model:\s*([^\n]+)/i,
    registrationNo: /Registration No:\s*([^\n]+)/i,
    carColor: /Car Color:\s*([^\n]+)/i,
    engineNo: /Engine No:\s*([^\n]+)/i,
    chassisNo: /Chassis No:\s*([^\n]+)/i,
    fuelType: /Fuel Type:\s*([^\n]+)/i,
    rcIssueDate: /RC Issue Date:\s*([^\n]+)/i
  };

  // Insurance Certificate patterns
  const insurancePatterns = {
    insurer: /Insurer:\s*([^\n]+)/i,
    policyNo: /Policy No:\s*([^\n]+)/i,
    insuranceValidTill: /Insurance Valid Till:\s*([^\n]+)/i,
    coverage: /Coverage:\s*([^\n]+)/i,
    issuedDate: /Issued Date:\s*([^\n]+)/i
  };

  // Extract RC information
  for (const [key, pattern] of Object.entries(rcPatterns)) {
    const match = text.match(pattern);
    if (match && match[1]) {
      info[key] = match[1].trim();
    }
  }

  // Extract Insurance information
  for (const [key, pattern] of Object.entries(insurancePatterns)) {
    const match = text.match(pattern);
    if (match && match[1]) {
      info[key] = match[1].trim();
    }
  }

  return info;
}

// Enhanced parsing with multiple patterns for each field
export function parseVehicleInfoAdvanced(text: string) {
  const info: Record<string, string> = {};

  // Multiple patterns for each field to handle different formats
  const fieldPatterns = {
    ownerName: [
      /Owner Name:\s*([^\n]+)/i,
      /Name of Owner:\s*([^\n]+)/i,
      /Owner:\s*([^\n]+)/i,
      /Registered Owner:\s*([^\n]+)/i
    ],
    registrationNo: [
      /Registration No:\s*([^\n]+)/i,
      /Reg\.?\s*No\.?:\s*([^\n]+)/i,
      /Registration Number:\s*([^\n]+)/i,
      /Vehicle No:\s*([^\n]+)/i
    ],
    vehicleModel: [
      /Car Model:\s*([^\n]+)/i,
      /Vehicle Model:\s*([^\n]+)/i,
      /Model:\s*([^\n]+)/i,
      /Make & Model:\s*([^\n]+)/i
    ],
    engineNo: [
      /Engine No:\s*([^\n]+)/i,
      /Engine Number:\s*([^\n]+)/i,
      /Eng\.?\s*No\.?:\s*([^\n]+)/i
    ],
    chassisNo: [
      /Chassis No:\s*([^\n]+)/i,
      /Chassis Number:\s*([^\n]+)/i,
      /VIN:\s*([^\n]+)/i
    ]
  };

  for (const [fieldName, patterns] of Object.entries(fieldPatterns)) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        info[fieldName] = match[1].trim();
        break; // Stop after first match
      }
    }
  }

  return info;
}