"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.performOCR = performOCR;
const tesseract_js_1 = __importDefault(require("tesseract.js"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
function performOCR(fileBuffer, fileUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const isPdf = fileUrl === null || fileUrl === void 0 ? void 0 : fileUrl.toLowerCase().endsWith('.pdf');
            if (isPdf) {
                console.log('Processing PDF buffer, size:', fileBuffer.length);
                try {
                    const result = yield (0, pdf_parse_1.default)(fileBuffer);
                    if (result && result.text && result.text.trim().length > 0) {
                        console.log('Successfully extracted text from PDF');
                        return result.text;
                    }
                    else {
                        console.log('PDF appears to be image-based or has no extractable text');
                    }
                }
                catch (pdfError) {
                    console.error('Error extracting text from PDF:', pdfError);
                }
                return "This PDF appears to be image-based and requires conversion to images for OCR. Please install additional dependencies or try a different approach.";
            }
            else {
                console.log('Processing image buffer, size:', fileBuffer.length);
                const { data: { text } } = yield tesseract_js_1.default.recognize(fileBuffer, 'eng', { logger: m => console.log('Tesseract progress:', m) });
                console.log('OCR text:', text);
                return text;
            }
        }
        catch (error) {
            console.error('Error in performOCR:', error.message, error.stack);
            return '';
        }
    });
}
