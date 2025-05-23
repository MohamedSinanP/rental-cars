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
      const formData = new FormData();
      formData.append('carId', carId);
      formData.append('rcDocument', documents.rc);
      formData.append('pucDocument', documents.puc);
      formData.append('insuranceDocument', documents.insurance);

      // Replace with your actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      await fetchCarData();
      toast.success('Documents uploaded successfully!');
    } catch (error) {
      console.error('Error uploading documents:', error);
      throw error;
    }
  };

  // Define columns for the DataTable
  const columns: Column<ICar>[] = [
    {
      key: 'image',
      header: 'Image',
      render: (car) => (
        <div className="flex justify-center lg:justify-start">
          <img
            src={car.carImages[0]}
            alt={car.carName}
            className="h-10 w-14 sm:h-12 sm:w-16 lg:h-16 lg:w-20 xl:h-20 xl:w-24 object-cover rounded-lg shadow-sm"
          />
        </div>
      ),
      className: 'w-16 sm:w-20 lg:w-24 xl:w-28'
    },
    {
      key: 'carName',
      header: 'Car Name',
      render: (car) => (
        <div className="font-medium text-gray-900 text-sm sm:text-base">
          {car.carName}
        </div>
      ),
      className: 'min-w-0'
    },
    {
      key: 'isVerified',
      header: 'Status',
      render: (car) => (
        <span
          className={`inline-flex items-center px-2 py-1 sm:px-2.5 sm:py-1.5 text-xs font-medium rounded-full whitespace-nowrap ${car.isVerified
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-red-100 text-red-800 border border-red-200'
            }`}
        >
          {car.isVerified ? 'Verified' : 'Rejected'}
        </span>
      ),
      className: 'w-24 sm:w-28'
    },
    {
      key: 'rejectionReason',
      header: 'Rejection Reason',
      render: (car) => (
        <div className="text-gray-600 text-sm max-w-xs truncate" title={car.rejectionReason || ''}>
          {car.rejectionReason || '—'}
        </div>
      ),
      className: 'hidden md:table-cell max-w-xs'
    }
  ];

  // Define actions for the DataTable
  const actions: Action<ICar>[] = [
    {
      label: 'Reupload',
      onClick: handleReuploadDocs,
      className: 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5 font-medium transition-colors duration-200',
      isVisible: (car) => !car.isVerified
    }
  ];

  // Loading Component
  const LoadingContent = () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm">Loading your cars...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Sidebar - Always visible */}
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar />
      </div>

      {/* Main Content Area with left margin to account for fixed sidebar */}
      <div className="lg:ml-64 xl:ml-72">
        {/* Content Container */}
        <div className="h-full">
          {/* Mobile Header with proper spacing for menu button */}
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4 pl-16">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              Car Verification History
            </h1>
          </div>

          {/* Main Content */}
          <main className="p-4 sm:p-6 lg:p-8">
            {/* Page Header - Always visible */}
            <div className="mb-6 lg:mb-8">
              <h1 className="hidden lg:block text-2xl xl:text-3xl font-bold text-gray-900 mb-2">
                Car Verification History
              </h1>
              <p className="hidden lg:block text-gray-600">
                Track the status of your submitted cars and reupload documents if needed.
              </p>
            </div>

            {/* Content based on loading/error/data state */}
            {loading ? (
              <LoadingContent />
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <div className="text-sm sm:text-base">{error}</div>
                </div>
              </div>
            ) : (
              <>
                {/* Data Table Container */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <DataTable
                    data={carData}
                    columns={columns}
                    actions={actions}
                    loading={false} // Pass false since we handle loading state above
                    emptyMessage="No cars found. Add your first car to see it here."
                    title=""
                  />
                </div>

                {/* Stats Cards - Only show when data is loaded */}
                {carData.length > 0 && (
                  <div className="mt-6 lg:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {carData.length}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-1">Total Cars</div>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                      <div className="text-2xl sm:text-3xl font-bold text-green-600">
                        {carData.filter(car => car.isVerified).length}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-1">Verified</div>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                      <div className="text-2xl sm:text-3xl font-bold text-red-600">
                        {carData.filter(car => !car.isVerified).length}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-1">Rejected</div>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                      <div className="text-2xl sm:text-3xl font-bold text-teal-600">
                        {Math.round((carData.filter(car => car.isVerified).length / carData.length) * 100)}%
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-1">Success Rate</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Document Reupload Modal */}
      <ReuploadDocsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitDocuments}
        car={selectedCar}
      />
    </div>
  );
};

export default CarAddedHistoryPage;