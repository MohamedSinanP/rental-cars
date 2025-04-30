import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';
import Tesseract from 'tesseract.js';
import axios from 'axios';
import pdfParse from 'pdf-parse';

export async function performOCR(fileBuffer: Buffer, fileUrl?: string): Promise<string> {
  try {
    const isPdf = fileUrl?.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      console.log('Processing PDF buffer, size:', fileBuffer.length);

      try {
        const result = await pdfParse(fileBuffer);

        if (result && result.text && result.text.trim().length > 0) {
          console.log('Successfully extracted text from PDF');
          return result.text;
        } else {
          console.log('PDF appears to be image-based or has no extractable text');
        }
      } catch (pdfError) {
        console.error('Error extracting text from PDF:', pdfError);
      }

      return "This PDF appears to be image-based and requires conversion to images for OCR. Please install additional dependencies or try a different approach.";
    } else {
      console.log('Processing image buffer, size:', fileBuffer.length);
      const { data: { text } } = await Tesseract.recognize(
        fileBuffer,
        'eng',
        { logger: m => console.log('Tesseract progress:', m) }
      );
      console.log('OCR text:', text);
      return text;
    }
  } catch (error: any) {
    console.error('Error in performOCR:', error.message, error.stack);
    return '';
  }
}
