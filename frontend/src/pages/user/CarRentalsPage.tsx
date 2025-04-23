import React, { useState, useEffect } from 'react';
import NavBar from '../../layouts/users/NavBar';
import Footer from '../../layouts/users/Footer';
import { IBooking, IBookingWithPopulatedData } from '../../types/types';
import { userRentals } from '../../services/apis/userApis';
import RentalDetailsModal from '../../components/RentalDetailsModal';
import Pagination from '../../components/Pagination';

const CarRentalsPage: React.FC = () => {
  const [rentals, setRentals] = useState<IBookingWithPopulatedData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRental, setSelectedRental] = useState<IBookingWithPopulatedData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 4;

  useEffect(() => {
    const fetchRentals = async (): Promise<void> => {
      try {
        setLoading(true);
        const result = await userRentals(currentPage, limit);;
        const data: IBookingWithPopulatedData[] = result.data.data;
        console.log(result, "this is data");

        setRentals(data);
        setCurrentPage(result.data.currentPage);
        setTotalPages(result.data.totalPages);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchRentals();
  }, [currentPage]);

  const handleInvoiceDownload = (id: string): void => {
    console.log(`Downloading invoice for rental ${id}`);
    // Add actual invoice download logic here
  };

  const handleViewDetails = (id: string): void => {
    const rental = rentals.find((r) => r._id === id);
    if (rental) {
      setSelectedRental(rental);
      setIsModalOpen(true);
    }
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded-lg text-red-700">
        Error loading rental data: {error}
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <div className="bg-gray-100 min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <p className="text-sm text-gray-800">Home / My Rentals</p>
          </div>

          {/* Mobile View */}
          <div className="lg:hidden space-y-4">
            {rentals.map((rental) => (
              <div key={rental._id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={rental.carId.carImages?.[0]}
                    alt={rental.carId.carName}
                    className="w-20 h-14 object-cover rounded"
                  />
                  <span>{typeof rental.userId === 'object' ? rental.userId.userName : 'N/A'}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <p className="font-medium">Rental Period</p>
                    <p>Start: {rental.pickupDateTime.toLocaleString()}</p>
                    <p>End: {rental.dropoffDateTime.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-medium">Pickup & Dropoff</p>
                    <p>{rental.pickupLocation}</p>
                    <p>{rental.dropoffLocation}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div>
                    <p className="font-medium">Booking Status</p>
                    <p>{rental.status}</p>
                  </div>
                  <div>
                    <p className="font-medium">Total Price</p>
                    <p>$ {rental.totalPrice.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={() => handleInvoiceDownload(rental._id!)}
                    className="bg-teal-400 text-white px-4 py-2 rounded text-sm w-full sm:w-auto text-center"
                  >
                    Invoice Down
                  </button>
                  <button
                    onClick={() => handleViewDetails(rental._id!)}
                    className="border border-teal-400 text-teal-400 px-4 py-2 rounded text-sm w-full sm:w-auto text-center"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
            <div className="grid grid-cols-6 border-b py-3 px-4 bg-white text-sm font-medium text-gray-700">
              <div>Car Name & Model</div>
              <div>Rental Period</div>
              <div>Pickup & Dropoff</div>
              <div>Booking Status</div>
              <div>Total Price</div>
              <div></div>
            </div>

            <div className="divide-y">
              {rentals.map((rental) => (
                <div key={rental._id} className="grid grid-cols-6 py-4 px-4 items-center">
                  <div className="flex items-center space-x-3">
                    <img
                      src={rental.carId.carImages?.[0]}
                      alt={rental.carId.carName}
                      className="w-20 h-14 object-cover rounded"
                    />
                    <span className="text-sm">{rental.carId.carName}</span>
                  </div>
                  <div className="text-sm">
                    <p>Start: {rental.pickupDateTime.toLocaleString()}</p>
                    <p>End: {rental.dropoffDateTime.toLocaleString()}</p>
                  </div>
                  <div className="text-sm">
                    <p>{rental.pickupLocation}</p>
                    <p>{rental.dropoffLocation}</p>
                  </div>
                  <div className="text-sm">{rental.status}</div>
                  <div className="text-sm">$ {rental.totalPrice.toFixed(2)}</div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleInvoiceDownload(rental._id!)}
                      className="bg-teal-400 text-white px-4 py-1 rounded text-sm"
                    >
                      Invoice Down
                    </button>
                    <button
                      onClick={() => handleViewDetails(rental._id!)}
                      className="border border-teal-400 text-teal-400 px-4 py-1 rounded text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-center py-4 mt-4 bg-white rounded-lg shadow">
            <div className="flex space-x-1">
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>
      <RentalDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rental={selectedRental}
      />
      <Footer />
    </>
  );
};

export default CarRentalsPage;
