import React, { useState, useEffect } from 'react';
import Sidebar from '../../layouts/owners/Sidebar';
import { changeBookingStatus, fetchAllOwnerBookings } from '../../services/apis/ownerApi';
import { IBookingWithPopulatedData } from '../../types/types';
import RentalDetailsModal from '../../components/RentalDetailsModal';
import Pagination from '../../components/Pagination';
import { toast } from 'react-toastify';

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
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Failed to fetch bookings');
        }
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentPage]);

  const handleStatusChange = async (bookingId: string, newStatus: 'active' | 'cancelled' | 'completed') => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (booking && booking.status !== 'active') {
        toast.error('Cannot change status of a cancelled or completed booking');
        return;
      }

      await changeBookingStatus(bookingId, newStatus);
      setBookings(bookings.map(booking =>
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ));
      toast.success('Booking status updated successfully');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        toast.error(error.message);
      } else {
        setError('Failed to update booking status');
        toast.error('Failed to update booking status');
      }
    }
  };

  const viewBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
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
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-xs md:text-sm text-gray-900">
                    <span className="hidden md:inline">{booking.id}</span>
                    <span className="md:hidden">{booking.id!.substring(0, 6)}...</span>
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
                        onClick={() => viewBooking(booking.id!)}
                        className="px-2 py-1 bg-teal-400 text-white text-xs rounded hover:bg-teal-400 cursor-pointer"
                      >
                        View
                      </button>
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking.id!, e.target.value as 'active' | 'cancelled' | 'completed')}
                        className="px-1 py-1 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={booking.status !== 'active'}
                        title={booking.status !== 'active' ? 'Cannot change status of cancelled or completed bookings' : ''}
                      >
                        <option value="active">Active</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
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
      <div className="min-h-screen bg-gray-100">
        {/* Fixed Sidebar */}
        <div className="fixed top-0 left-0 h-full z-30">
          <Sidebar />
        </div>

        {/* Main Content with left margin to account for fixed sidebar */}
        <div className="ml-0 lg:ml-64">
          {/* Mobile Header */}
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4 pl-16">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              My Bookings
            </h1>
          </div>

          {/* Main Content */}
          <div className="p-4 md:p-6">
            {/* Desktop Header */}
            <div className="hidden lg:block mb-4 md:mb-6">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Bookings</h1>
            </div>

            {/* Bookings Content */}
            {renderBookingsContent()}
          </div>
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