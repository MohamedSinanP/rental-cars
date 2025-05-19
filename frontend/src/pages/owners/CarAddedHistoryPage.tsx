import React, { useEffect, useState } from 'react';
import Sidebar from '../../layouts/owners/Sidebar';
import { fetchAllOwnerCars } from '../../services/apis/ownerApi';
import { ICar } from '../../types/types';
import DataTable, { Column, Action } from '../../components/DataTable';
import ReuploadDocsModal from '../../components/ReuploadDocsModal';
import { toast } from 'react-toastify';

const CarAddedHistoryPage: React.FC = () => {
  const [carData, setCarData] = useState<ICar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<ICar | null>(null);

  useEffect(() => {
    fetchCarData();
  }, []);

  const fetchCarData = async () => {
    try {
      setLoading(true);
      const result = await fetchAllOwnerCars();
      setCarData(result.data.cars);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReuploadDocs = (car: ICar) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCar(null);
  };

  const handleSubmitDocuments = async (
    carId: string,
    documents: { rc: File, puc: File, insurance: File }
  ) => {
    try {
      // Create form data to send to the server
      const formData = new FormData();
      formData.append('carId', carId);
      formData.append('rcDocument', documents.rc);
      formData.append('pucDocument', documents.puc);
      formData.append('insuranceDocument', documents.insurance);

      // Replace with your actual API call
      // Example:
      // await reuploadCarDocuments(formData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      // Refresh car data after successful upload
      await fetchCarData();

      // Show success message (you can implement a toast notification here)
      alert('Documents uploaded successfully!');
    } catch (error) {
      console.error('Error uploading documents:', error);
      throw error; // This will be caught by the modal's error handler
    }
  };

  // Define columns for the DataTable
  const columns: Column<ICar>[] = [
    {
      key: 'image',
      header: 'Image',
      render: (car) => (
        <img
          src={car.carImages[0]}
          alt={car.carName}
          className="h-12 w-16 sm:h-16 sm:w-24 object-cover rounded"
        />
      ),
      className: 'w-20 sm:w-32'
    },
    {
      key: 'carName',
      header: 'Car Name',
      className: 'font-medium text-gray-800'
    },
    {
      key: 'isVerified',
      header: 'Status',
      render: (car) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full sm:px-3 ${car.isVerified
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
            }`}
        >
          {car.isVerified ? 'Verified' : 'Rejected'}
        </span>
      )
    },
    {
      key: 'rejectionReason',
      header: 'Rejection Reason',
      render: (car) => (
        <span className="hidden sm:inline">
          {car.rejectionReason || '—'}
        </span>
      ),
      className: 'text-gray-600 hidden sm:table-cell'
    }
  ];

  // Define actions for the DataTable
  const actions: Action<ICar>[] = [
    {
      label: 'Reupload',
      onClick: handleReuploadDocs,
      className: 'bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs sm:text-sm px-2 py-1 sm:px-3',
      isVisible: (car) => !car.isVerified // Only show for rejected cars
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header for when sidebar is closed */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4">
        <h1 className="text-lg font-semibold text-gray-800">Car Verification History</h1>
      </div>

      <div className="flex">
        <Sidebar />

        {/* Main content area with responsive padding */}
        <div className="flex-1 w-full">
          {/* Content wrapper with proper spacing */}
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Desktop header */}
            <h2 className="hidden lg:block text-2xl font-semibold mb-6 text-gray-800">
              Car Verification History
            </h2>

            {/* Mobile header */}
            <h2 className="block lg:hidden text-xl font-semibold mb-4 text-gray-800">
              History
            </h2>

            {error ? (
              <div className="bg-red-50 text-red-700 p-3 sm:p-4 rounded mb-4 sm:mb-6 text-sm sm:text-base">
                {error}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <DataTable
                  data={carData}
                  columns={columns}
                  actions={actions}
                  loading={loading}
                  emptyMessage="No cars found"
                  title=""
                />
              </div>
            )}

            {/* Document Reupload Modal */}
            <ReuploadDocsModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onSubmit={handleSubmitDocuments}
              car={selectedCar}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarAddedHistoryPage;