import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import ImageCropperModal from './ImageCropperModal';
import { CarFormData, ICar } from '../types/types';
import { MapPicker } from './MapPicker';
import { DevTool } from "@hookform/devtools";
import { uploadToCloudinary } from '../utils/cloudinaryUploader';
import { toast } from 'react-toastify';
import { updateCar, fetchLocationAddress } from '../services/apis/ownerApi';

interface EditCarModalProps {
  isOpen: boolean;
  onClose: () => void;
  carData: any;
  onCarUpdated?: (updatedCar: ICar) => void;
}

const EditCarModal: React.FC<EditCarModalProps> = ({ isOpen, onClose, carData, onCarUpdated }) => {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [carImages, setCarImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CarFormData>();

  useEffect(() => {
    if (isOpen && carData) {
      setValue('name', carData.carName);
      setValue('model', carData.carModel);
      setValue('type', carData.carType);
      setValue('seats', carData.seats);
      setValue('transmission', carData.transmission);
      setValue('fuelType', carData.fuelType);
      setValue('fuelOption', carData.fuelOption);
      setValue('pricePerDay', carData.pricePerDay);
      setValue('deposit', carData.deposit);
      setValue('status', carData.status);
      setValue('maintenanceDate', carData.lastmaintenanceDate?.split('T')[0]);
      setValue('maintenanceInterval', carData.maintenanceInterval);
      setValue('features', carData.features || []);

      // Set location if available
      if (carData.location?.coordinates) {
        const [lng, lat] = carData.location.coordinates;
        setSelectedLocation({ lat, lng });
        setValue('location', carData.location);
      }

      // Set existing images
      if (carData.carImages && Array.isArray(carData.carImages)) {
        setExistingImages(carData.carImages);
        setPreviewUrls(carData.carImages);
      }
    }
  }, [isOpen, carData, setValue]);

  useEffect(() => {
    register("location");
  }, [register]);

  const fetchAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      const result = await fetchLocationAddress(lat, lng);
      setValue('location', {
        type: "Point",
        coordinates: [lng, lat],
        address: result.address,
      });
    } catch (error: any) {
      console.error("Error fetching address:", error);
      toast.error(error.message);
    }
  };

  const onSubmit = async (data: CarFormData) => {
    try {
      // Upload new images if any
      let finalCarImages = [...existingImages];

      if (carImages.length > 0) {
        const newCarImageUrls = await Promise.all(
          carImages.map((file) => uploadToCloudinary(file))
        );

        if (newCarImageUrls.some((url) => url === null)) {
          toast.error("Some car images failed to upload.");
          return;
        }

        // Combine existing and new images
        finalCarImages = [...existingImages, ...newCarImageUrls.filter(url => url !== null) as string[]];
      }

      const formData = new FormData();

      // Append car ID for update
      formData.append("carId", carData._id);

      formData.append("carName", data.name);
      formData.append("carModel", data.model);
      formData.append("carType", data.type);
      formData.append("seats", data.seats);
      formData.append("transmission", data.transmission);
      formData.append("fuelType", data.fuelType);
      formData.append("fuelOption", data.fuelOption);
      formData.append("location", JSON.stringify(data.location));
      formData.append("pricePerDay", data.pricePerDay.toString());
      formData.append("deposit", data.deposit.toString());
      formData.append("status", data.status);
      formData.append("lastmaintenanceDate", data.maintenanceDate);
      formData.append("maintenanceInterval", data.maintenanceInterval.toString());
      formData.append("carImages", JSON.stringify(finalCarImages));

      data.features?.forEach((feature: string) => {
        formData.append("features", feature);
      });

      if (data.rcDoc && data.rcDoc[0]) {
        formData.append("rcDoc", data.rcDoc[0]);
      }

      if (data.pucDoc && data.pucDoc[0]) {
        formData.append("pucDoc", data.pucDoc[0]);
      }

      if (data.insuranceDoc && data.insuranceDoc[0]) {
        formData.append("insuranceDoc", data.insuranceDoc[0]);
      }

      const result = await updateCar(formData);
      console.log(result.data, "this is updated car");

      if (onCarUpdated) {
        onCarUpdated(result.data);
      }
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to update car");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setCarImages([...carImages, ...fileArray]);

      // Create preview URLs for new files
      const newUrls = fileArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newUrls]);
    }
  };

  const handleRemoveImage = (index: number) => {
    if (index < existingImages.length) {
      const updatedExistingImages = existingImages.filter((_, i) => i !== index);
      setExistingImages(updatedExistingImages);

      const updatedPreviewUrls = [...previewUrls];
      updatedPreviewUrls.splice(index, 1);
      setPreviewUrls(updatedPreviewUrls);
    } else {
      const newImgIndex = index - existingImages.length;

      const updatedCarImages = carImages.filter((_, i) => i !== newImgIndex);
      setCarImages(updatedCarImages);

      const updatedPreviewUrls = [...previewUrls];
      updatedPreviewUrls.splice(index, 1);
      setPreviewUrls(updatedPreviewUrls);
    }
  };

  const openPdfInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  const featuresList = ['GPS', 'AC', 'Bluetooth', 'Parking Sensors', 'Airbags'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Edit Car Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl font-bold cursor-pointer">&times;</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          {/* === Basic Inputs === */}
          <div>
            <label>Car Name</label>
            <input type="text" {...register('name', { required: 'Car name is required' })} className="w-full border p-2 rounded" />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div>
            <label>Model</label>
            <input type="text" {...register('model', { required: 'Model is required' })} className="w-full border p-2 rounded" />
            {errors.model && <p className="text-red-500 text-sm">{errors.model.message}</p>}
          </div>

          <div>
            <label>Car Type</label>
            <select {...register('type', { required: 'Type is required' })} className="w-full border p-2 rounded">
              <option value="">Select Type</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Luxury">Luxury</option>
              <option value="Pickup">Pickup</option>
              <option value="Van">Van</option>
            </select>
            {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
          </div>
          <div>
            <label>Seats</label>
            <select {...register('seats', { required: 'Seats is required' })} className="w-full border p-2 rounded">
              <option value="">Select Seats</option>
              {['4/5 Seater', '6/7 Seater'].map((seat) => (
                <option key={seat} value={seat}>{seat}</option>
              ))}
            </select>
            {errors.seats && <p className="text-red-500 text-sm">{errors.seats.message}</p>}
          </div>
          <div>
            <label>Transmission</label>
            <select {...register('transmission', { required: 'Transmission is required' })} className="w-full border p-2 rounded">
              <option value="">Select Transmission</option>
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
              <option value="CVT">CVT</option>
              <option value="AMT">AMT</option>
            </select>
            {errors.transmission && <p className="text-red-500 text-sm">{errors.transmission.message}</p>}
          </div>
          <div>
            <label>Fuel Type</label>
            <select {...register('fuelType', { required: 'Fuel type is required' })} className="w-full border p-2 rounded">
              <option value="">Select Fuel Type</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
            {errors.fuelType && <p className="text-red-500 text-sm">{errors.fuelType.message}</p>}
          </div>

          <div>
            <label>Fuel Option</label>
            <select {...register('fuelOption', { required: 'Fuel option is required' })} className="w-full border p-2 rounded">
              <option value="">Select Fuel Option</option>
              <option value="With Fuel">With Fuel</option>
              <option value="Without Fuel">Without Fuel</option>
            </select>
            {errors.fuelOption && <p className="text-red-500 text-sm">{errors.fuelOption.message}</p>}
          </div>
          <div className="col-span-2">
            <label>Car Images</label>
            <div className="mb-2">
              <p className="text-sm text-gray-600">Current Images: {previewUrls.length}</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="w-full border p-2 rounded"
              />
              {previewUrls.length < 3 && <p className="text-red-500 text-sm">At least 3 images are required</p>}
              {previewUrls.length > 5 && <p className="text-red-500 text-sm">Max 5 images allowed</p>}
            </div>
          </div>

          <div className="flex gap-2 mt-2 flex-wrap col-span-2">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative w-24 h-24 border rounded overflow-hidden">
                <img
                  src={url}
                  alt={`Preview ${index}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => {
                    if (index >= existingImages.length) {
                      const newImgIndex = index - existingImages.length;
                      setSelectedImage(carImages[newImgIndex]);
                      setCropModalOpen(true);
                    }
                  }}
                />
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-bl"
                  onClick={() => handleRemoveImage(index)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <div className="col-span-2">
            <label>Car Location on Map</label>
            <MapPicker
              selectedLocation={selectedLocation}
              onLocationSelect={(lat, lng) => {
                setSelectedLocation({ lat, lng });
                fetchAddressFromCoordinates(lat, lng);
              }}
            />
            {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
          </div>

          <div>
            <label>Car Price Per Hour</label>
            <input type="number" {...register('pricePerDay', { required: 'Price is required', valueAsNumber: true })} className="w-full border p-2 rounded" />
            {errors.pricePerDay && <p className="text-red-500 text-sm">{errors.pricePerDay.message}</p>}
          </div>

          <div>
            <label>Total Deposit Amount</label>
            <input type="number" {...register('deposit', { required: 'Deposit is required', valueAsNumber: true })} className="w-full border p-2 rounded" />
            {errors.deposit && <p className="text-red-500 text-sm">{errors.deposit.message}</p>}
          </div>

          <div>
            <label>Car Features</label>
            <div className="flex gap-2 flex-wrap">
              {featuresList.map((feature) => (
                <label key={feature} className="flex items-center gap-1">
                  <input type="checkbox" value={feature} {...register('features')} />
                  <span>{feature}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label>Availability Status</label>
            <select {...register('status', { required: 'Availability is required' })} className="w-full border p-2 rounded">
              <option value="">Select Availability</option>
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
            </select>
            {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
          </div>

          <div>
            <label>Last Maintenance Date</label>
            <input type="date" {...register('maintenanceDate', { required: 'Maintenance date is required' })} className="w-full border p-2 rounded" />
            {errors.maintenanceDate && <p className="text-red-500 text-sm">{errors.maintenanceDate.message}</p>}
          </div>

          <div>
            <label>Maintenance Interval (days)</label>
            <input type="number" {...register('maintenanceInterval', { required: 'Interval is required', valueAsNumber: true })} className="w-full border p-2 rounded" />
            {errors.maintenanceInterval && <p className="text-red-500 text-sm">{errors.maintenanceInterval.message}</p>}
          </div>

          {/* --- Document Uploads --- */}
          <div>
            <label>RC Document</label>
            <div className="flex flex-col">
              <input
                type="file"
                accept="application/pdf"
                {...register('rcDoc', {
                  validate: {
                    isPDF: (file) => {
                      if (!file || !file[0]) return true;
                      const fileName = file[0]?.name || '';
                      return fileName.toLowerCase().endsWith('.pdf') || 'Only PDF files are allowed';
                    },
                  },
                })}
                className="w-full border p-2 rounded"
              />
              {carData?.rcDoc && (
                <div className="mt-2 flex items-center">
                  <button
                    type="button"
                    onClick={() => openPdfInNewTab(carData.rcDoc)}
                    className="text-blue-500 hover:underline flex items-center text-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Current RC Document
                  </button>
                </div>
              )}
            </div>
            {errors.rcDoc && <p className="text-red-500 text-sm">{errors.rcDoc.message}</p>}
          </div>

          <div>
            <label>PUC Certificate</label>
            <div className="flex flex-col">
              <input
                type="file"
                accept="application/pdf"
                {...register('pucDoc', {
                  validate: {
                    isPDF: (file) => {
                      if (!file || !file[0]) return true;
                      const fileName = file[0]?.name || '';
                      return fileName.toLowerCase().endsWith('.pdf') || 'Only PDF files are allowed';
                    },
                  },
                })}
                className="w-full border p-2 rounded"
              />
              {carData?.pucDoc && (
                <div className="mt-2 flex items-center">
                  <button
                    type="button"
                    onClick={() => openPdfInNewTab(carData.pucDoc)}
                    className="text-blue-500 hover:underline flex items-center text-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Current PUC Document
                  </button>
                </div>
              )}
            </div>
            {errors.pucDoc && <p className="text-red-500 text-sm">{errors.pucDoc.message}</p>}
          </div>

          <div>
            <label>Insurance Document</label>
            <div className="flex flex-col">
              <input
                type="file"
                accept="application/pdf"
                {...register('insuranceDoc', {
                  validate: {
                    isPDF: (file) => {
                      if (!file || !file[0]) return true;
                      const fileName = file[0]?.name || '';
                      return fileName.toLowerCase().endsWith('.pdf') || 'Only PDF files are allowed';
                    },
                  },
                })}
                className="w-full border p-2 rounded"
              />
              {carData?.insuranceDoc && (
                <div className="mt-2 flex items-center">
                  <button
                    type="button"
                    onClick={() => openPdfInNewTab(carData.insuranceDoc)}
                    className="text-blue-500 hover:underline flex items-center text-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Current Insurance Document
                  </button>
                </div>
              )}
            </div>
            {errors.insuranceDoc && <p className="text-red-500 text-sm">{errors.insuranceDoc.message}</p>}
          </div>

          <div className="col-span-2 flex justify-center gap-6 mt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Update Car
            </button>
          </div>
        </form>
        <DevTool control={control} />
      </div>

      {/* === Crop Modal === */}
      {cropModalOpen && selectedImage && (
        <ImageCropperModal
          image={selectedImage}
          onClose={() => {
            setCropModalOpen(false);
            setSelectedImage(null);
          }}
          onCropComplete={async (croppedBlob: Blob) => {
            if (!selectedImage) return;

            const index = carImages.findIndex((img) => img === selectedImage);
            if (index === -1) return;

            const croppedFile = new File([croppedBlob], selectedImage.name, { type: selectedImage.type });

            const updatedImages = [...carImages];
            updatedImages[index] = croppedFile;
            setCarImages(updatedImages);

            // Calculate the correct preview URL index
            const previewIndex = index + existingImages.length;

            // Create new preview URL
            const newPreviewUrl = URL.createObjectURL(croppedFile);
            const updatedPreviewUrls = [...previewUrls];
            updatedPreviewUrls[previewIndex] = newPreviewUrl;
            setPreviewUrls(updatedPreviewUrls);

            setCropModalOpen(false);
            setSelectedImage(null);
          }}
        />
      )}
    </div>
  );
};

export default EditCarModal;