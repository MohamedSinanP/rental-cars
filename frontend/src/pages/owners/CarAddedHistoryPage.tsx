import React, { useEffect, useState } from 'react';
import Sidebar from '../../layouts/owners/Sidebar';
import { fetchAllOwnerCars } from '../../services/apis/ownerApi';
import { ICar } from '../../types/types';
import DataTable, { Column, Action } from '../../components/DataTable';
import ReuploadDocsModal from '../../components/ReuploadDocsModal';

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
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch car data');
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
          className="h-16 w-24 object-cover rounded"
        />
      ),
      className: 'w-32'
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
          className={`px-3 py-1 text-xs font-semibold rounded-full ${car.isVerified
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
      render: (car) => car.rejectionReason || '—',
      className: 'text-gray-600'
    }
  ];

  // Define actions for the DataTable
  const actions: Action<ICar>[] = [
    {
      label: 'Reupload Docs',
      onClick: handleReuploadDocs,
      className: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
      isVisible: (car) => !car.isVerified // Only show for rejected cars
    }
  ];

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h2 className="text-2xl font-semibold mb-6">Car Verification History</h2>

        {error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        ) : (
          <DataTable
            data={carData}
            columns={columns}
            actions={actions}
            loading={loading}
            emptyMessage="No cars found"
            title="Car Verification History"
          />
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
  );
};

export default CarAddedHistoryPage;