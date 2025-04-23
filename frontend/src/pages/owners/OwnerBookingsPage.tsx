// OwnerBookingsPage.tsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../../layouts/owners/Sidebar';
import axios from 'axios';
import { changeBookingStatus, fetchAllOwnerBookings } from '../../services/apis/ownerApi';
import { IBookingWithPopulatedData } from '../../types/types';
import RentalDetailsModal from '../../components/RentalDetailsModal';

// Define interfaces based on the Mongoose schema
interface UserDetails {
  name: string;
  email: string;
  address: string;
  phoneNumber: string;
}

interface Car {
  carName: string;
  // Add other car properties if needed
}

interface Booking {
  _id: string;
  carId: Car | null;
  userDetails: UserDetails;
  pickupDateTime: string;
  dropoffDateTime: string;
  status: 'active' | 'cancelled' | 'completed';
}

const OwnerBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<IBookingWithPopulatedData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<IBookingWithPopulatedData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const result = await fetchAllOwnerBookings()
        console.log(result, "bookingsssssss");

        setBookings(result.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch bookings');
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

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


  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <>
      <div className="flex h-full bg-gray-100">
        <Sidebar />
        <div className="flex-1 p-4 md:p-6 overflow-x-auto">
          <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">My Bookings</h1>

          {/* Responsive table container */}
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

