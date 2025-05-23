import React, { useState, useEffect, useCallback } from 'react';
import { Edit, Trash2, Plus, RefreshCw, Car as CarIcon } from 'lucide-react';
import Sidebar from '../../layouts/owners/Sidebar';
import CarModal from '../../components/CarModal';
import { toast } from 'react-toastify';
import { getCars, toggleListing } from '../../services/apis/ownerApi';
import { ICar } from '../../types/types';
import EditCarModal from '../../components/EditCarModal';
import { formatINR } from '../../utils/commonUtilities';
import Pagination from '../../components/Pagination';
import DocumentSearch from '../../components/DocumentSearch';

const CarListItem: React.FC<{
  car: ICar;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ car, isSelected, onSelect }) => (
  <div
    onClick={onSelect}
    className={`flex items-center gap-3 p-3 sm:p-4 rounded-lg cursor-pointer transition-all duration-200 border ${isSelected
      ? 'bg-blue-50 border-blue-200 shadow-sm'
      : 'hover:bg-gray-50 border-gray-200 hover:border-gray-300'
      }`}
  >
    <img
      src={car.carImages[0] || '/car-thumb.png'}
      alt={car.carName}
      className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover border border-gray-200 flex-shrink-0"
    />
    <div className="min-w-0 flex-1">
      <h4 className="text-sm sm:text-base font-medium text-gray-900 truncate">
        {car.carName} {car.carModel}
      </h4>
      <p className="text-xs sm:text-sm text-gray-600 mt-1">
        {formatINR(car.pricePerHour)}/Hour
      </p>
    </div>
    {isSelected && (
      <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
    )}
  </div>
);

const Cars: React.FC = () => {
  const [cars, setCars] = useState<ICar[]>([]);
  const [selectedCar, setSelectedCar] = useState<ICar | null>(null);
  const [addCarModalOpen, setAddCarModalOpen] = useState<boolean>(false);
  const [editCarModalOpen, setEditCarModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileCarList, setShowMobileCarList] = useState(true);
  const limit = 4;

  const fetchCars = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getCars(currentPage, limit);
      const fetchedCars = Array.isArray(result.data.data) ? result.data.data : [];

      setCars(fetchedCars);
      setCurrentPage(result.data.currentPage);
      setTotalPages(result.data.totalPages);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        toast.error(error.message);
      } else {
        setError('Failed to fetch cars. Please try again.');
        toast.error('Failed to fetch cars. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, refreshTrigger]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // Update selected car when cars list changes
  useEffect(() => {
    if (selectedCar && cars.length > 0) {
      const updatedSelectedCar = cars.find(car => car.id === selectedCar.id);
      if (updatedSelectedCar) {
        setSelectedCar(updatedSelectedCar);
      }
    }
  }, [cars, selectedCar]);

  // Auto-select first car on mobile when cars load
  useEffect(() => {
    if (cars.length > 0 && !selectedCar && window.innerWidth < 1024) {
      setSelectedCar(cars[0]);
    }
  }, [cars, selectedCar]);

  const handleCarUpdated = (updatedCar: ICar) => {
    setCars((prev) =>
      prev.map((car) => (car.id === updatedCar.id ? updatedCar : car))
    );
    setSelectedCar(updatedCar);
    toast.success('Car updated successfully');
  };

  const handleDelete = async (carId: string) => {
    try {
      setIsLoading(true);
      await toggleListing(carId);
      setRefreshTrigger(prev => prev + 1);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        toast.error(error.message);
      } else {
        setError('Failed to change listing status. Please try again.');
        toast.error('Failed to change listing status. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCarSelect = (car: ICar) => {
    setSelectedCar(car);
    // On mobile, show car details after selection
    if (window.innerWidth < 1024) {
      setShowMobileCarList(false);
    }
  };

  const handleBackToList = () => {
    setShowMobileCarList(true);
  };

  if (error && cars.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Fixed Sidebar */}
        <div className="fixed top-0 left-0 h-full z-30">
          <Sidebar />
        </div>

        {/* Main Content with left margin to account for fixed sidebar */}
        <div className="ml-0 lg:ml-64">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="text-red-600 text-lg mb-4">{error}</div>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <div className="fixed top-0 left-0 h-full z-30">
        <Sidebar />
      </div>

      {/* Main Content with left margin to account for fixed sidebar */}
      <div className="ml-0 lg:ml-64">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4 pl-16">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
            My Cars
          </h1>
        </div>

        {/* Main Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Desktop Header */}
          <div className="hidden lg:flex justify-between items-center mb-6 xl:mb-8">
            <div>
              <h1 className="text-2xl xl:text-3xl font-bold text-gray-900 mb-2">
                My Cars
              </h1>
              <p className="text-gray-600">
                Manage your car listings and monitor their performance.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-sm disabled:opacity-50"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => setAddCarModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add Car</span>
              </button>
            </div>
          </div>

          {/* Mobile Action Buttons */}
          <div className="lg:hidden flex gap-2 mb-4">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm disabled:opacity-50 flex-1 justify-center"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={() => setAddCarModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm flex-1 justify-center"
            >
              <Plus size={16} />
              Add Car
            </button>
          </div>

          {/* Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Car List - Mobile/Desktop Responsive */}
            <div className={`
              lg:col-span-4 xl:col-span-3
              ${!showMobileCarList && selectedCar ? 'hidden lg:block' : 'block'}
            `}>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    All Cars ({cars.length})
                  </h2>
                  {totalPages > 1 && (
                    <span className="text-sm text-gray-500">
                      Page {currentPage} of {totalPages}
                    </span>
                  )}
                </div>

                <div className="space-y-2 max-h-[60vh] lg:max-h-[70vh] overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : cars.length > 0 ? (
                    cars.map((car) => (
                      <CarListItem
                        key={car.id}
                        car={car}
                        isSelected={selectedCar?.id === car.id}
                        onSelect={() => handleCarSelect(car)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CarIcon size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 mb-4">No cars found</p>
                      <button
                        onClick={() => setAddCarModalOpen(true)}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
                      >
                        Add Your First Car
                      </button>
                    </div>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Car Details - Mobile/Desktop Responsive */}
            <div className={`
              lg:col-span-8 xl:col-span-9
              ${showMobileCarList && selectedCar ? 'hidden lg:block' : 'block'}
            `}>
              {selectedCar ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
                  {/* Mobile Back Button */}
                  <div className="lg:hidden mb-4">
                    <button
                      onClick={handleBackToList}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      ← Back to Cars
                    </button>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">
                      Car Details
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditCarModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm"
                      >
                        <Edit size={16} />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(selectedCar.id)}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">
                          {selectedCar.isListed ? 'Unlist' : 'List'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Verification Alert */}
                  {!(selectedCar.isVerified === true && selectedCar.verificationRejected === false) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <h4 className="text-red-700 font-semibold mb-2">Car Not Verified</h4>
                      <p className="text-red-600 text-sm">
                        Your car is not visible to users. Please re-upload your documents on the
                        <span className="font-medium"> Added History</span> page to verify your car.
                        {selectedCar.rejectionReason && (
                          <span className="block mt-2">
                            <strong>Reason:</strong> {selectedCar.rejectionReason}
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Car Overview */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6">
                    <img
                      src={selectedCar.carImages[0] || '/car-thumb.png'}
                      alt={selectedCar.carName}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg object-cover border-2 border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                        {selectedCar.carName} {selectedCar.carModel}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {selectedCar.carType} • {selectedCar.seats} seats • {selectedCar.transmission} • {selectedCar.fuelType}
                      </p>
                      <p className="text-lg font-medium text-gray-900">
                        {formatINR(selectedCar.pricePerHour)}/Hour
                      </p>
                    </div>
                  </div>

                  {/* Car Images */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Images</h4>
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                      {selectedCar.carImages.slice(0, 7).map((img, i) => (
                        <img
                          key={`${img}-${i}`}
                          src={img || '/car-thumb.png'}
                          alt="car"
                          className="aspect-square rounded-lg object-cover border border-gray-200"
                        />
                      ))}
                      {selectedCar.carImages.length > 7 && (
                        <div className="aspect-square rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-xs font-medium text-gray-600">
                          +{selectedCar.carImages.length - 7}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Car Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 block">Status</span>
                      <span className={`text-sm font-medium ${selectedCar.status === 'Available' ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {selectedCar.status}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 block">Location</span>
                      <span className="text-sm text-gray-600 truncate block">
                        {selectedCar.location?.address || 'Not specified'}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 block">Maintenance</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {selectedCar.maintenanceInterval}
                      </span>
                    </div>
                  </div>

                  {/* Document Search */}
                  <div className="border-t border-gray-200 pt-6">
                    <DocumentSearch carId={selectedCar.id} />
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <CarIcon size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Car Selected</h3>
                  <p className="text-gray-600 mb-4">
                    {cars.length > 0 ? 'Select a car to view details' : 'Add a car to get started'}
                  </p>
                  {cars.length === 0 && (
                    <button
                      onClick={() => setAddCarModalOpen(true)}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      Add Your First Car
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CarModal
        isOpen={addCarModalOpen}
        onClose={() => setAddCarModalOpen(false)}
      />
      <EditCarModal
        carData={selectedCar}
        isOpen={editCarModalOpen}
        onClose={() => setEditCarModalOpen(false)}
        onCarUpdated={handleCarUpdated}
      />
    </div>
  );
};

export default Cars;