import React, { useState, useEffect } from 'react';
import { Star, MapPin, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ICar } from '../../types/types';
import { carDetails, similarCarsApi, getUserSubscription, addReview, getCarAllReview } from '../../services/apis/userApis';
import { toast } from 'react-toastify';
import NavBar from '../../layouts/users/NavBar';
import Footer from '../../layouts/users/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';
import { RatingCounts, RatingKey, Review, SimilarCar } from '../../types/user';


const CarDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<ICar | null>(null);
  const [similarCars, setSimilarCars] = useState<SimilarCar[]>([]);
  const [activeImage, setActiveImage] = useState<number>(0);
  const [rating, setRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [reviewLoading, setReviewLoading] = useState<boolean>(false);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [error] = useState<string | null>(null);
  const [userLoading, setUserLoading] = useState<boolean>(false);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [ratingCounts, setRatingCounts] = useState<RatingCounts>({
    5: 0, 4: 0, 3: 0, 2: 0, 1: 0
  });

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

        // Fetch reviews of the car
        const reviewsResult = await getCarAllReview(id);
        console.log(reviewsResult, "review data");

        if (reviewsResult.success && Array.isArray(reviewsResult.data)) {
          setReviews(reviewsResult.data);
        } else {
          setReviews([]);
        }

        calculateRatingStats(reviewsResult.data);
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

  const calculateRatingStats = (reviewsData: Review[] | unknown) => {
    let reviewsArray: Review[] = [];

    if (Array.isArray(reviewsData)) {
      reviewsArray = reviewsData;
    } else if (reviewsData && typeof reviewsData === 'object' && Array.isArray((reviewsData as { [key: string]: unknown })[0])) {
      reviewsArray = (reviewsData as { [key: string]: Review[] })[0];
    }

    if (!reviewsArray.length) {
      setAverageRating(0);
      setRatingCounts({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
      return;
    }

    const sum = reviewsArray.reduce((acc, review) => acc + review.rating, 0);
    const avg = sum / reviewsArray.length;
    setAverageRating(Math.round(avg * 10) / 10);

    // Calculate counts for each rating
    const counts: RatingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsArray.forEach(review => {
      const ratingValue = review.rating;
      // Ensure the rating is within valid range and cast to RatingKey type
      if (ratingValue >= 1 && ratingValue <= 5) {
        const key = ratingValue as RatingKey;
        counts[key] += 1;
      }
    });

    // Calculate percentages
    const countPercentages: RatingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    Object.keys(counts).forEach(key => {
      const numKey = parseInt(key) as RatingKey;
      countPercentages[numKey] = Math.round((counts[numKey] / reviewsArray.length) * 100) || 0;
    });

    setRatingCounts(countPercentages);
  };

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
    navigate(`/car/booking/${car.id}`);
  };

  const handleReviewSubmit = async () => {
    if (!rating) {
      toast.error("Please select a rating");
      return;
    }

    if (!reviewComment.trim()) {
      toast.error("Please write a review comment");
      return;
    }

    try {
      setReviewLoading(true);
      await addReview(id, {
        rating,
        comment: reviewComment
      });

      const reviewsResult = await getCarAllReview(id);
      if (reviewsResult.success && Array.isArray(reviewsResult.data)) {
        setReviews(reviewsResult.data);
        calculateRatingStats(reviewsResult.data);
      }

      // Reset form
      setRating(0);
      setReviewComment('');
      setShowReviewForm(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to submit review");
      }
    } finally {
      setReviewLoading(false);
    }
  };

  // Helper function to get user's first letter for display
  const getUserInitial = (review: Review) => {
    if (review.userId && review.userId.userName) {
      return review.userId.userName.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserName = (review: Review) => {
    if (review.userId && review.userId.userName) {
      return review.userId.userName;
    }
    return 'Anonymous User';
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
      <div className="max-w-6xl mx-auto px-4 py-6 bg-white pt-20">
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
                    className={`px-2 py-1 rounded ${car.status === 'Booked'
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
                <p className="text-xl font-bold">${car.pricePerHour}/Day</p>
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
                <div className="text-3xl font-bold">{averageRating || 0}</div>
                <Star size={24} className="text-teal-400 fill-teal-400" />
                <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
              </div>

              {/* Rating Bars */}
              {/* Here's the fix - explicitly type the array elements as RatingKey */}
              {([5, 4, 3, 2, 1] as RatingKey[]).map((num: RatingKey) => (
                <div key={num} className="flex items-center gap-3 mb-1">
                  <span className="w-3">{num}</span>
                  <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-400 h-full rounded-full"
                      style={{
                        width: `${ratingCounts[num] || 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {ratingCounts[num] || 0}%
                  </span>
                </div>
              ))}

              <div className="mt-4">
                <h3 className="font-medium text-sm mb-2">All Reviews ({reviews.length})</h3>

                {/* Review Cards - Dynamic */}
                {reviews.length > 0 ? (
                  reviews.map((review, index) => (
                    <div key={index} className="border-t py-3">
                      <div className="flex items-center gap-2 mb-1">
                        {review.userId && review.userId.profilePic ? (
                          <img
                            src={review.userId.profilePic}
                            alt={getUserName(review)}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-teal-400 text-white flex items-center justify-center text-sm font-medium">
                            {getUserInitial(review)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{getUserName(review)}</p>
                          <div className="flex">
                            {[...Array(5)].map((_, i: number) => (
                              <Star
                                key={i}
                                size={12}
                                className={`${i < review.rating ? 'text-teal-400 fill-teal-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">No reviews yet</div>
                )}
              </div>

              {/* Add Review */}
              <div className="mt-4">
                {!showReviewForm ? (
                  <button
                    className="text-teal-400 text-sm font-medium mb-4 cursor-pointer"
                    onClick={() => setShowReviewForm(true)}
                  >
                    + Add Review
                  </button>
                ) : (
                  <div>
                    <div className="mb-3">
                      <textarea
                        placeholder="Write your review about this car"
                        className="w-full border rounded p-2 text-sm min-h-[80px]"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                      ></textarea>
                    </div>
                    <div className="flex justify-center mb-3">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star: number) => (
                          <Star
                            key={star}
                            size={24}
                            className={`cursor-pointer ${rating >= star ? 'text-teal-400 fill-teal-400' : 'text-gray-300'}`}
                            onClick={() => setRating(star)}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="flex-1 bg-gray-200 text-gray-600 py-2 rounded cursor-pointer"
                        onClick={() => {
                          setShowReviewForm(false);
                          setRating(0);
                          setReviewComment('');
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="flex-1 bg-teal-400 text-white py-2 rounded cursor-pointer"
                        disabled={reviewLoading}
                        onClick={handleReviewSubmit}
                      >
                        {reviewLoading ? 'Submitting...' : 'Submit'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Cars - Full Width */}
        <div className="mb-6 mt-6">
          <h2 className="font-bold text-lg mb-4">Similar Cars</h2>
          {similarCars.length > 0 ? (
            <div className="relative">
              <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar">
                {similarCars.map((similarCar: SimilarCar) => (
                  <div key={similarCar.id} className="min-w-[250px] border rounded-lg p-2 relative">
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
                      onClick={() => navigate(`/car/${similarCar.id}`)}
                    >
                      View More
                    </button>
                  </div>
                ))}
              </div>
              {similarCars.length > 1 && (
                <>
                  <button className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full flex items-center justify-center">
                    <ChevronLeft size={20} />
                  </button>
                  <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full flex items-center justify-center">
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="border rounded-lg p-8 text-center text-gray-500">
              No similar cars found for this model.
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CarDetailsPage;