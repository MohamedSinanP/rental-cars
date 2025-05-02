import { useEffect, useState } from 'react';
import { Search, MapPin, Heart, Star, ChevronDown } from 'lucide-react';
import NavBar from '../../layouts/users/NavBar';
import Footer from '../../layouts/users/Footer';
import { ICar } from '../../types/types';
import { getCars } from '../../services/apis/userApis';
import { Link, useNavigate } from 'react-router-dom';
import Pagination from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';

interface Filters {
  carType: string[];
  transmission: string[];
  fuelType: string[];
  seats: string[];
  priceRange: [number, number];
  fuel: string[];
  ratings: string[];
}

interface ExpandedSections {
  carDetails: boolean;
  transmission: boolean;
  fuelType: boolean;
  seats: boolean;
  totalPrice: boolean;
  fuel: boolean;
  userRatings: boolean;
}

export default function CarListingPage() {
  // State for filters
  const [filters, setFilters] = useState<Filters>({
    carType: [],
    transmission: [],
    fuelType: [],
    seats: [],
    priceRange: [0, 5000],
    fuel: [],
    ratings: [],
  });

  // State for cars, loading, and error
  const navigate = useNavigate();
  const [cars, setCars] = useState<ICar[]>([]);
  const [filteredCars, setFilteredCars] = useState<ICar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;

  // State for expanded filter sections
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    carDetails: true,
    transmission: false,
    fuelType: false,
    seats: false,
    totalPrice: false,
    fuel: false,
    userRatings: false,
  });

  // Fetch cars from API
  const fetchCars = async (): Promise<void> => {
    try {
      setLoading(true);
      const result = await getCars(currentPage, limit,);
      const data: ICar[] = Array.isArray(result) ? result : result.data.data || [];

      if (!data.length) {
        console.warn('No cars found in response');
      }
      console.log(result, "thekk");

      setCars(data);
      setCurrentPage(result.data.currentPage);
      setTotalPages(result.data.totalPages);
      setFilteredCars(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Fetch Error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleFilterChange = (
    filterKey: keyof Omit<Filters, 'priceRange'>,
    value: string,
    isChecked: boolean
  ): void => {
    setFilters((prevFilters) => {
      const updatedFilter = isChecked
        ? [...prevFilters[filterKey], value]
        : prevFilters[filterKey].filter((item) => item !== value);

      return { ...prevFilters, [filterKey]: updatedFilter };
    });
  };

  // Apply filters to car list
  useEffect(() => {
    // Skip filtering if still loading or no cars
    if (loading || !cars.length) {
      return;
    }

    let result = [...cars];

    // Filter by carType
    if (filters.carType.length > 0) {
      result = result.filter((car) => car.carType && filters.carType.includes(car.carType));
    }

    // Filter by transmission
    if (filters.transmission.length > 0) {
      result = result.filter((car) =>
        car.transmission && filters.transmission.includes(car.transmission)
      );
    }

    // Filter by fuelType
    if (filters.fuelType.length > 0) {
      result = result.filter((car) =>
        car.fuelType && filters.fuelType.includes(car.fuelType)
      );
    }

    // Filter by seats
    if (filters.seats.length > 0) {
      result = result.filter((car) => car.seats && filters.seats.includes(car.seats));
    }

    // Filter by priceRange
    result = result.filter(
      (car) =>
        car.pricePerDay != null &&
        car.pricePerDay >= filters.priceRange[0] &&
        car.pricePerDay <= filters.priceRange[1]
    );

    // Filter by fuel
    if (filters.fuel.length > 0) {
      result = result.filter((car) =>
        car.fuelOption && filters.fuel.includes(car.fuelOption)
      );
    }

    // Filter by ratings (disabled since rating is optional)
    /*
    if (filters.ratings.length > 0) {
      result = result.filter((car) =>
        filters.ratings.some((rating) => {
          if (rating === 'All') return true;
          const minRating = parseFloat(rating.match(/[\d.]+/)?.[0] || '0');
          return car.rating ? car.rating >= minRating : false;
        })
      );
    }
    */

    console.log('Filtered Cars:', result); // Debug filtered result
    setFilteredCars(result);
  }, [filters, cars, loading]);

  // Toggle filter section
  const toggleSection = (section: keyof ExpandedSections): void => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Mock filter options (replace with dynamic data if available)
  const filterOptions: Omit<Filters, 'priceRange'> = {
    carType: ['Hatchback', 'SUV', 'Pickup', 'Sedan', 'Luxury', 'Van'],
    transmission: ['Manual', 'Automatic'],
    fuelType: ['Petrol', 'Diesel', 'Electric', 'CNG'],
    seats: ['4/5 Seater', '6/7 Seater'],
    fuel: ['With Fuel', 'Without Fuel'],
    ratings: ['4.5+ Ratings', '4.0+ Ratings', '3.0+ Ratings', 'All'],
  };

  // If loading, show full-page loading spinner
  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto">
        <NavBar />
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <div className="max-w-screen-xl mx-auto">
        <NavBar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-red-500 text-center">
            <p className="text-xl font-semibold mb-2">Error Loading Cars</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto">
      <NavBar />

      {/* Search Section */}
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
                className="w-full pl-4 pr-32 py-3 rounded-md border border-gray-300 text-sm focus:outline-teal-400"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const query = e.target.value.toLowerCase();
                  setFilteredCars(
                    cars.filter(
                      (car) =>
                        car.carName.toLowerCase().includes(query) ||
                        (car.location && car.location.address.toLowerCase().includes(query))
                    )
                  );
                }}
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-teal-500 hover:bg-teal-600 text-white text-sm px-4 py-2 rounded-md flex items-center gap-1">
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

      {/* Main content */}
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-64 bg-gray-50 p-4 border-r">
          {Object.keys(filterOptions).map((filterKey) => (
            <div className="mb-6" key={filterKey}>
              <div
                className="flex justify-between items-center font-semibold mb-3 cursor-pointer"
                onClick={() => toggleSection(filterKey as keyof ExpandedSections)}
              >
                <h3>{filterKey.replace(/([A-Z])/g, ' $1').trim()}</h3>
                <ChevronDown
                  size={20}
                  className={`transition-transform ${expandedSections[filterKey as keyof ExpandedSections] ? 'rotate-180' : ''
                    }`}
                />
              </div>
              {expandedSections[filterKey as keyof ExpandedSections] && (
                <div className="space-y-2">
                  {filterOptions[filterKey as keyof typeof filterOptions].map((option: string) => (
                    <label className="flex items-center space-x-2" key={option}>
                      <input
                        type="checkbox"
                        className="form-checkbox accent-teal-500"
                        checked={filters[filterKey as keyof Omit<Filters, 'priceRange'>].includes(
                          option
                        )}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleFilterChange(
                            filterKey as keyof Omit<Filters, 'priceRange'>,
                            option,
                            e.target.checked
                          )
                        }
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
          {/* Price Range Filter */}
          <div className="mb-6">
            <div
              className="flex justify-between items-center font-semibold mb-3 cursor-pointer"
              onClick={() => toggleSection('totalPrice')}
            >
              <h3>Total Price</h3>
              <ChevronDown
                size={20}
                className={`transition-transform ${expandedSections.totalPrice ? 'rotate-180' : ''}`}
              />
            </div>
            {expandedSections.totalPrice && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>${filters.priceRange[0]}</span>
                  <span>Min Price</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  value={filters.priceRange[1]}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFilters((prev) => ({
                      ...prev,
                      priceRange: [prev.priceRange[0], parseInt(e.target.value)],
                    }))
                  }
                  className="w-full"
                />
                <div className="flex justify-between">
                  <span>${filters.priceRange[1]}</span>
                  <span>Max Price</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Car listings */}
        <div className="flex-1 p-4">
          {filteredCars.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No cars match your filters.</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredCars.map((car) => (
              <div key={car._id || car.carName} className="border rounded-lg bg-white overflow-hidden relative">
                <button className="absolute top-2 right-2 bg-white p-1 rounded-full">
                  <Heart size={20} />
                </button>
                <img
                  src={car.carImages[0] || '/api/placeholder/400/320'}
                  alt={car.carName}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{car.carName}</h3>
                    <div className="flex items-center">
                      <Star size={16} className="text-teal-400 fill-current" />
                    </div>
                  </div>

                  {/* Display only distance with icon */}
                  {car.distance && (
                    <p className="text-sm text-gray-600 mt-1 flex items-center">
                      <MapPin size={14} className="mr-1 text-teal-500" />
                      <span className="font-medium">{car.distance.toFixed(2)} km away</span>
                    </p>
                  )}

                  <div className="mt-2">
                    <span className="font-bold text-lg">${car.pricePerDay}</span>
                    <span className="text-sm text-gray-600">/Day</span>
                  </div>
                  <button
                    className="mt-3 w-full bg-teal-400 text-white py-2 rounded-md text-sm"
                    onClick={() => {
                      navigate(`/car-details/${car._id}`)
                    }}
                  >
                    View More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      <Footer />
    </div>
  );
}