import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import DataTable, { DataItem } from '../../components/DataTable';
import NavBar from '../../layouts/users/NavBar';
import Footer from '../../layouts/users/Footer';
import AccountSidebar from '../../layouts/users/AccountSidebar';
import Pagination from '../../components/Pagination';
import { getUserWishlist, removeFromWishlist } from '../../services/apis/userApis';
import { useNavigate } from 'react-router-dom';

// Define types based on your data model
type Car = {
  id: string;
  carName: string;
  carModel: string;
  carType: string;
  seats: string;
  transmission: string;
  fuelType: string;
  fuelOption: string;
  carImages: string[];
  status: 'Available' | 'Booked' | 'Unavailable' | 'UnderMaintenance' | 'PendingApproval' | 'Archived';
  pricePerHour: number;
  deposit: number;
};

// Define wishlist item type that maps to your IWishlistModel
type WishlistItem = {
  car: Car;
  addedAt: string;
};

// Define a transformed type for DataTable compatibility
type TransformedWishlistItem = DataItem & {
  id: string; // Mapped from car.id
  car: Car; // Full car object
  addedAt: string;
};

const UserWishlist: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<TransformedWishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const limit = 6;

  useEffect(() => {
    fetchWishlist(currentPage, limit);

    // Check screen size on mount and resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [currentPage]);

  const fetchWishlist = async (page: number, limit: number) => {
    try {
      setLoading(true);
      const result = await getUserWishlist(page, limit);

      const transformedItems: TransformedWishlistItem[] = result.data.data.map((item: WishlistItem) => ({
        id: item.car.id,
        car: item.car,
        addedAt: item.addedAt,
      }));

      setWishlistItems(transformedItems);
      setCurrentPage(result.data.currentPage);
      setTotalPages(result.data.totalPages);
      setError(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to load wishlist. Please try again later.');
      }
    }
    finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (item: TransformedWishlistItem) => {
    try {
      await removeFromWishlist(item.id);
      fetchWishlist(currentPage, limit);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Can't remove car from your wishlist");
      }
    }
  };

  const handleRentCar = (item: TransformedWishlistItem) => {
    navigate(`/cars/booking/${item.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Responsive columns configuration
  const columns = [
    {
      key: 'car.carImages',
      header: 'Car Image',
      render: (item: TransformedWishlistItem) => (
        <div className="w-16 h-12 md:w-20 md:h-16 overflow-hidden rounded-md">
          <img
            src={item.car.carImages[0] || '/api/placeholder/200/120'}
            alt={`${item.car.carName} ${item.car.carModel}`}
            className="w-full h-full object-cover"
          />
        </div>
      ),
    },
    {
      key: 'car.carName',
      header: 'Car Name',
      render: (item: TransformedWishlistItem) => (
        <span className="font-medium">{item.car.carName}</span>
      ),
    },
    {
      key: 'car.carModel',
      header: 'Model',
      render: (item: TransformedWishlistItem) => <span>{item.car.carModel}</span>,
    },
    {
      key: 'car.pricePerHour',
      header: 'Price',
      render: (item: TransformedWishlistItem) => (
        <span className="font-medium">${item.car.pricePerHour.toFixed(2)}/hour</span>
      ),
    },
    {
      key: 'car.status',
      header: 'Status',
      render: (item: TransformedWishlistItem) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${item.car.status === 'Available'
            ? 'bg-green-100 text-green-800'
            : item.car.status === 'Booked'
              ? 'bg-yellow-100 text-yellow-800'
              : item.car.status === 'UnderMaintenance'
                ? 'bg-orange-100 text-orange-800'
                : 'bg-red-100 text-red-800'
            }`}
        >
          {item.car.status}
        </span>
      ),
    },
    {
      key: 'addedAt',
      header: 'Added On',
      render: (item: TransformedWishlistItem) => formatDate(item.addedAt),
      // Note: hidden property is not used by DataTable; handled by CSS or custom logic
      hidden: () => window.innerWidth < 640,
    },
  ];

  const actions = [
    {
      label: 'Remove',
      className: 'bg-red-50 text-red-700 hover:bg-red-100',
      onClick: handleRemoveFromWishlist,
      isVisible: () => true,
    },
    {
      label: 'Rent',
      className: (item: TransformedWishlistItem) =>
        item.car.status === 'Available'
          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
          : 'bg-gray-50 text-gray-400 cursor-not-allowed',
      onClick: (item: TransformedWishlistItem) => {
        if (item.car.status === 'Available') {
          handleRentCar(item);
        } else {
          toast.info('This car is not available for rent at the moment');
        }
      },
      isVisible: () => true,
    },
  ];

  // Handle page change - fetches new data from the backend
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Render card view for mobile displays
  const renderMobileWishlistCard = (item: TransformedWishlistItem) => {
    return (
      <div key={item.id} className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex space-x-3">
          <div className="w-24 h-20 flex-shrink-0 overflow-hidden rounded-md">
            <img
              src={item.car.carImages[0] || '/api/placeholder/150/100'}
              alt={`${item.car.carName} ${item.car.carModel}`}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium text-base">
                {item.car.carName} {item.car.carModel}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${item.car.status === 'Available'
                  ? 'bg-green-100 text-green-800'
                  : item.car.status === 'Booked'
                    ? 'bg-yellow-100 text-yellow-800'
                    : item.car.status === 'UnderMaintenance'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-red-100 text-red-800'
                  }`}
              >
                {item.car.status}
              </span>
            </div>

            <div className="space-y-1 text-sm text-gray-600 mb-3">
              <div className="flex justify-between">
                <span>Price:</span>
                <span className="font-medium">${item.car.pricePerHour.toFixed(2)}/hour</span>
              </div>
              <div className="flex justify-between">
                <span>Added On:</span>
                <span>{formatDate(item.addedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-2 mt-3">
          <button
            onClick={() => handleRemoveFromWishlist(item)}
            className="flex-1 text-center px-3 py-2 rounded bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium"
          >
            Remove
          </button>
          <button
            onClick={() => {
              if (item.car.status === 'Available') {
                handleRentCar(item);
              } else {
                toast.info('This car is not available for rent at the moment');
              }
            }}
            className={`flex-1 text-center px-3 py-2 rounded text-sm font-medium ${item.car.status === 'Available'
              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
          >
            Rent
          </button>
        </div>
      </div>
    );
  };

  // Render loading state for mobile
  const renderMobileLoadingState = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-4 animate-pulse">
          <div className="flex space-x-3">
            <div className="w-24 h-20 bg-gray-200 rounded-md"></div>
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
              <div className="space-y-1 mb-3">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-2 mt-3">
            <div className="flex-1 h-9 bg-gray-200 rounded"></div>
            <div className="flex-1 h-9 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render content based on loading state and device type
  const renderContent = () => {
    if (loading) {
      // Show loading state while keeping the sidebar visible
      return isMobile ? (
        renderMobileLoadingState()
      ) : (
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex items-center">
                <div className="w-16 h-12 bg-gray-200 rounded mr-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/5 mr-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6 mr-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6 mr-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/8 mr-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/8"></div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700 text-sm md:text-base">
          <AlertCircle className="h-4 w-4 md:h-5 md:w-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      );
    }

    if (wishlistItems.length === 0) {
      return (
        <div className="text-center py-8 bg-white rounded-lg shadow p-6 text-gray-500">
          Your wishlist is empty
        </div>
      );
    }

    // Render normal content based on device type
    return isMobile ? (
      wishlistItems.map((item) => renderMobileWishlistCard(item))
    ) : (
      <div className="overflow-x-auto">
        <DataTable
          data={wishlistItems}
          columns={columns}
          actions={actions}
          loading={false}
          emptyMessage="Your wishlist is empty"
          title="Your Wishlist"
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pt-20">
      <NavBar />

      <div className="flex flex-1 flex-col md:flex-row">
        <AccountSidebar />

        <main className="flex-1 p-3 md:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">My Wishlist</h1>

            {renderContent()}

            {!loading && wishlistItems.length > 0 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default UserWishlist;