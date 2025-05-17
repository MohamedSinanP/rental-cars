import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, CheckCircle, Wallet as WalletIcon, Tag, Gift, MapPin } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import NavBar from '../../layouts/users/NavBar';
import Footer from '../../layouts/users/Footer';
import stripe_logo from '../../assets/stripe-logo.png.png';
import { carBookingApi, carDetails, paymentIntent, getUserSubscription, getUserAddresses } from '../../services/apis/userApis';
import { toast } from 'react-toastify';
import { IBooking, ICar } from '../../types/types';
import { extractFeatureValue, formatINR } from '../../utils/commonUtilities';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import LoadingSpinner from '../../components/LoadingSpinner';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string);

export interface BookingFormData {
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
  selectedAddressId?: string;
}

interface IUserSubscription {
  userId: string;
  subscriptionId: ISubscription;
  stripeSubscriptionId: string;
  status: 'active' | 'inactive';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  plan?: string;
  discountPercentage?: number;
  freeHours?: number;
}

interface ISubscription {
  name: string;
  description: string;
  features: string[];
  stripeProductId: string;
  stripePriceId: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  isActive: boolean;
}

interface IUserAddress {
  _id: string;
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

const CarBookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const [car, setCar] = useState<ICar | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<IUserSubscription | null>(null);
  const [discount, setDiscount] = useState<number | null>(null);
  const [freeHours, setFreeHours] = useState<number>(0);
  const [userAddresses, setUserAddresses] = useState<IUserAddress[]>([]);
  const [accessValidated, setAccessValidated] = useState<boolean>(false);

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
      selectedAddressId: '',
    },
  });

  const paymentMethod = watch('paymentMethod');
  const pickupDateTime = watch('pickupDateTime');
  const dropoffDateTime = watch('dropoffDateTime');
  const selectedAddressId = watch('selectedAddressId');

  useEffect(() => {
    const fetchCarData = async () => {
      if (!id) {
        setError('Invalid car ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch car details
        const result = await carDetails(id);
        const data: ICar = await result.data;

        // Check if car is already booked
        if (data.status === 'Booked') {
          toast.error("This car is already booked");
          navigate(`/car-details/${id}`);
          return;
        }

        // Check if this is a luxury car that requires subscription
        const isLuxuryCar = data.carType === 'Luxury';

        // Fetch user subscription status
        const subscriptionResult = await getUserSubscription();
        const userSub = subscriptionResult.data;
        setSubscription(userSub);

        // Validate subscription requirements
        if (isLuxuryCar) {
          if (!userSub) {
            toast.error("This is a premium car. You need a subscription to book it.");
            navigate('/subscription', { state: { from: `/car/${id}` } });
            return;
          }

          if (userSub.status !== 'active') {
            toast.error("Your subscription is cancelled or completed. Please renew to book premium cars.");
            navigate('/subscription', { state: { from: `/car/${id}` } });
            return;
          }

          if (userSub.subscriptionId.name === 'DrivePlus') {
            toast.error("This premium car is only available for Elite plan users.");
            navigate('/subscription', { state: { from: `/car/${id}` } });
            return;
          }
        }

        // If we reached here, access is valid
        setAccessValidated(true);

        if (!data.pricePerHour) {
          data.pricePerHour = data.pricePerHour / 24;
        }
        setCar(data);
        setValue('pickupLocation', data.location.address);
        setValue('dropoffLocation', data.location.address);

        // Fetch user addresses
        const addressesResult = await getUserAddresses();
        setUserAddresses(addressesResult.data || []);

      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
          setError(error.message);
        } else {
          toast.error("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCarData();
  }, [id, navigate, setValue]);

  useEffect(() => {
    if (subscription?.subscriptionId?.features) {
      try {
        if (subscription.subscriptionId.features[1]) {
          const discountValue = extractFeatureValue(subscription.subscriptionId.features[1]);
          setDiscount(Number(discountValue));
        }
        if (subscription.subscriptionId.features[2]) {
          const freeHours = extractFeatureValue(subscription.subscriptionId.features[2]);
          setFreeHours(Number(freeHours));
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Failed to process subscriptoin benefits");
        }
      }
    }
  }, [subscription]);

  // Handle address selection change
  useEffect(() => {
    if (selectedAddressId && selectedAddressId !== 'new') {
      const selectedAddress = userAddresses.find(addr => addr._id === selectedAddressId);
      if (selectedAddress) {
        setValue('fullName', selectedAddress.name);
        setValue('email', selectedAddress.email);
        setValue('phone', selectedAddress.phoneNumber);
        setValue('address', selectedAddress.address);
      }
    }
  }, [selectedAddressId, userAddresses, setValue]);

  const calculateTotalCost = () => {
    if (!car) {
      return { rentalCost: 0, tax: 0, total: 0, hours: 0, discount: 0, discountedTotal: 0, freeHours: 0, chargeableHours: 0 };
    } else if (!pickupDateTime || !dropoffDateTime) {
      return { rentalCost: 0, tax: 0, total: car.deposit, hours: 0, discount: 0, discountedTotal: car.deposit, freeHours: 0, chargeableHours: 0 };
    }

    const start = new Date(pickupDateTime);
    const end = new Date(dropoffDateTime);
    const hours = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600)));

    const appliedFreeHours = subscription?.status === 'active' ? freeHours : 0;

    const chargeableHours = Math.max(0, hours - appliedFreeHours);

    const rentalCost = (car.pricePerHour || 100) * chargeableHours;
    const taxAmount = rentalCost * 0.1;
    const subtotal = rentalCost + taxAmount;

    const discountPercentage = subscription?.status === 'active' ? (subscription.discountPercentage || 10) : 0;
    const discountAmount = subtotal * (discountPercentage / 100);

    const discountedTotal = subtotal - discountAmount + car.deposit;
    const total = subtotal + car.deposit;

    return {
      rentalCost,
      tax: taxAmount,
      total,
      hours,
      discount: discountAmount,
      discountPercentage,
      discountedTotal,
      freeHours: appliedFreeHours,
      chargeableHours
    };
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!car || !id || !stripe || !elements) {
      toast.error('Missing required data');
      return;
    }

    // Double-check car availability before proceeding
    try {
      const latestCarDetails = await carDetails(id);
      const latestCarData = latestCarDetails.data;

      if (latestCarData.status === 'Booked') {
        toast.error("This car was just booked by someone else. Please choose another car.");
        navigate('/cars');
        return;
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
      return;
    }

    const cost = calculateTotalCost();
    const finalAmount = subscription?.status === 'active' ? cost.discountedTotal : cost.total;

    let currentClientSecret = clientSecret;
    let currentPaymentId = paymentIntentId;

    if (data.paymentMethod === 'stripe' && !currentClientSecret) {
      try {
        const result = await paymentIntent(finalAmount);
        const { clientSecret: newSecret, paymentId } = result.data;
        setClientSecret(newSecret);
        setPaymentIntentId(paymentId);
        currentClientSecret = newSecret;
        currentPaymentId = paymentId;
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Something went wrong");
        }
        return;
      }
    }

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
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Something went wrong");
        }
        return;
      }
    }

    try {
      const bookingData: IBooking = {
        carId: id,
        ownerId: car.ownerId,
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
        totalPrice: finalAmount,
        paymentMethod: data.paymentMethod,
        paymentId: currentPaymentId!,
        isPremiumBooking: subscription?.status === 'active',
        discountPercentage: subscription?.status === 'active' ? subscription.discountPercentage || 10 : 0,
        discountAmount: cost.total - finalAmount,
      };

      const result = await carBookingApi(bookingData);
      const bookingId = result.data._id;
      toast.success(result.message);
      navigate(`/greetings/${bookingId}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setClientSecret(null);
      setPaymentIntentId(null);
    }
  };

  if (loading) {
    return (
      <>
        <LoadingSpinner />
      </>
    );
  }

  if (error || !car || !accessValidated) {
    return (
      <>
        <NavBar />
        <div className="max-w-6xl mx-auto p-6">{error || 'Car not found or not available for booking'}</div>
        <Footer />
      </>
    );
  }

  const cost = calculateTotalCost();

  return (
    <>
      <NavBar />
      <div className="max-w-6xl mx-auto bg-white pt-20">
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
                <p className="font-bold">{formatINR(car.pricePerHour || car.pricePerHour)}/Hour</p>
                <p className="text-gray-600">◆ Deposit Amount: {formatINR(car.deposit)}</p>
              </div>
            </div>

            {/* Subscription Badge */}
            {subscription?.status === 'active' && (
              <div className="mt-4 bg-teal-50 border border-teal-200 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <Tag size={16} className="text-teal-600 mr-1" />
                  <h3 className="text-teal-700 font-semibold">
                    {subscription.subscriptionId.name || 'Premium'} Member Benefits
                  </h3>
                </div>
                <div className="flex items-center mb-1 text-teal-600 text-sm">
                  <span className="flex items-center">
                    <Tag size={14} className="mr-1" />
                    {discount}% off on rental cost
                  </span>
                </div>
                <div className="flex items-center text-teal-600 text-sm">
                  <Gift size={14} className="mr-1" />
                  {freeHours} free hours included
                </div>
                {subscription.currentPeriodEnd && (
                  <p className="text-xs text-teal-500 mt-1">
                    Valid until: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
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
                          className={`w-5 h-5 rounded ${field.value ? 'text-teal-500' : 'text-gray-300'} `}
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

                {/* Saved Addresses Selector */}
                <div className="mb-4">
                  <label className="block mb-2 text-sm">Select Address</label>
                  <div className="relative">
                    <select
                      {...register('selectedAddressId')}
                      className="w-full border rounded p-2 pr-8 outline-none appearance-none"
                    >
                      {userAddresses.map(address => (
                        <option key={address._id} value={address._id}>
                          {address.name} - {address.address.substring(0, 30)}...
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <MapPin size={18} className="text-gray-500" />
                    </div>
                  </div>
                </div>

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
                  <span className="text-gray-600">Deposit:</span>
                  <span>{formatINR(car.deposit)}</span>
                </div>

                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Total Rental Duration:</span>
                  <span>{cost.hours} hour{cost.hours !== 1 ? 's' : ''}</span>
                </div>

                {subscription?.status === 'active' && cost.freeHours > 0 && (
                  <div className="flex justify-between items-center mb-2 text-teal-600">
                    <span className="flex items-center">
                      <Gift size={16} className="mr-1" />
                      Free Hours:
                    </span>
                    <span>{cost.freeHours} hour{cost.freeHours !== 1 ? 's' : ''}</span>
                  </div>
                )}

                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Chargeable Hours:</span>
                  <span>{cost.chargeableHours} hour{cost.chargeableHours !== 1 ? 's' : ''}</span>
                </div>

                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Rental Cost:</span>
                  <span>{formatINR(cost.rentalCost)}</span>
                </div>

                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Tax (10%):</span>
                  <span>{formatINR(cost.tax)}</span>
                </div>

                {subscription?.status === 'active' && cost.discount > 0 && (
                  <div className="flex justify-between items-center mb-2 text-teal-600">
                    <span className="flex items-center">
                      <Tag size={16} className="mr-1" />
                      Subscription Discount ({cost.discountPercentage}%):
                    </span>
                    <span>-{formatINR(cost.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center font-bold border-t pt-2 mt-2">
                  <span>Total Cost:</span>
                  <span>
                    {subscription?.status === 'active' && (cost.discount > 0 || cost.freeHours > 0) ? (
                      <>
                        <span className="text-sm text-gray-500 line-through mr-2">{formatINR(cost.total)}</span>
                        <span className="text-teal-600">{formatINR(cost.discountedTotal)}</span>
                      </>
                    ) : (
                      formatINR(cost.total)
                    )}
                  </span>
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
        </div >
      </div >
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