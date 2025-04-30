"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.performOCR = performOCR;
exports._performOCRFromUrl = _performOCRFromUrl;
const pdf_lib_1 = require("pdf-lib");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const uuid_1 = require("uuid");
const tesseract_js_1 = __importDefault(require("tesseract.js"));
const axios_1 = __importDefault(require("axios"));
const pdf2img = require("pdf-img-convert");
async function convertPdfToImages(pdfBuffer, maxPages = 1) {
    const tempDir = path.join(os.tmpdir(), `pdf-${(0, uuid_1.v4)()}`);
    try {
        fs.mkdirSync(tempDir, { recursive: true });
        console.log('Temp directory created:', tempDir);
    }
    catch (error) {
        console.error('Error creating temp directory:', error.message);
        return [];
    }
    const imagePaths = [];
    try {
        // Determine the number of pages in the PDF
        const pdfDoc = await pdf_lib_1.PDFDocument.load(pdfBuffer);
        const totalPages = pdfDoc.getPageCount();
        console.log('Total PDF pages:', totalPages);
        // Limit to maxPages or total pages
        const pagesToProcess = Math.min(totalPages, maxPages);
        // Convert PDF to images using pdf-img-convert
        const imageBuffers = await pdf2img.convert(pdfBuffer, {
            width: 1200,
            height: 1600,
            page_numbers: Array.from({ length: pagesToProcess }, (_, i) => i + 1),
        });
        for (let page = 1; page <= pagesToProcess; page++) {
            try {
                const imageBuffer = imageBuffers[page - 1];
                if (imageBuffer) {
                    const imgPath = path.join(tempDir, `page.${page}.png`);
                    fs.writeFileSync(imgPath, imageBuffer);
                    imagePaths.push(imgPath);
                    console.log('Generated image for page', page, ':', imgPath);
                }
                else {
                    console.warn('No image generated for page', page);
                }
            }
            catch (error) {
                console.error('Error processing page', page, ':', error.message);
            }
        }
    }
    catch (error) {
        console.error('Error processing PDF:', error.message);
    }
    return imagePaths;
}
async function performOCR(fileBuffer, fileUrl) {
    try {
        const isPdf = fileUrl?.toLowerCase().endsWith('.pdf');
        console.log('Is PDF:', isPdf, 'File URL:', fileUrl);
        if (isPdf) {
            console.log('Processing PDF buffer, size:', fileBuffer.length);
            const imagePaths = await convertPdfToImages(fileBuffer, 1); // Process 1 page
            console.log('Generated image paths:', imagePaths);
            if (!imagePaths.length) {
                console.error('No images generated. Check PDF validity or rendering issues.');
                return '';
            }
            let fullText = '';
            for (const imgPath of imagePaths) {
                try {
                    const { data: { text } } = await tesseract_js_1.default.recognize(imgPath, 'eng', { logger: m => console.log('Tesseract progress:', m) });
                    console.log('OCR text for', imgPath, ':', text);
                    fullText += text + '\n\n';
                    fs.unlinkSync(imgPath);
                }
                catch (error) {
                    console.error('Error performing OCR on', imgPath, ':', error.message);
                }
            }
            if (imagePaths.length) {
                const tempDir = path.dirname(imagePaths[0]);
                fs.rmSync(tempDir, { recursive: true, force: true });
                console.log('Cleaned up temp directory:', tempDir);
            }
            return fullText;
        }
        else {
            console.log('Processing image buffer, size:', fileBuffer.length);
            const { data: { text } } = await tesseract_js_1.default.recognize(fileBuffer, 'eng', { logger: m => console.log('Tesseract progress:', m) });
            console.log('OCR text:', text);
            return text;
        }
    }
    catch (error) {
        console.error('Error in performOCR:', error.message, error.stack);
        return '';
    }
}
async function _performOCRFromUrl(url) {
    try {
        console.log('Fetching URL:', url);
        const response = await axios_1.default.get(url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);
        console.log('Fetched buffer size:', buffer.length);
        return performOCR(buffer, url);
    }
    catch (error) {
        console.error('Error fetching or processing image:', error.message, error.stack);
        return '';
    }
}
//# sourceMappingURL=ocr.js.map