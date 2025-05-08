import { useEffect, useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import DataTable, { Column, Action } from '../../components/DataTable';
import Sidebar from '../../layouts/admin/Sidebar';
import { fetchUserSubscriptions, updateSubscriptionStatus } from '../../services/apis/adminApi';
import { toast } from 'react-toastify';
import Pagination from '../../components/Pagination';

// Define the interface for user subscription
interface IUserSubscription {
  _id: string;
  userId: {
    _id: string;
    userName: string;
    email: string;
  };
  subscriptionId: {
    _id: string;
    name: string;
    price: number;
  };
  stripeSubscriptionId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

const UserSubscriptionPage = () => {
  const [subscriptions, setSubscriptions] = useState<IUserSubscription[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');

  // Log component mount
  useEffect(() => {
    console.log('UserSubscriptionPage mounted');
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      console.log('Starting fetchSubscriptionData', { currentPage, debouncedSearchTerm });
      try {
        setLoading(true);
        console.log('Fetching subscriptions...');
        const result = await fetchUserSubscriptions(currentPage, limit, debouncedSearchTerm);
        console.log('API result:', result);

        // Ensure data is an array, default to empty array if not
        setSubscriptions(result.data.data);
        setCurrentPage(result.currentPage || 1);
        setTotalPages(result.totalPages || 1);
      } catch (error: unknown) {
        console.error('Error in fetchSubscriptionData:', error);
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Something went wrong');
        }
        // Set subscriptions to empty array on error to prevent map issues
        setSubscriptions([]);
      } finally {
        setLoading(false);
        console.log('fetchSubscriptionData completed');
      }
    };
    fetchSubscriptionData();
  }, [currentPage, debouncedSearchTerm]);

  // Handle status update
  const handleStatusUpdate = async (subscriptionId: string, newStatus: string) => {
    try {
      await updateSubscriptionStatus(subscriptionId, newStatus);

      // Update local state
      setSubscriptions(prev =>
        prev.map(sub =>
          sub._id === subscriptionId ? { ...sub, status: newStatus } : sub
        )
      );

      toast.success(`Subscription status updated to ${newStatus}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Something went wrong');
      }
    }
  };

  // Format date to readable string
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Define columns
  const columns: Column<IUserSubscription>[] = [
    {
      key: 'user',
      header: 'User',
      render: (subscription) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium">{subscription.userId?.userName?.charAt(0) || '?'}</span>
          </div>
          <div className="ml-2 sm:ml-4">
            <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-full">
              {subscription.userId?.userName || 'Unknown User'}
            </div>
            <div className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-full">
              {subscription.userId?.email || 'No email'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'subscription',
      header: 'Subscription Plan',
      render: (subscription) => (
        <div className="text-xs sm:text-sm text-gray-600">
          <div className="font-medium">{subscription.subscriptionId?.name || 'Unknown Plan'}</div>
          <div className="text-gray-500">${subscription.subscriptionId?.price || '0'}/month</div>
        </div>
      )
    },
    {
      key: 'period',
      header: 'Period',
      render: (subscription) => (
        <div className="text-xs sm:text-sm text-gray-600">
          <div>{formatDate(subscription.currentPeriodStart)} - </div>
          <div>{formatDate(subscription.currentPeriodEnd)}</div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (subscription) => {
        let statusColor = '';
        switch (subscription.status.toLowerCase()) {
          case 'active':
            statusColor = 'bg-green-100 text-green-800';
            break;
          case 'cancelled':
            statusColor = 'bg-red-100 text-red-800';
            break;
          case 'completed':
            statusColor = 'bg-blue-100 text-blue-800';
            break;
          default:
            statusColor = 'bg-gray-100 text-gray-800';
        }

        return (
          <span className={`px-2 py-1 sm:px-3 sm:py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>
            {subscription.status}
          </span>
        );
      }
    }
  ];

  // Define actions for status update
  const actions: Action<IUserSubscription>[] = [
    {
      label: 'Update Status',
      onClick: (subscription) => { }, // Empty onClick as we use render for dropdown
      render: (subscription) => (
        <select
          value={subscription.status}
          onChange={(e) => handleStatusUpdate(subscription._id, e.target.value)}
          className="px-3 py-1 rounded text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {['active', 'cancelled', 'completed'].map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      )
    }
  ];

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center h-64">
      <RefreshCw className="w-8 h-8 text-teal-500 animate-spin" />
      <p className="mt-2 text-sm text-gray-500">Loading subscription data...</p>
    </div>
  );

  return (
    <div className="flex h-full">
      {/* Sidebar is always visible, regardless of loading state */}
      <Sidebar />

      {/* Main Content - Made responsive to adapt to sidebar */}
      <div className="flex-1 min-w-0 overflow-x-auto bg-gray-50">
        <div className="p-4 lg:p-6">
          {/* Page title */}
          <div className="mb-4 lg:mb-6">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-800">User Subscriptions</h1>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Subscriptions
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200"
                placeholder="Search by user name or email..."
              />
            </div>
          </div>

          {/* Table with horizontal scroll on small screens */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <LoadingSpinner />
              ) : (
                <DataTable
                  data={subscriptions}
                  columns={columns}
                  actions={actions}
                  title="User Subscriptions"
                  loading={false} // Always false because we handle loading state separately
                  emptyMessage="No subscription data found"
                />
              )}
            </div>
          </div>

          {/* Pagination - only show when not loading */}
          {!loading && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSubscriptionPage;