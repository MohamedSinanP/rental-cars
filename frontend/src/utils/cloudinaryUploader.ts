export const uploadToCloudinary = async (file: File): Promise<string | null> => {
  const cloudName = import.meta.env.VITE_CLOUD_NAME;
  console.log(cloudName, 'this is cloud name');

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "car_images");
  formData.append("folder", "cars/images");
  formData.append("cloud_name", cloudName);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return data.secure_url || null;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  }
};
