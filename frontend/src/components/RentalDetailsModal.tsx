import React, { useState } from 'react';
import { IBookingWithPopulatedData } from '../types/types';
import { cancelBooking } from '../services/apis/userApis';
import { toast } from 'react-toastify';

interface RentalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rental: IBookingWithPopulatedData | null;
  onRentalUpdate?: (updatedRental: IBookingWithPopulatedData) => void;
}

const RentalDetailsModal: React.FC<RentalDetailsModalProps> = ({
  isOpen,
  onClose,
  rental,
  onRentalUpdate
}) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!isOpen || !rental) return null;

  const handleCancelClick = () => {
    setShowConfirmation(true);
  };

  const handleCancelConfirm = async () => {
    if (!rental) return;

    try {
      setIsCancelling(true);
      setCancelError(null);

      const result = await cancelBooking(rental.id);
      const updatedRental = result.data;
      if (onRentalUpdate) {
        onRentalUpdate(updatedRental);
      }

      setShowConfirmation(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsCancelling(false);
    }
  };

  const canCancel = rental.status !== 'cancelled' && rental.status !== 'completed';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 md:p-8 max-w-4xl w-full shadow-2xl relative overflow-hidden max-h-[90vh] border border-gray-100">
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-blue-500 to-purple-500"></div>

        <button
          className="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl cursor-pointer z-10 bg-gray-800 bg-opacity-30 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mt-8 mb-6 text-center relative z-10 text-gray-800">
          Rental Details
        </h2>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)] px-2">
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Vehicle Photos</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
              {rental.carId.carImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Car ${idx + 1}`}
                  className="w-60 h-40 object-cover rounded-lg shadow-md snap-center hover:opacity-95 transition-opacity cursor-pointer flex-shrink-0"
                />
              ))}
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <span className="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H11a1 1 0 001-1v-1h3.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0017 5h-1V4a1 1 0 00-1-1H3z" />
                </svg>
              </span>
              {rental.carId.carName} {rental.carId.carModel}
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex flex-col items-center justify-center bg-white p-3 rounded-lg shadow-sm">
                <span className="text-gray-500 mb-1">Type</span>
                <span className="font-medium">{rental.carId.carType}</span>
              </div>

              <div className="flex flex-col items-center justify-center bg-white p-3 rounded-lg shadow-sm">
                <span className="text-gray-500 mb-1">Seats</span>
                <span className="font-medium">{rental.carId.seats}</span>
              </div>

              <div className="flex flex-col items-center justify-center bg-white p-3 rounded-lg shadow-sm">
                <span className="text-gray-500 mb-1">Transmission</span>
                <span className="font-medium">{rental.carId.transmission}</span>
              </div>

              <div className="flex flex-col items-center justify-center bg-white p-3 rounded-lg shadow-sm">
                <span className="text-gray-500 mb-1">Fuel</span>
                <span className="font-medium">{rental.carId.fuelType}</span>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">Features</h4>
              <div className="flex flex-wrap gap-2">
                {rental.carId.features.map((feature, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-1">Location</h4>
              <p className="text-gray-600">{rental.carId.location?.address}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <span className="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </span>
              Booking Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-start mb-4">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Pickup Location</p>
                    <p className="font-medium">{rental.pickupLocation}</p>
                  </div>
                </div>

                <div className="flex items-start mb-4">
                  <div className="bg-red-100 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Dropoff Location</p>
                    <p className="font-medium">{rental.dropoffLocation}</p>
                  </div>
                </div>

                <div className="flex items-start mb-4">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Start Date & Time</p>
                    <p className="font-medium">{new Date(rental.pickupDateTime).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">End Date & Time</p>
                    <p className="font-medium">{new Date(rental.dropoffDateTime).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium">{rental.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Payment Status</span>
                    <span className={`font-medium ${rental.paymentStatus === 'completed' ? 'text-green-600' : 'text-orange-600'}`}>
                      {rental.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking Status</span>
                    <span className={`font-medium ${rental.status === 'completed' ? 'text-green-600' :
                      rental.status === 'cancelled' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                      {rental.status}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="text-gray-700 font-medium mb-2">Price Summary</h4>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Total Price</span>
                    <span className="text-lg font-bold text-blue-700">₹{rental.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cancel Booking Button */}
          {canCancel && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleCancelClick}
                className="bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-3 rounded-lg shadow-md transition-colors flex items-center"
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Cancel Booking
                  </>
                )}
              </button>
            </div>
          )}

          {cancelError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-center">
              {cancelError}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Cancel Booking</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>

            <div className="flex space-x-3 justify-end">
              <button
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setShowConfirmation(false)}
                disabled={isCancelling}
              >
                No, Keep Booking
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
                onClick={handleCancelConfirm}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Yes, Cancel Booking"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalDetailsModal;