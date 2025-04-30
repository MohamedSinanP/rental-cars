"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPDFToCloudinary = void 0;
const cloudinary_js_1 = __importDefault(require("../config/cloudinary.js"));
const path_1 = __importDefault(require("path"));
const uploadPDFToCloudinary = async (file, folder) => {
    const originalName = path_1.default.basename(file.name, path_1.default.extname(file.name));
    const result = await cloudinary_js_1.default.uploader.upload(file.tempFilePath, {
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
};
exports.uploadPDFToCloudinary = uploadPDFToCloudinary;
//# sourceMappingURL=uploadToCloudinary.js.map