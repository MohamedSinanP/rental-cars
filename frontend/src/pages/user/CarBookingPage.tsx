import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, CheckCircle, Wallet as WalletIcon } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import NavBar from '../../layouts/users/NavBar';
import Footer from '../../layouts/users/Footer';
import stripe_logo from '../../assets/stripe-logo.png.png';
import { carBookingApi, carDetails, paymentIntent } from '../../services/apis/userApis';
import { toast } from 'react-toastify';
import { IBooking, ICar } from '../../types/types';
import { formatINR } from '../../utils/commonUtilities';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string);

interface BookingFormData {
  pickupDateTime: string;
  dropoffDateTime: string;
  pickupLocation: string;
  dropoffLocation: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: 'wallet' | 'stripe';
  allowGPS: boolean;
}

interface ICarExtended extends ICar {
  pricePerHour?: number; // Optional, added for hourly pricing
}

const CarBookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const [car, setCar] = useState<ICarExtended | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  const { register, handleSubmit, control, formState: { errors }, watch, setValue } = useForm<BookingFormData>({
    defaultValues: {
      pickupDateTime: '',
      dropoffDateTime: '',
      pickupLocation: '',
      dropoffLocation: '',
      fullName: '',
      email: '',
      phone: '',
      address: '',
      paymentMethod: 'wallet',
      allowGPS: true,
    },
  });

  const paymentMethod = watch('paymentMethod');
  const pickupDateTime = watch('pickupDateTime');
  const dropoffDateTime = watch('dropoffDateTime');

  useEffect(() => {
    const fetchCarData = async () => {
      if (!id) {
        setError('Invalid car ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await carDetails(id);
        const data: ICarExtended = await result.data;
        // Derive pricePerHour if not provided
        if (!data.pricePerHour) {
          data.pricePerHour = data.pricePerDay / 24; // e.g., ₹2400/day → ₹100/hour
        }
        setCar(data);
        setValue('pickupLocation', data.location.address);
        setValue('dropoffLocation', data.location.address);
      } catch (err: any) {
        toast.error(err.message);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCarData();
  }, [id, setValue]);

  const calculateTotalCost = () => {
    if (!car || !pickupDateTime || !dropoffDateTime) {
      return { rentalCost: 0, tax: 0, total: 0, hours: 0 };
    }

    const start = new Date(pickupDateTime);
    const end = new Date(dropoffDateTime);
    const hours = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600))); // Minimum 1 hour
    const rentalCost = (car.pricePerHour || 100) * hours; // Default ₹100/hour if undefined
    const taxAmount = rentalCost * 0.1; // 10% tax
    return { rentalCost, tax: taxAmount, total: rentalCost + taxAmount, hours };
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!car || !id || !stripe || !elements) {
      toast.error('Missing required data');
      return;
    }

    const cost = calculateTotalCost();

    let currentClientSecret = clientSecret;
    let currentPaymentId = paymentIntentId;

    // Step 1: Create PaymentIntent if needed
    if (data.paymentMethod === 'stripe' && !currentClientSecret) {
      try {
        const result = await paymentIntent(cost.total);
        const { clientSecret: newSecret, paymentId } = result.data;
        setClientSecret(newSecret);
        setPaymentIntentId(paymentId);
        currentClientSecret = newSecret;
        currentPaymentId = paymentId;
      } catch (err: any) {
        toast.error(`Failed to initiate Stripe payment: ${err.message}`);
        return;
      }
    }

    // Step 2: Confirm Stripe Payment
    if (data.paymentMethod === 'stripe' && currentClientSecret) {
      try {
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          toast.error('Card details are incomplete');
          return;
        }

        const { error } = await stripe.confirmCardPayment(currentClientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: { name: data.fullName },
          },
        });

        if (error) {
          toast.error(`Stripe payment failed: ${error.message}`);
          return;
        }
      } catch (err: any) {
        toast.error(`Error confirming Stripe payment: ${err.message}`);
        return;
      }
    }

    // Step 3: Create booking
    try {
      const bookingData: IBooking = {
        carId: id,
        userDetails: {
          address: data.address,
          email: data.email,
          name: data.fullName,
          phoneNumber: data.phone
        },
        pickupDateTime: new Date(data.pickupDateTime),
        dropoffDateTime: new Date(data.dropoffDateTime),
        pickupLocation: data.pickupLocation,
        dropoffLocation: data.dropoffLocation,
        totalPrice: cost.total,
        paymentMethod: data.paymentMethod,
        paymentId: currentPaymentId!,
      };

      const result = await carBookingApi(bookingData);
      toast.success(result.message);
      navigate('/');
    } catch (err: any) {
      toast.error(`Booking failed: ${err.message}`);
    } finally {
      setClientSecret(null);
      setPaymentIntentId(null);
    }
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="max-w-6xl mx-auto p-6">Loading...</div>
        <Footer />
      </>
    );
  }

  if (error || !car) {
    return (
      <>
        <NavBar />
        <div className="max-w-6xl mx-auto p-6">{error || 'Car not found'}</div>
        <Footer />
      </>
    );
  }

  const cost = calculateTotalCost();

  return (
    <>
      <NavBar />
      <div className="max-w-6xl mx-auto bg-white">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/3 p-4 bg-gray-50">
            <div className="mb-4">
              <button
                className="flex items-center text-gray-700 hover:text-teal-600 cursor-pointer"
                onClick={() => navigate(`/car-details/${id} `)}
              >
                <ArrowLeft size={18} className="mr-1" />
                <span>Back To Car Details</span>
              </button>
            </div>

            <div className="mb-2">
              <h2 className="text-lg font-semibold">Car Details</h2>
            </div>

            <div className="mb-4">
              <img
                src={car.carImages[0] || '/api/placeholder/400/250'}
                alt={`${car.carName} ${car.carModel} `}
                className="w-full rounded-md"
              />
            </div>

            <div>
              <h1 className="text-xl font-bold mb-1">
                {car.carName} {car.carModel}
              </h1>
              <p className="text-gray-600 mb-1">
                {car.transmission}, {car.fuelType}, {car.seats} Seats
              </p>
              <p className="text-gray-600 mb-2">{car.carType}</p>
              <div className="flex items-center justify-between">
                <p className="font-bold">{formatINR(car.pricePerHour || car.pricePerDay)}/Hour</p>
                <p className="text-gray-600">◆ Deposit Amount: {formatINR(car.deposit)}</p>
              </div>
            </div>
          </div>

          <div className="w-full md:w-2/3 p-6 border rounded-lg">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">Rent Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block mb-2 text-sm">Pickup Date & Time</label>
                    <div className="flex items-center border rounded p-2">
                      <input
                        type="datetime-local"
                        {...register('pickupDateTime', {
                          required: 'Pickup date is required',
                          validate: (value) =>
                            new Date(value) > new Date() || 'Pickup date must be in the future',
                        })}
                        className="w-full outline-none"
                      />
                      <Calendar size={18} className="text-gray-400" />
                    </div>
                    {errors.pickupDateTime && (
                      <p className="text-red-500 text-sm">{errors.pickupDateTime.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm">Drop-off Date & Time</label>
                    <div className="flex items-center border rounded p-2">
                      <input
                        type="datetime-local"
                        {...register('dropoffDateTime', {
                          required: 'Drop-off date is required',
                          validate: (value) =>
                            pickupDateTime &&
                              new Date(value) >= new Date(new Date(pickupDateTime).getTime() + 3600 * 1000)
                              ? true
                              : 'Drop-off must be at least 1 hour after pickup',
                        })}
                        className="w-full outline-none"
                      />
                      <Calendar size={18} className="text-gray-400" />
                    </div>
                    {errors.dropoffDateTime && (
                      <p className="text-red-500 text-sm">{errors.dropoffDateTime.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block mb-2 text-sm">Pickup Location</label>
                    <input
                      type="text"
                      {...register('pickupLocation', { required: 'Pickup location is required' })}
                      className="w-full border rounded p-2 outline-none"
                    />
                    {errors.pickupLocation && (
                      <p className="text-red-500 text-sm">{errors.pickupLocation.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm">Drop-off Location</label>
                    <input
                      type="text"
                      {...register('dropoffLocation', { required: 'Drop-off location is required' })}
                      className="w-full border rounded p-2 outline-none"
                    />
                    {errors.dropoffLocation && (
                      <p className="text-red-500 text-sm">{errors.dropoffLocation.message}</p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center">
                    <label className="text-sm mr-4">Allow GPS Tracking</label>
                    <Controller
                      name="allowGPS"
                      control={control}
                      render={({ field }) => (
                        <button
                          type="button"
                          className={`w - 5 h - 5 rounded ${field.value ? 'text-teal-500' : 'text-gray-300'} `}
                          onClick={() => field.onChange(!field.value)}
                        >
                          <CheckCircle size={20} className={field.value ? 'fill-teal-500' : ''} />
                        </button>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">User Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <input
                      type="text"
                      {...register('fullName', { required: 'Full name is required' })}
                      className="w-full border rounded p-2 outline-none"
                      placeholder="Full Name"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Invalid email address',
                        },
                      })}
                      className="w-full border rounded p-2 outline-none"
                      placeholder="Email"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <input
                    type="tel"
                    {...register('phone', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: 'Phone number must be 10 digits',
                      },
                    })}
                    className="w-full border rounded p-2 outline-none"
                    placeholder="Phone Number"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm">{errors.phone.message}</p>
                  )}
                </div>

                <div className="mb-4">
                  <input
                    type="text"
                    {...register('address', { required: 'Address is required' })}
                    className="w-full border rounded p-2 outline-none"
                    placeholder="Address"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm">{errors.address.message}</p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-1">Payment</h2>
                <p className="text-sm text-gray-500 mb-4">Payment Methods</p>
                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="wallet"
                      value="wallet"
                      {...register('paymentMethod')}
                      className="accent-teal-500"
                    />
                    <label htmlFor="wallet" className="flex items-center">
                      <WalletIcon size={18} className="mr-1 text-gray-600" />
                      Wallet
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="stripe"
                      value="stripe"
                      {...register('paymentMethod')}
                      className="accent-teal-500"
                    />
                    <label htmlFor="stripe" className="flex items-center">
                      <img src={stripe_logo} alt="Stripe logo" className="w-10 h-5 object-contain" />
                      Stripe
                    </label>
                  </div>
                </div>

                {paymentMethod === 'stripe' && (
                  <div className="my-4">
                    <label className="block text-sm">Card Information</label>
                    <CardElement className="w-full border rounded p-2" />
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">Price Breakdown</h2>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Rental Cost ({cost.hours} hour{cost.hours !== 1 ? 's' : ''}):</span>
                  <span>{formatINR(cost.rentalCost)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Tax (10%):</span>
                  <span>{formatINR(cost.tax)}</span>
                </div>
                <div className="flex justify-between items-center font-bold">
                  <span>Total Cost:</span>
                  <span>{formatINR(cost.total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!stripe || !elements || loading}
                className="w-full py-3 bg-teal-500 text-white rounded font-medium disabled:bg-gray-400"
              >
                {loading ? 'Processing...' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

const WrappedCarBookingPage = () => (
  <Elements stripe={stripePromise}>
    <CarBookingPage />
  </Elements>
);

export default WrappedCarBookingPage;
