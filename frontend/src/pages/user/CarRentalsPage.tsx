import React, { useState, useEffect } from 'react';
import NavBar from '../../layouts/users/NavBar';
import Footer from '../../layouts/users/Footer';
import { IBookingWithPopulatedData } from '../../types/types';
import { userRentals } from '../../services/apis/userApis';
import RentalDetailsModal from '../../components/RentalDetailsModal';
import Pagination from '../../components/Pagination';
import DataTable, { DataItem, Column, Action } from '../../components/DataTable';
import { Link } from 'react-router-dom';

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
        const result = await userRentals(currentPage, limit);
        const data: IBookingWithPopulatedData[] = result.data.data;

        setRentals(data);
        console.log(result.data, "this is not !..");

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
  };

  const handleViewDetails = (rental: IBookingWithPopulatedData): void => {
    setSelectedRental(rental);
    setIsModalOpen(true);
  };

  type BookingDataItem = IBookingWithPopulatedData & DataItem;

  const columns: Column<BookingDataItem>[] = [
    {
      key: 'car',
      header: 'Car Name & Model',
      render: (item: BookingDataItem) => (
        <div className="flex flex-col items-center space-x-3">
          <img
            src={item.carId.carImages?.[0]}
            alt={item.carId.carName}
            className="w-20 h-14 object-cover rounded"
          />
          <span className="text-sm">{item.carId.carName}</span>
        </div>
      ),
    },
    {
      key: 'period',
      header: 'Rental Period',
      render: (item: BookingDataItem) => (
        <div className="text-sm">
          <p>Start: {new Date(item.pickupDateTime).toLocaleString()}</p>
          <p>End: {new Date(item.dropoffDateTime).toLocaleString()}</p>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Pickup & Dropoff',
      render: (item: BookingDataItem) => (
        <div className="text-sm">
          <p>{item.pickupLocation}</p>
          <p>{item.dropoffLocation}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Booking Status',
      render: (item: BookingDataItem) => (
        <span className="text-sm">{item.status}</span>
      ),
    },
    {
      key: 'price',
      header: 'Total Price',
      render: (item: BookingDataItem) => (
        <span className="text-sm">$ {item.totalPrice.toFixed(2)}</span>
      ),
    },
  ];

  // Define actions for the DataTable
  const actions: Action<BookingDataItem>[] = [
    {
      label: 'Invoice Down',
      onClick: (item: BookingDataItem) => handleInvoiceDownload(item._id!),
      className: 'bg-teal-400 text-white hover:bg-teal-500',
    },
    {
      label: 'View Details',
      onClick: (item: BookingDataItem) => handleViewDetails(item),
      className: 'border border-teal-400 text-teal-400 hover:bg-teal-50',
    },
  ];

  // Custom empty state message as a string for DataTable compatibility
  const emptyStateMessage = "No rental history found";

  // Full EmptyState component for mobile view
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-24 h-24 mb-6 text-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>
      <h3 className="text-xl font-medium text-gray-700">No Rental History</h3>
      <p className="mt-2 text-center text-gray-500 max-w-md">
        You haven't made any car bookings yet. Start exploring our collection and book your first ride today!
      </p>
      <button
        className="mt-6 px-6 py-2 bg-teal-400 text-white rounded hover:bg-teal-500"
        onClick={() => window.location.href = '/cars'}
      >
        Explore Cars
      </button>
    </div>
  );

  return (
    <>
      <NavBar />
      <div className="bg-gray-100 min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <p className="text-sm text-gray-800"><span><Link to={'/'}>Home</Link ></span> / My Rentals</p>
          </div>

          {error ? (
            <div className="bg-red-100 p-4 rounded-lg text-red-700">
              Error loading rental data: {error}
            </div>
          ) : (
            <>
              {/* Desktop View with DataTable */}
              <div className="hidden lg:block">
                <DataTable
                  data={rentals as BookingDataItem[]}
                  columns={columns}
                  actions={actions}
                  title="My Car Rentals"
                  loading={loading}
                  emptyMessage={emptyStateMessage}
                  headerClassName="text-2xl font-semibold text-gray-800"
                />
              </div>

              {/* Mobile View */}
              <div className="lg:hidden space-y-4">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
                  </div>
                ) : rentals.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-6">
                    <EmptyState />
                  </div>
                ) : (
                  rentals.map((rental) => (
                    <div key={rental._id} className="bg-white rounded-lg shadow p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={rental.carId.carImages?.[0]}
                          alt={rental.carId.carName}
                          className="w-20 h-14 object-cover rounded"
                        />
                        <span>{rental.carId.carName}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <p className="font-medium">Rental Period</p>
                          <p>Start: {new Date(rental.pickupDateTime).toLocaleString()}</p>
                          <p>End: {new Date(rental.dropoffDateTime).toLocaleString()}</p>
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
                          onClick={() => handleViewDetails(rental)}
                          className="border border-teal-400 text-teal-400 px-4 py-2 rounded text-sm w-full sm:w-auto text-center"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {!loading && rentals.length > 0 && totalPages > 1 && (
                <div className="flex justify-center py-4 mt-4 bg-white rounded-lg shadow">
                  <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
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