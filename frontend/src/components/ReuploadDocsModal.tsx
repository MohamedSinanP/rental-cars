import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ICar } from '../types/types';
import { reuploadCarDocs } from '../services/apis/ownerApi';
import { toast } from 'react-toastify';

interface FormInputs {
  rcDocument: FileList;
  pucDocument: FileList;
  insuranceDocument: FileList;
}

interface ReuploadDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (carId: string, documents: { rc: File, puc: File, insurance: File }) => Promise<void>;
  car: ICar | null;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

const ReuploadDocsModal: React.FC<ReuploadDocsModalProps> = ({ isOpen, onClose, car }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<FormInputs>();

  // Watch files for preview
  const watchedFiles = {
    rc: watch('rcDocument')?.[0],
    puc: watch('pucDocument')?.[0],
    insurance: watch('insuranceDocument')?.[0],
  };

  if (!isOpen || !car) return null;

  const validateFileType = (files: FileList) => {
    if (files.length === 0) return "Please select a file";
    const file = files[0];
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return "Only PDF, JPEG, JPG and PNG files are allowed";
    }
    return true;
  };

  const validateFileSize = (files: FileList) => {
    if (files.length === 0) return "Please select a file";
    const file = files[0];
    if (file.size > MAX_FILE_SIZE) {
      return "File size should be less than 5MB";
    }
    return true;
  };

  const processSubmit = async (data: FormInputs) => {
    try {
      setIsSubmitting(true);
      setGeneralError('');

      const formData = new FormData();
      formData.append("rcDoc", data.rcDocument[0]);
      formData.append("pucDoc", data.pucDocument[0]);
      formData.append("insuranceDoc", data.insuranceDocument[0]);

      const result = await reuploadCarDocs(car._id, formData);
      toast.success(result.message);
      reset();
      onClose();
    } catch (err) {
      console.error('Error uploading documents:', err);
      setGeneralError('Failed to upload documents. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Reupload Documents for {car.carName}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {generalError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit(processSubmit)}>
            <div className="space-y-4">
              {/* RC Document Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RC Document*
                </label>
                <input
                  type="file"
                  {...register('rcDocument', {
                    required: "RC document is required",
                    validate: {
                      acceptedTypes: validateFileType,
                      fileSize: validateFileSize
                    }
                  })}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
                  file:rounded-md file:border-0 file:text-sm file:font-semibold 
                  file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                {watchedFiles.rc && (
                  <p className="mt-1 text-sm text-green-600">
                    Selected: {watchedFiles.rc.name}
                  </p>
                )}
                {errors.rcDocument && (
                  <p className="mt-1 text-sm text-red-600">{errors.rcDocument.message}</p>
                )}
              </div>

              {/* PUC Document Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PUC Document*
                </label>
                <input
                  type="file"
                  {...register('pucDocument', {
                    required: "PUC document is required",
                    validate: {
                      acceptedTypes: validateFileType,
                      fileSize: validateFileSize
                    }
                  })}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
                  file:rounded-md file:border-0 file:text-sm file:font-semibold 
                  file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                {watchedFiles.puc && (
                  <p className="mt-1 text-sm text-green-600">
                    Selected: {watchedFiles.puc.name}
                  </p>
                )}
                {errors.pucDocument && (
                  <p className="mt-1 text-sm text-red-600">{errors.pucDocument.message}</p>
                )}
              </div>

              {/* Insurance Document Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance Document*
                </label>
                <input
                  type="file"
                  {...register('insuranceDocument', {
                    required: "Insurance document is required",
                    validate: {
                      acceptedTypes: validateFileType,
                      fileSize: validateFileSize
                    }
                  })}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
                  file:rounded-md file:border-0 file:text-sm file:font-semibold 
                  file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                {watchedFiles.insurance && (
                  <p className="mt-1 text-sm text-green-600">
                    Selected: {watchedFiles.insurance.name}
                  </p>
                )}
                {errors.insuranceDocument && (
                  <p className="mt-1 text-sm text-red-600">{errors.insuranceDocument.message}</p>
                )}
              </div>

              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-4">
                  *Required. Accepted formats: PDF, JPEG, PNG. Maximum size: 5MB.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Uploading...' : 'Upload Documents'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReuploadDocsModal;