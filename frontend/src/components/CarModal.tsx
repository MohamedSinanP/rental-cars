import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import ImageCropperModal from './ImageCropperModal';
import { CarFormData } from '../types/types';
import { MapPicker } from './MapPicker';
import { DevTool } from "@hookform/devtools";
import { uploadToCloudinary } from '../utils/cloudinaryUploader';
import { toast } from 'react-toastify';
import { addCar, fetchLocationAddress } from '../services/apis/ownerApi';

interface CarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CarModal: React.FC<CarModalProps> = ({ isOpen, onClose }) => {
  const [selectedLocation, setSelectedLocation] = React.useState<{ lat: number, lng: number } | null>(null);
  const [carImages, setCarImages] = React.useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = React.useState<string[]>([]);
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
  const [cropModalOpen, setCropModalOpen] = React.useState(false);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CarFormData>();

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

      const carImageUrls = await Promise.all(
        carImages.map((file) => uploadToCloudinary(file))
      );

      if (carImageUrls.some((url) => url === null)) {
        toast.error("Some car images failed to upload.");
        return;
      }

      const formData = new FormData();

      // Append all text fields
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
      formData.append("availability", data.availability);
      formData.append("lastmaintenanceDate", data.maintenanceDate);
      formData.append("maintenanceInterval", data.maintenanceInterval.toString());
      formData.append("carImages", JSON.stringify(carImageUrls));
      console.log(data.seats, "this is seats");

      // Append features 
      data.features?.forEach((feature: string) => {
        formData.append("features", feature);
      });

      // Append documents 
      formData.append("rcDoc", data.rcDoc[0]);
      formData.append("pucDoc", data.pucDoc[0]);
      formData.append("insuranceDoc", data.insuranceDoc[0]);

      const result = await addCar(formData);

      reset();
      setCarImages([]);
      setPreviewUrls([]);
      setSelectedLocation(null);
      toast.success(result.message);
      onClose();
    } catch (error: any) {
      console.log(error);

      toast.error(error.message);
    }
    console.log('Submitted:', data);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files).slice(0, 5);
      setCarImages(fileArray);
      setValue('carImages', fileArray);
      const urls = fileArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);
    } else {
      setCarImages([]);
      setPreviewUrls([]);
    }
  };

  if (!isOpen) return null;

  const featuresList = ['GPS', 'AC', 'Bluetooth', 'Parking Sensors', 'Airbags'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Add New Car Page</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl font-bold cursor-pointer">&times;</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
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

          {/* === Seats Dropdown === */}
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
            <label>Upload Car Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full border p-2 rounded"
            />
            {previewUrls.length < 3 && <p className="text-red-500 text-sm">At least 3 image is required</p>}
            {previewUrls.length > 5 && <p className="text-red-500 text-sm">Max 5 images allowed</p>}
          </div>
          <div className="flex gap-2 mt-2 flex-wrap col-span-2">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative w-24 h-24 border rounded overflow-hidden">
                <img
                  src={url}
                  alt={`Preview ${index}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => {
                    setSelectedImage(carImages[index]);
                    setCropModalOpen(true);
                  }}
                />
              </div>
            ))}
          </div>
          <div className="col-span-2">
            <label>Pick Car Location on Map</label>
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
            <select {...register('availability', { required: 'Availability is required' })} className="w-full border p-2 rounded">
              <option value="">Select Availability</option>
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
            </select>
            {errors.availability && <p className="text-red-500 text-sm">{errors.availability.message}</p>}
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
            <input
              type="file"
              accept="application/pdf"
              {...register('rcDoc', {
                required: 'RC document is required',
                validate: {
                  isPDF: (file) => {
                    const fileName = file[0]?.name || '';
                    return fileName.toLowerCase().endsWith('.pdf') || 'Only PDF files are allowed';
                  },
                },
              })}
              className="w-full border p-2 rounded"
            />
            {errors.rcDoc && <p className="text-red-500 text-sm">{errors.rcDoc.message}</p>}
          </div>

          <div>
            <label>PUC Certificate</label>
            <input
              type="file"
              accept="application/pdf"
              {...register('pucDoc', {
                required: 'PUC certificate is required',
                validate: {
                  isPDF: (file) => {
                    const fileName = file[0]?.name || '';
                    return fileName.toLowerCase().endsWith('.pdf') || 'Only PDF files are allowed';
                  },
                },
              })}
              className="w-full border p-2 rounded"
            />
            {errors.pucDoc && <p className="text-red-500 text-sm">{errors.pucDoc.message}</p>}
          </div>

          <div>
            <label>Insurance Document</label>
            <input
              type="file"
              accept="application/pdf"
              {...register('insuranceDoc', {
                required: 'Insurance document is required',
                validate: {
                  isPDF: (file) => {
                    const fileName = file[0]?.name || '';
                    return fileName.toLowerCase().endsWith('.pdf') || 'Only PDF files are allowed';
                  },
                },
              })}
              className="w-full border p-2 rounded"
            />
            {errors.insuranceDoc && <p className="text-red-500 text-sm">{errors.insuranceDoc.message}</p>}
          </div>

          <div className="col-span-2 flex justify-center gap-6 mt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Save
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
            setValue('carImages', updatedImages);

            // Create new preview URL
            const newPreviewUrl = URL.createObjectURL(croppedFile);
            const updatedPreviewUrls = [...previewUrls];
            updatedPreviewUrls[index] = newPreviewUrl;
            setPreviewUrls(updatedPreviewUrls);

            setCropModalOpen(false);
            setSelectedImage(null);
          }}
        />
      )}
    </div>
  );
};

export default CarModal;
