import cloudinary from "../config/cloudinary";

export const uploadToCloudinary = async (
  filePath: string,
  folder: string
): Promise<string> => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: "auto",
  });
  return result.secure_url;
};
