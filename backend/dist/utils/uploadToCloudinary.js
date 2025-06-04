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
exports.uploadPDFToCloudinary = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const path_1 = __importDefault(require("path"));
const uploadPDFToCloudinary = (file, folder) => __awaiter(void 0, void 0, void 0, function* () {
    const originalName = path_1.default.basename(file.name, path_1.default.extname(file.name));
    const result = yield cloudinary_1.default.uploader.upload(file.tempFilePath, {
        folder,
        resource_type: "raw",
        public_id: originalName,
        format: "pdf",
        use_filename: true,
        unique_filename: false,
        type: "upload",
        overwrite: true,
    });
    const rawUrl = result.secure_url;
    return rawUrl;
});
exports.uploadPDFToCloudinary = uploadPDFToCloudinary;
