import React, { useState, useEffect, useCallback } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../../layouts/owners/Sidebar';
import CarModal from '../../components/CarModal';
import { toast } from 'react-toastify';
import { getCars } from '../../services/apis/ownerApi';
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
  <li
    onClick={onSelect}
    className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
      } border`}
  >
    <img
      src={car.carImages[0] || '/car-thumb.png'}
      alt={car.carName}
      className="w-14 h-14 rounded-full object-cover border border-gray-200"
    />
    <span className="text-base font-medium text-gray-800">
      {car.carName} {car.carModel}
    </span>
  </li>
);

const Cars: React.FC = () => {
  const [cars, setCars] = useState<ICar[]>([]);
  const [selectedCar, setSelectedCar] = useState<ICar | null>(null);
  const [addCarModalOpen, setAddCarModalOpen] = useState<boolean>(false);
  const [editCarModalOpen, setEditCarModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 4;

  const fetchCars = useCallback(async () => {
    try {
      const result = await getCars(currentPage, limit);
      const fetchedCars = Array.isArray(result.data.data) ? result.data.data : [];
      setCars(fetchedCars);
      setCurrentPage(result.data.currentPage);
      setTotalPages(result.data.totalPages);
    } catch (err) {
      setError('Failed to fetch cars. Please try again.');
      toast.error('Error fetching cars');
    }
  }, [currentPage]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const handleCarUpdated = (updatedCar: ICar) => {
    setCars((prev) =>
      prev.map((car) => (car._id === updatedCar._id ? updatedCar : car))
    );
    setSelectedCar(updatedCar);
    toast.success('Car updated successfully');
  };

  const handleDelete = async (carId: string) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        await axios.delete(`/api/cars/${carId}`);
        const updatedCars = cars.filter((car) => car._id !== carId);
        setCars(updatedCars);
        if (selectedCar?._id === carId) {
          setSelectedCar(null);
        }
        toast.success('Car deleted successfully');
      } catch (err) {
        toast.error('Failed to delete car');
      }
    }
  };

  if (error && cars.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 text-red-600 text-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">My Cars</h2>
            <div className="flex gap-3">
              <button
                onClick={fetchCars}
                className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-sm cursor-pointer"
              >
                Refresh
              </button>
              <button
                onClick={() => setAddCarModalOpen(true)}
                className="px-5 py-2 bg-teal-400 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm cursor-pointer"
              >
                Add Car
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Car List */}
            <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">All Cars</h3>
              <ul className="space-y-3 max-h-[80vh] overflow-y-auto">
                {cars.length > 0 ? (
                  cars.map((car) => (
                    <CarListItem
                      key={car._id}
                      car={car}
                      isSelected={selectedCar?._id === car._id}
                      onSelect={() => setSelectedCar(car)}
                    />
                  ))
                ) : (
                  <li className="text-gray-500 text-center py-4">
                    No cars found. Add a car to get started!
                  </li>
                )}
              </ul>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>

            {/* Car Info */}
            <div className="w-full lg:w-2/3">
              {selectedCar ? (
                <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                    Car Information
                  </h3>

                  {/* Verification Alert - Only shown when conditions are met */}
                  {!selectedCar.isVerified && !selectedCar.verificationRejected && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-red-700 font-semibold mb-1">Your car is not verified</h4>
                          <p className="text-red-600 text-sm">
                            We did not show your car to the users.
                            Please re-upload your docs to verify on the added history page
                            {selectedCar.rejectionReason && ` Reason: ${selectedCar.rejectionReason}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-6 mb-6">
                    <img
                      src={selectedCar.carImages[0] || '/car-thumb.png'}
                      alt={selectedCar.carName}
                      className="w-28 h-28 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div>
                      <p className="text-xl font-semibold text-gray-900">
                        {selectedCar.carName} {selectedCar.carModel}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedCar.carType} & {selectedCar.seats} seats |{' '}
                        {selectedCar.transmission} & {selectedCar.fuelType}
                      </p>
                      <p className="text-lg font-medium text-gray-800 mt-2">
                        {formatINR(selectedCar.pricePerDay)}/Hour
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Images</h4>
                    <div className="flex items-center gap-3 flex-wrap">
                      {selectedCar.carImages.slice(0, 4).map((img, i) => (
                        <img
                          key={`${img}-${i}`}
                          src={img || '/car-thumb.png'}
                          alt="car"
                          className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                        />
                      ))}
                      {selectedCar.carImages.length > 4 && (
                        <div className="w-20 h-20 rounded-lg border bg-gray-50 flex items-center justify-center text-sm font-medium text-gray-600">
                          +{selectedCar.carImages.length - 4}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Availability:</span>
                      <span
                        className={`text-sm ml-2 font-medium ${selectedCar.status === 'Available' ? 'text-green-600' : 'text-red-600'
                          }`}
                      >
                        {selectedCar.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Car Location:</span>
                      <span className="text-sm ml-2 text-gray-600">{selectedCar.location?.address}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Maintenance Interval:</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full ml-2">
                        {selectedCar.maintenanceInterval}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 mb-6">
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors cursor-pointer"
                      onClick={() => setEditCarModalOpen(true)}
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(selectedCar._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={16} /> List/Unlist
                    </button>
                  </div>
                  <DocumentSearch carId={selectedCar._id} />
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-600">
                  No car selected. Add or select a car to view details.
                </div>
              )}
            </div>
          </div>
        </div>
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
    </div>
  );
};

export default Cars;