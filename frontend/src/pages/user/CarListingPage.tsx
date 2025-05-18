import { useEffect, useRef, useState } from 'react';
import { Search, MapPin, ChevronDown, Filter, Heart } from 'lucide-react';
import NavBar from '../../layouts/users/NavBar';
import Footer from '../../layouts/users/Footer';
import { ICar, CarFilters } from '../../types/types';
import { addToWishlist, getCars, getWishlist, removeFromWishlist } from '../../services/apis/userApis';
import { Link, useNavigate } from 'react-router-dom';
import Pagination from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useDebounce } from '../../hooks/useDebounce';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { toast } from 'react-toastify';

interface Filters {
  carType: string[];
  transmission: string[];
  fuelType: string[];
  seats: string[];
  priceRange: [number, number];
  distanceRange: [number, number];
  fuel: string[];
}

type StringArrayFilterKey = Extract<keyof Filters, 'carType' | 'transmission' | 'fuelType' | 'seats' | 'fuel' | 'ratings'>;

interface ExpandedSections {
  distance: boolean;
  carDetails: boolean;
  transmission: boolean;
  fuelType: boolean;
  seats: boolean;
  totalPrice: boolean;
  fuel: boolean;
  userRatings: boolean;
}

interface FilterOptions {
  carType: string[];
  transmission: string[];
  fuelType: string[];
  seats: string[];
  fuel: string[];
}

export default function CarListingPage() {
  const navigate = useNavigate();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const isMounted = useRef(false);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!accessToken);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [maxDistance, setMaxDistance] = useState<number | null>(null);
  const [isInitialFetchDone, setIsInitialFetchDone] = useState<boolean>(false);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const [filters, setFilters] = useState<Filters>({
    carType: [],
    transmission: [],
    fuelType: [],
    seats: [],
    priceRange: [0, 0],
    distanceRange: [0, 50],
    fuel: [],
  });

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const debouncedFilters = useDebounce(filters, 500);

  const [cars, setCars] = useState<ICar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;

  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    distance: true,
    carDetails: true,
    transmission: false,
    fuelType: false,
    seats: false,
    totalPrice: false,
    fuel: false,
    userRatings: false,
  });

  const filterOptions: FilterOptions = {
    carType: ['Hatchback', 'SUV', 'Pickup', 'Sedan', 'Luxury', 'Van'],
    transmission: ['Manual', 'Automatic'],
    fuelType: ['Petrol', 'Diesel', 'Electric', 'CNG'],
    seats: ['4/5 Seater', '6/7 Seater'],
    fuel: ['With Fuel', 'Without Fuel'],
  };

  const fetchCars = async (isInitial: boolean = false): Promise<void> => {
    try {
      setLoading(true);

      const filtersToUse: CarFilters = {
        ...debouncedFilters,
        distanceRange: isInitial ? [0, 0] : debouncedFilters.distanceRange,
      };

      const result = await getCars(
        currentPage,
        limit,
        filtersToUse,
        debouncedSearchQuery
      );

      const data: ICar[] = Array.isArray(result) ? result : result.data.data || [];

      if (isInitial) {
        if (result.data.maxPrice && maxPrice === null) {
          setMaxPrice(result.data.maxPrice);
        }
        if (result.data.maxDistance && maxDistance === null) {
          setMaxDistance(result.data.maxDistance);
        }
        setIsInitialFetchDone(true);
      }

      setCars(data);
      setCurrentPage(result.data.currentPage);
      setTotalPages(result.data.totalPages);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Fetch Error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;
    fetchCars(true);

    // Load wishlist from localStorage if exists
    const savedWishlist = localStorage.getItem('carWishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, []);

  useEffect(() => {
    fetchCars(false);
  }, [debouncedSearchQuery, debouncedFilters, currentPage, isInitialFetchDone]);

  useEffect(() => {
    setIsLoggedIn(!!accessToken);
  }, [accessToken]);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isLoggedIn) return;

      try {
        const result = await getWishlist();

        if (result && result.data && result.data.cars) {
          const carIds = result.data.cars.map((item: any) => item.car.id || item.car);
          setWishlist(carIds);
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    };

    fetchWishlist();
  }, [isLoggedIn]);

  // Update the toggleWishlist function to use backend API
  const toggleWishlist = async (carId: string) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    try {
      if (wishlist.includes(carId)) {
        await removeFromWishlist(carId);
        setWishlist(prevWishlist => prevWishlist.filter(id => id !== carId));
      } else {
        // Add to wishlist
        await addToWishlist(carId);
        setWishlist(prevWishlist => [...prevWishlist, carId]);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist. Please try again.');
    }
  };

  const isWishlisted = (carId: string) => {
    return wishlist.includes(carId);
  };

  const handleFilterChange = (
    filterKey: StringArrayFilterKey,
    value: string,
    isChecked: boolean
  ): void => {
    setFilters((prevFilters) => {
      const updatedFilter = isChecked
        ? [...prevFilters[filterKey], value]
        : prevFilters[filterKey].filter((item) => item !== value);
      return { ...prevFilters, [filterKey]: updatedFilter };
    });
    setCurrentPage(1);
  };

  const isStringArrayFilterKey = (key: string): key is StringArrayFilterKey => {
    return ['carType', 'transmission', 'fuelType', 'seats', 'fuel'].includes(key);
  };

  const toggleSection = (section: keyof ExpandedSections): void => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    const isMin = e.target.id === 'price-min';

    setFilters((prev) => ({
      ...prev,
      priceRange: isMin
        ? [value, Math.max(value, prev.priceRange[1] || maxPrice || value)]
        : [Math.min(value, prev.priceRange[0]), value],
    }));
    setCurrentPage(1);
  };

  const handleDistanceRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    const isMin = e.target.id === 'distance-min';

    setFilters((prev) => ({
      ...prev,
      distanceRange: isMin
        ? [value, Math.max(value, prev.distanceRange[1] || maxDistance || value)]
        : [Math.min(value, prev.distanceRange[0]), value],
    }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilters({
      carType: [],
      transmission: [],
      fuelType: [],
      seats: [],
      priceRange: [0, maxPrice || 0],
      distanceRange: [0, 50],
      fuel: [],
    });
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  return (
    <div className="max-w-screen-xl mx-auto pt-20">
      <NavBar />
      <div className="bg-gray-50 px-6 py-6 sm:px-10">
        <div className="mb-3 text-sm text-gray-500">
          <Link to={'/'}>Home /</Link><span className="text-gray-700 font-medium">Cars</span>
        </div>
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex flex-col sm:flex-col items-center gap-4 w-full lg:w-2/3">
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                placeholder="Search for model, features, etc."
                className="w-full pl-4 pr-32 py-3 rounded-md border border-gray-300 text-sm focus:outline-teal-400 transition-all duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-teal-500 hover:bg-teal-600 text-white text-sm px-4 py-2 rounded-md flex items-center gap-1 transition-all duration-200"
                onClick={() => fetchCars()}
              >
                <Search size={16} />
                Search
              </button>
            </div>
          </div>
          <div className="hidden lg:block lg:w-1/3">
            <img
              src="images/background-image.png"
              alt="Featured Car"
              className="w-full h-auto object-contain rounded-md"
            />
          </div>
        </div>
      </div>

      <div className="bg-teal-400 text-white p-4">
        <h2 className="text-xl font-bold">Find Your Best Car For Rent</h2>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Filter Section */}
        <div className="w-full md:w-80 bg-white md:bg-gray-50 p-4 md:border-r">
          {/* Mobile Filter Toggle */}
          <div className="md:hidden flex justify-between items-center mb-4">
            <button
              className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition-all duration-200"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter size={16} />
              {isFilterOpen ? 'Close Filters' : 'Open Filters'}
            </button>
          </div>

          {/* Filter Panel */}
          <div
            className={`md:block ${isFilterOpen ? 'block' : 'hidden'} md:w-full bg-white md:bg-transparent rounded-lg md:rounded-none shadow-lg md:shadow-none p-4 md:p-0 transition-all duration-300 md:max-h-[calc(100vh-200px)] md:overflow-y-auto`}
          >
            {/* Filter Header */}
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white md:bg-gray-50 py-2 z-10">
              <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
              <button
                className="text-teal-500 hover:text-teal-600 text-sm font-medium transition-colors duration-200"
                onClick={clearAllFilters}
              >
                Clear All
              </button>
            </div>

            {/* Distance Filter */}
            {isLoggedIn && maxDistance !== null && (
              <div className="mb-6">
                <div
                  className="flex justify-between items-center text-gray-700 font-medium mb-3 cursor-pointer hover:bg-gray-100 rounded-md px-2 py-1 transition-all duration-200"
                  onClick={() => toggleSection('distance')}
                >
                  <h3>Distance</h3>
                  <ChevronDown
                    size={20}
                    className={`text-gray-500 transition-transform duration-200 ${expandedSections.distance ? 'rotate-180' : ''}`}
                  />
                </div>
                {expandedSections.distance && (
                  <div className="space-y-4 animate-slide-down">
                    <div className="relative pt-6 px-4 pb-2">
                      <div className="flex justify-between mb-2 text-sm text-gray-600">
                        <span>{filters.distanceRange[0]} km</span>
                        <span>{filters.distanceRange[1]} km</span>
                      </div>
                      <div className="relative">
                        <div className="w-full h-2 bg-gray-200 rounded-full"></div>
                        <div
                          className="h-2 bg-teal-500 rounded-full absolute top-0"
                          style={{
                            left: `${(filters.distanceRange[0] / (maxDistance || 1000)) * 100}%`,
                            width: `${((filters.distanceRange[1] - filters.distanceRange[0]) / (maxDistance || 1000)) * 100}%`,
                          }}
                        ></div>
                        <input
                          id="distance-min"
                          type="range"
                          min="0"
                          max={maxDistance || 1000}
                          value={filters.distanceRange[0]}
                          onChange={handleDistanceRangeChange}
                          className="absolute w-full h-4 top-[-4px] opacity-0 cursor-pointer"
                        />
                        <input
                          id="distance-max"
                          type="range"
                          min="0"
                          max={maxDistance || 1000}
                          value={filters.distanceRange[1]}
                          onChange={handleDistanceRangeChange}
                          className="absolute w-full h-4 top-[-4px] opacity-0 cursor-pointer"
                        />
                        <div
                          className="w-5 h-5 bg-teal-500 border-2 border-white rounded-full absolute top-1/2 transform -translate-y-1/2 shadow-md hover:scale-110 transition-transform duration-200"
                          style={{ left: `calc(${(filters.distanceRange[0] / (maxDistance || 1000)) * 100}% - 10px)` }}
                        ></div>
                        <div
                          className="w-5 h-5 bg-teal-500 border-2 border-white rounded-full absolute top-1/2 transform -translate-y-1/2 shadow-md hover:scale-110 transition-transform duration-200"
                          style={{ left: `calc(${(filters.distanceRange[1] / (maxDistance || 1000)) * 100}% - 10px)` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(Object.keys(filterOptions) as Array<keyof FilterOptions>).map((filterKey) => {
              const options = filterOptions[filterKey];
              const sectionKey = filterKey === 'carType' ? 'carDetails' :
                filterKey as keyof ExpandedSections;

              return (
                <div className="mb-6" key={filterKey}>
                  <div
                    className="flex justify-between items-center text-gray-700 font-medium mb-3 cursor-pointer hover:bg-gray-100 rounded-md px-2 py-1 transition-all duration-200"
                    onClick={() => toggleSection(sectionKey)}
                  >
                    <h3>{filterKey.replace(/([A-Z])/g, ' $1').trim()}</h3>
                    <ChevronDown
                      size={20}
                      className={`text-gray-500 transition-transform duration-200 ${expandedSections[sectionKey] ? 'rotate-180' : ''}`}
                    />
                  </div>
                  {expandedSections[sectionKey] && (
                    <div className="space-y-2 animate-slide-down">
                      {options.map((option) => (
                        <label className="flex items-center space-x-3 cursor-pointer" key={option}>
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={filters[filterKey].includes(option)}
                            onChange={(e) => {
                              if (isStringArrayFilterKey(filterKey)) {
                                handleFilterChange(
                                  filterKey,
                                  option,
                                  e.target.checked
                                );
                              }
                            }}
                          />
                          <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-all duration-200 ${filters[filterKey].includes(option) ? 'bg-teal-500 border-teal-500' : 'border-gray-300'}`}>
                            {filters[filterKey].includes(option) && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="text-gray-600 hover:text-gray-800 transition-colors duration-200">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Price Filter */}
            {maxPrice !== null && (
              <div className="mb-6">
                <div
                  className="flex justify-between items-center text-gray-700 font-medium mb-3 cursor-pointer hover:bg-gray-100 rounded-md px-2 py-1 transition-all duration-200"
                  onClick={() => toggleSection('totalPrice')}
                >
                  <h3>Total Price</h3>
                  <ChevronDown
                    size={20}
                    className={`text-gray-500 transition-transform duration-200 ${expandedSections.totalPrice ? 'rotate-180' : ''}`}
                  />
                </div>
                {expandedSections.totalPrice && (
                  <div className="space-y-4 animate-slide-down">
                    <div className="relative pt-6 px-4 pb-2">
                      <div className="flex justify-between mb-2 text-sm text-gray-600">
                        <span>${filters.priceRange[0]}</span>
                        <span>${filters.priceRange[1] || maxPrice}</span>
                      </div>
                      <div className="relative">
                        <div className="w-full h-2 bg-gray-200 rounded-full"></div>
                        <div
                          className="h-2 bg-teal-500 rounded-full absolute top-0"
                          style={{
                            left: `${(filters.priceRange[0] / (maxPrice || 1000)) * 100}%`,
                            width: `${((filters.priceRange[1] || maxPrice || 0 - filters.priceRange[0]) / (maxPrice || 1000)) * 100}%`,
                          }}
                        ></div>
                        <input
                          id="price-min"
                          type="range"
                          min="0"
                          max={maxPrice || 1000}
                          value={filters.priceRange[0]}
                          onChange={handlePriceRangeChange}
                          className="absolute w-full h-4 top-[-4px] opacity-0 cursor-pointer"
                        />
                        <input
                          id="price-max"
                          type="range"
                          min="0"
                          max={maxPrice || 1000}
                          value={filters.priceRange[1] || maxPrice || 0}
                          onChange={handlePriceRangeChange}
                          className="absolute w-full h-4 top-[-4px] opacity-0 cursor-pointer"
                        />
                        <div
                          className="w-5 h-5 bg-teal-500 border-2 border-white rounded-full absolute top-1/2 transform -translate-y-1/2 shadow-md hover:scale-110 transition-transform duration-200"
                          style={{ left: `calc(${(filters.priceRange[0] / (maxPrice || 1000)) * 100}% - 10px)` }}
                        ></div>
                        <div
                          className="w-5 h-5 bg-teal-500 border-2 border-white rounded-full absolute top-1/2 transform -translate-y-1/2 shadow-md hover:scale-110 transition-transform duration-200"
                          style={{ left: `calc(${((filters.priceRange[1] || maxPrice || 0) / (maxPrice || 1000)) * 100}% - 10px)` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Car Listings */}
        <div className="flex-1 p-4">
          {/* Loading state - only shows in the car listing section */}
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {cars.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">No cars match your criteria.</p>
                  <button
                    className="mt-4 bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition-all duration-200"
                    onClick={clearAllFilters}
                  >
                    Clear all filters
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cars.map((car) => (
                  <div key={car.id || car.carName} className="border rounded-lg bg-white overflow-hidden relative shadow-sm hover:shadow-md transition-shadow duration-200">
                    {/* Wishlist Heart Icon */}
                    <button
                      className="absolute top-2 right-2 p-2 rounded-full transition-all z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        car.id && toggleWishlist(car.id);
                      }}
                    >
                      <Heart
                        size={20}
                        className={`${car.id && isWishlisted(car.id) ? 'text-teal-500 fill-teal-500 cursor-pointer' : 'text-gray-500 fill-white cursor-pointer'} transition-colors duration-200 `}
                      />
                    </button>

                    <img
                      src={car.carImages?.[0] || '/api/placeholder/400/320'}
                      alt={car.carName}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-800">{car.carName}</h3>
                      </div>
                      {isLoggedIn && car.distance !== undefined && (
                        <p className="text-sm text-gray-600 mt-1 flex items-center">
                          <MapPin size={14} className="mr-1 text-teal-500" />
                          <span className="font-medium">{car.distance.toFixed(2)} km away</span>
                        </p>
                      )}
                      <div className="mt-2">
                        <span className="font-bold text-lg text-gray-800">${car.pricePerHour}</span>
                        <span className="text-sm text-gray-600">/Day</span>
                      </div>
                      <button
                        className="mt-3 w-full bg-teal-400 text-white py-2 rounded-md text-sm hover:bg-teal-500 transition-all duration-200"
                        onClick={() => navigate(`/car-details/${car.id}`)}
                      >
                        View More
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error state - shown in the content area */}
      {error && (
        <div className="p-4 text-center">
          <div className="text-red-500 text-center">
            <p className="text-xl font-semibold mb-2">Error Loading Cars</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {cars.length > 0 && !loading && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <Footer />
    </div>
  );
}