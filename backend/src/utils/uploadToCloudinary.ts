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
    resource_type: "raw", // important for PDFs
    public_id: originalName, // use clean file name
    format: "pdf", // force .pdf
    use_filename: true,
    unique_filename: false, // keep exact name
    type: "upload",
    overwrite: true, // optional: replace if same name exists
  });

  // Browser viewable URL
  const rawUrl = result.secure_url;
  // const previewUrl = `https://docs.google.com/gview?url=${encodeURIComponent(rawUrl)}&embedded=true`;

  return rawUrl;
};
