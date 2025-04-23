import { useState, useEffect } from 'react';
import { Check, Calendar, MapPin, Clock, Download, ArrowLeft, Car } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getLatestBooking } from '../../services/apis/userApis';

// Define interfaces for our data structures
interface BookingDetails {
  id: string;
  carName: string;
  pickupLocation: string;
  pickupDateTime: Date;
  dropoffDateTime: Date;
  totalPrice: number;
  customerName: string;
}

const BookingSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(10);

  // Fetch booking details from backend
  useEffect(() => {
    const fetchBookingDetails = async (): Promise<void> => {
      try {
        setLoading(true);
        const result = await getLatestBooking(id);

        const bookingData: BookingDetails = {
          ...result.data,
          pickupDateTime: new Date(result.data.pickupDateTime),
          dropoffDateTime: new Date(result.data.dropoffDateTime)
        };

        setBookingDetails(bookingData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Failed to fetch booking details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookingDetails();
    } else {
      setError('No booking ID provided');
      setLoading(false);
    }
  }, [id]);

  // Countdown timer to auto-navigate after 10 seconds
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate('/cars');
    }
  }, [countdown, navigate]);

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate rental duration in days
  const calculateDuration = (pickupDate: Date, dropoffDate: Date): number => {
    const diffTime = Math.abs(dropoffDate.getTime() - pickupDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10 px-4">
        <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading booking details...</p>
      </div>
    );
  }

  // Error state
  if (error || !bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10 px-4">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <span className="text-red-600 text-4xl">!</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Unable to load booking</h1>
        <p className="text-lg text-gray-600 mb-6 text-center">{error || 'Booking details not found'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center justify-center bg-teal-400 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      {/* Success Animation */}
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-bounce">
        <Check size={40} className="text-green-600" />
      </div>

      {/* Heading */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
      <p className="text-lg text-gray-600 mb-8 text-center">
        Thank you for your booking. Your car is reserved and ready for pickup.
      </p>

      {/* Booking Details Card */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-teal-400 p-4 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Booking Details</h2>
            <span className="text-sm bg-white text-teal-400 px-3 py-1 rounded-full">
              Confirmed
            </span>
          </div>
          <p className="text-sm mt-1">Booking ID: {bookingDetails.id}</p>
        </div>

        {/* Car Info */}
        <div className="flex items-center p-4 border-b border-gray-100">
          <div className="bg-gray-100 p-3 rounded-full mr-4">
            <Car size={24} className="text-teal-400" />
          </div>
          <div>
            <h3 className="font-medium">{bookingDetails.carName}</h3>
            <p className="text-sm text-gray-500">
              {calculateDuration(bookingDetails.pickupDateTime, bookingDetails.dropoffDateTime)} day rental
            </p>
          </div>
        </div>

        {/* Pickup Details */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex mb-4">
            <Calendar size={20} className="text-gray-500 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">Pickup Date</p>
              <p className="font-medium">{formatDate(bookingDetails.pickupDateTime)}</p>
            </div>
            <div className="ml-auto">
              <p className="text-sm text-gray-500">Time</p>
              <p className="font-medium">{formatTime(bookingDetails.pickupDateTime)}</p>
            </div>
          </div>

          <div className="flex">
            <MapPin size={20} className="text-gray-500 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">Pickup Location</p>
              <p className="font-medium">{bookingDetails.pickupLocation}</p>
            </div>
          </div>
        </div>

        {/* Return Details */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex">
            <Clock size={20} className="text-gray-500 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">Return Date</p>
              <p className="font-medium">{formatDate(bookingDetails.dropoffDateTime)}</p>
            </div>
            <div className="ml-auto">
              <p className="text-sm text-gray-500">Time</p>
              <p className="font-medium">{formatTime(bookingDetails.dropoffDateTime)}</p>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="p-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Total Paid</span>
            <span className="font-bold">${bookingDetails.totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="w-full max-w-md mt-8 bg-teal-50 p-4 rounded-lg border border-teal-100">
        <h3 className="font-medium text-teal-800 mb-2">What's Next?</h3>
        <ul className="text-sm text-teal-700 space-y-2">
          <li>• You'll receive a confirmation email with all booking details</li>
          <li>• Bring your driver's license and payment card used for booking</li>
          <li>• Arrive 15 minutes before your scheduled pickup time</li>
        </ul>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-md">
        <button
          onClick={() => navigate('/cars')}
          className="flex-1 flex items-center justify-center bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} className="mr-2" />
          Go to Cars
        </button>
        <button
          onClick={() => navigate('/rentals')}
          className="flex-1 flex items-center justify-center bg-teal-400 text-white py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
        >
          View My Bookings
        </button>
      </div>

      <p className="text-sm text-gray-500 mt-8">
        Redirecting to dashboard in {countdown} seconds...
      </p>
    </div>
  );
};

export default BookingSuccessPage;