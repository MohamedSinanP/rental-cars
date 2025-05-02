import React, { useState, useEffect } from 'react';
import { Star, MapPin, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ICar } from '../../types/types';
import { carDetails, similarCarsApi, getUserSubscription } from '../../services/apis/userApis';
import { toast } from 'react-toastify';
import NavBar from '../../layouts/users/NavBar';
import Footer from '../../layouts/users/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';

interface SimilarCar {
  _id: string;
  carName: string;
  seats: string;
  pricePerDay: number;
  rating: number;
  carImages: string[];
}


const CarDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<ICar | null>(null);
  const [similarCars, setSimilarCars] = useState<SimilarCar[]>([]);
  const [activeImage, setActiveImage] = useState<number>(0);
  const [rating, setRating] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userLoading, setUserLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchCarData = async () => {
      try {
        setLoading(true);
        const result = await carDetails(id);

        const data: ICar = result.data;
        setCar(data);

        // Fetch similar cars
        const outcome = await similarCarsApi(id);
        const similarData: SimilarCar[] = outcome.data;
        setSimilarCars(similarData);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCarData();
  }, [id]);

  // Fetch user profile separately - will only be used when needed
  const checkUserSubscription = async () => {
    try {
      setUserLoading(true);
      const result = await getUserSubscription();
      return result.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
        return false
      } else {
        toast.error("Something went wrong");
        return false
      }
    } finally {
      setUserLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!car) return;
    const isLuxuryCar = car.carType === 'Luxury';

    if (isLuxuryCar) {
      const userSub = await checkUserSubscription();
      console.log(userSub, "yes yo do");

      if (!userSub) {
        toast.error("This is a premium car. You need a subscription to book it.");
        navigate('/subscription', { state: { from: `/car/${id}` } });
        return;
      }

      if (userSub.status !== 'active') {
        toast.error("Your subscription is cancelled or completed. Please renew to book premium cars.");
        navigate('/subscription', { state: { from: `/car/${id}` } });
        return;
      };

      if (userSub.subscriptionId.name === 'DrivePlus') {
        toast.error("This premium car is only available for Elite plan users.");
        return;
      }
    }
    navigate(`/car/booking/${car._id}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !car) {
    return <div>{error || 'Car not found'}</div>;
  }

  return (
    <>
      <NavBar />
      <div className="max-w-6xl mx-auto px-4 py-6 bg-white">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <span>
            <Link to={'/cars'}>
              Cars /
            </Link>
            {car.carName} {car.carModel}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Section */}
          <div className="lg:w-2/3">
            {/* Car Images */}
            <div className="mb-6">
              <div className="relative">
                <img
                  src={car.carImages[activeImage]}
                  alt={`${car.carName} Main`}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  {car.carImages.map((_, index: number) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full ${activeImage === index ? 'bg-teal-400' : 'bg-gray-300'
                        }`}
                      onClick={() => setActiveImage(index)}
                    />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {car.carImages.slice(1, 4).map((img: string, idx: number) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${car.carName} view ${idx + 1}`}
                    className="h-24 w-full object-cover rounded-lg cursor-pointer"
                    onClick={() => setActiveImage(idx + 1)}
                  />
                ))}
              </div>
            </div>

            {/* Car Details */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <h1 className="text-2xl font-bold">
                  {car.carName} {car.carModel}
                </h1>
                <div className="flex items-center text-sm text-gray-600">
                  <span
                    className={`px-2 py-1 rounded ${car.status === 'booked'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-green-100 text-green-600'
                      }`}
                  >
                    {car.status.charAt(0).toUpperCase() + car.status.slice(1)}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 mb-2">
                {car.transmission}, {car.fuelType}, {car.seats} Seats
              </p>
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 mb-4">
                <p className="text-xl font-bold">${car.pricePerDay}/Day</p>
                <p className="text-gray-600">◆ Deposit Amount: ${car.deposit}</p>
              </div>
            </div>

            {/* Car Location */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-3">
                <MapPin className="text-teal-400 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h2 className="font-medium mb-2">Car Location</h2>
                  <p className="text-gray-600 text-sm">{car.location.address}</p>
                </div>
              </div>
            </div>

            {/* Car Features */}
            <div className="mb-6">
              <h2 className="font-bold text-lg mb-4">Car Features</h2>
              <div className="border rounded-lg p-4">
                <ul className="grid grid-cols-2 gap-3">
                  {car.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-teal-400 rounded-full"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-end mt-3">
                <button
                  className="bg-teal-400 text-white font-medium px-6 py-2 rounded-lg"
                  onClick={handleBooking}
                  disabled={userLoading || car.status === 'booked'}
                >
                  {userLoading ? 'Checking...' : 'Rent this Car'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="lg:w-1/3">
            {/* Ratings & Reviews */}
            <div className="bg-white p-4 border rounded-lg mb-6">
              <h2 className="font-bold mb-4">Customer Reviews & Ratings</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl font-bold">4.5</div>
                <Star size={24} className="text-teal-400 fill-teal-400" />
              </div>

              {/* Rating Bars */}
              {[5, 4, 3, 2, 1].map((num: number) => (
                <div key={num} className="flex items-center gap-3 mb-1">
                  <span className="w-3">{num}</span>
                  <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-400 h-full rounded-full"
                      style={{
                        width: num === 5 ? '80%' : num === 4 ? '60%' : num === 3 ? '40%' : num === 2 ? '20%' : '10%',
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {num === 5 ? '80%' : num === 4 ? '60%' : num === 3 ? '40%' : num === 2 ? '20%' : '10%'}
                  </span>
                </div>
              ))}

              <div className="mt-4">
                <h3 className="font-medium text-sm mb-2">All Reviews ({car.review?.length || 0})</h3>

                {/* Review Cards */}
                {car.review?.map((review: string, index: number) => (
                  <div key={index} className="border-t py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                        U{index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">User {index + 1}</p>
                        <div className="flex">
                          {[...Array(5)].map((_, i: number) => (
                            <Star key={i} size={12} className="text-teal-400 fill-teal-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{review}</p>
                  </div>
                ))}
              </div>

              {/* Add Review */}
              <div className="mt-4">
                <button className="text-teal-400 text-sm font-medium mb-4">+ Add Review</button>
                <div>
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="w-full border rounded p-2 text-sm"
                    />
                  </div>
                  <div className="mb-3">
                    <textarea
                      placeholder="About this Car"
                      className="w-full border rounded p-2 text-sm min-h-[80px]"
                    ></textarea>
                  </div>
                  <div className="flex justify-center mb-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star: number) => (
                        <Star
                          key={star}
                          size={24}
                          className={`cursor-pointer ${rating >= star ? 'text-teal-400 fill-teal-400' : 'text-gray-300'
                            }`}
                          onClick={() => setRating(star)}
                        />
                      ))}
                    </div>
                  </div>
                  <button className="bg-teal-400 text-white w-full py-2 rounded">Submit</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Cars - Full Width */}
        <div className="mb-6 mt-6">
          <h2 className="font-bold text-lg mb-4">Similar Cars</h2>
          <div className="relative">
            <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar">
              {similarCars.map((similarCar: SimilarCar) => (
                <div key={similarCar._id} className="min-w-[250px] border rounded-lg p-2 relative">
                  <button className="absolute top-4 right-4 z-10 bg-white p-1 rounded-full">
                    <Heart size={16} className="text-gray-400" />
                  </button>
                  <img
                    src={similarCar.carImages[0]}
                    alt={similarCar.carName}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{similarCar.carName}</h3>
                      <p className="text-xs text-gray-500">{similarCar.seats}</p>
                      <p className="font-bold mt-1">${similarCar.pricePerDay}/day</p>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className="mr-1">{similarCar.rating}</span>
                      <Star size={12} className="text-teal-400 fill-teal-400" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <span>•</span>
                    <span>{similarCar.pricePerDay}</span>
                  </div>
                  <button
                    className="w-full bg-teal-400 text-white text-sm py-1 rounded mt-2"
                    onClick={() => navigate(`/car/${similarCar._id}`)}
                  >
                    View More
                  </button>
                </div>
              ))}
            </div>
            <button className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full flex items-center justify-center">
              <ChevronLeft size={20} />
            </button>
            <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full flex items-center justify-center">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CarDetailsPage;