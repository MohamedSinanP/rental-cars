// OwnerBookingsPage.tsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../../layouts/owners/Sidebar';
import { changeBookingStatus, fetchAllOwnerBookings } from '../../services/apis/ownerApi';
import { IBookingWithPopulatedData } from '../../types/types';
import RentalDetailsModal from '../../components/RentalDetailsModal';
import Pagination from '../../components/Pagination';



const OwnerBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<IBookingWithPopulatedData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<IBookingWithPopulatedData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 4;


  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const result = await fetchAllOwnerBookings(currentPage, limit);
        setBookings(result.data.data);
        setCurrentPage(result.data.currentPage);
        setTotalPages(result.data.totalPages);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch bookings');
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentPage]);

  const handleStatusChange = async (bookingId: string, newStatus: 'active' | 'cancelled' | 'completed') => {
    try {
      const result = await changeBookingStatus(bookingId, newStatus);
      console.log("this is the status rsult", result.data);

      setBookings(bookings.map(booking =>
        booking._id === bookingId ? { ...booking, status: newStatus } : booking
      ));
    } catch (err) {
      setError('Failed to update booking status');
    }
  };

  const viewBooking = (bookingId: string) => {
    const booking = bookings.find(b => b._id === bookingId);
    if (booking) {
      setSelectedBooking(booking);
      setIsModalOpen(true);
    }
  };

  const renderBookingsContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center h-64 bg-white shadow-md rounded-lg">
        <div className="text-lg">Loading bookings...</div>
      </div>;
    }

    if (error) {
      return <div className="p-6 text-red-500 bg-white shadow-md rounded-lg">{error}</div>;
    }

    return (
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dropoff</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-xs md:text-sm text-gray-900">
                    <span className="hidden md:inline">{booking._id}</span>
                    <span className="md:hidden">{booking._id!.substring(0, 6)}...</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs md:text-sm text-gray-900">{booking.carId?.carName || 'N/A'}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs md:text-sm text-gray-900">{booking.userDetails.name}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs md:text-sm text-gray-900">
                    <span className="hidden md:inline">{new Date(booking.pickupDateTime).toLocaleString()}</span>
                    <span className="md:hidden">{new Date(booking.pickupDateTime).toLocaleDateString()}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs md:text-sm text-gray-900">
                    <span className="hidden md:inline">{new Date(booking.dropoffDateTime).toLocaleString()}</span>
                    <span className="md:hidden">{new Date(booking.dropoffDateTime).toLocaleDateString()}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs md:text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => viewBooking(booking._id!)}
                        className="px-2 py-1 bg-teal-400 text-white text-xs rounded hover:bg-teal-400 cursor-pointer"
                      >
                        View
                      </button>
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking._id!, e.target.value as 'active' | 'cancelled' | 'completed')}
                        className="px-1 py-1 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="cancelled">Cancel</option>
                        <option value="completed">Complete</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}

              {bookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-sm text-gray-500">
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    );
  };

  return (
    <>
      <div className="flex h-full bg-gray-100">
        <Sidebar />
        <div className="flex-1 p-4 md:p-6 overflow-x-auto">
          <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">My Bookings</h1>
          {renderBookingsContent()}
        </div>
      </div>
      <RentalDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rental={selectedBooking}
      />
    </>
  );
};

export default OwnerBookingsPage;