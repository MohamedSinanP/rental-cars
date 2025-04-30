import { UploadedFile } from "express-fileupload";
import cloudinary from "../config/cloudinary";
import path from "path";

export const uploadPDFToCloudinary = async (
  file: UploadedFile,
  folder: string
): Promise<string> => {
  const originalName = path.basename(file.name, path.extname(file.name));

  const result = await cloudinary.uploader.upload(file.tempFilePath, {
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
