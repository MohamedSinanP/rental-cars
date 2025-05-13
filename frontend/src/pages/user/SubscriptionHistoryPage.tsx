import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import DataTable from '../../components/DataTable';
import NavBar from '../../layouts/users/NavBar';
import Footer from '../../layouts/users/Footer';
import AccountSidebar from '../../layouts/users/AccountSidebar';
import Pagination from '../../components/Pagination';
import { getUserSubscriptions, cancelSubscription } from '../../services/apis/userApis';

// Define types based on your data model
type Subscription = {
  _id: string;
  subscriptionId: {
    _id: string;
    name: string;
    price: number;
  };
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
};


const SubscriptionHistory: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const limit = 6;

  useEffect(() => {
    fetchSubscriptions(currentPage, limit);

    // Check screen size on mount and resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [currentPage]);

  const fetchSubscriptions = async (page: number, limit: number) => {
    try {
      setLoading(true);
      // Assuming your API supports pagination parameters
      const result = await getUserSubscriptions(page, limit);

      // Update state with paginated data
      setSubscriptions(result.data.data);
      setCurrentPage(result.data.currentPage);
      setTotalPages(result.data.totalPages);
      setError(null);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setError('Failed to load subscription history. Please try again later.');
      toast.error('Failed to load subscription history');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscription: Subscription) => {
    try {
      await cancelSubscription(subscription._id);
      toast.success('Subscription cancelled successfully');
      fetchSubscriptions(currentPage, limit);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Responsive columns configuration
  const columns = [
    {
      key: 'subscriptionId.name',
      header: 'Plan Name',
      render: (item: Subscription) => (
        <span className="font-medium">{item.subscriptionId.name}</span>
      )
    },
    {
      key: 'currentPeriodStart',
      header: 'Period Start',
      render: (item: Subscription) => formatDate(item.currentPeriodStart),
      // Hide on very small screens
      hidden: () => window.innerWidth < 640
    },
    {
      key: 'currentPeriodEnd',
      header: 'Period End',
      render: (item: Subscription) => formatDate(item.currentPeriodEnd),
      // Hide on very small screens
      hidden: () => window.innerWidth < 640
    },
    {
      key: 'subscriptionId.price',
      header: 'Price',
      render: (item: Subscription) => (
        <span className="font-medium">${item.subscriptionId.price.toFixed(2)}/month</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Subscription) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'active' ? 'bg-green-100 text-green-800' :
          item.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </span>
      )
    }
  ];

  const actions = [
    {
      label: 'Cancel',
      className: (item: Subscription) =>
        item.status === 'active' && !item.cancelAtPeriodEnd
          ? 'bg-red-50 text-red-700 hover:bg-red-100'
          : 'hidden',
      onClick: handleCancelSubscription,
      isVisible: (item: Subscription) =>
        item.status === 'active' && !item.cancelAtPeriodEnd
    }
  ];

  // Handle page change - fetches new data from the backend
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Data fetching is handled by the useEffect that depends on currentPage
  };

  // Render card view for mobile displays
  const renderMobileSubscriptionCard = (subscription: Subscription) => {
    return (
      <div key={subscription._id} className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex justify-between items-start mb-2">
          <span className="font-medium text-base">{subscription.subscriptionId.name}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${subscription.status === 'active' ? 'bg-green-100 text-green-800' :
            subscription.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
          </span>
        </div>

        <div className="space-y-1 text-sm text-gray-600 mb-3">
          <div className="flex justify-between">
            <span>Price:</span>
            <span className="font-medium">${subscription.subscriptionId.price.toFixed(2)}/month</span>
          </div>
          <div className="flex justify-between">
            <span>Period Start:</span>
            <span>{formatDate(subscription.currentPeriodStart)}</span>
          </div>
          <div className="flex justify-between">
            <span>Period End:</span>
            <span>{formatDate(subscription.currentPeriodEnd)}</span>
          </div>
        </div>

        {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
          <button
            onClick={() => handleCancelSubscription(subscription)}
            className="w-full text-center px-3 py-2 rounded bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium"
          >
            Cancel Subscription
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NavBar />

      <div className="flex flex-1 flex-col md:flex-row">
        <AccountSidebar />

        <main className="flex-1 p-3 md:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">Subscription History</h1>

            {error && (
              <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700 text-sm md:text-base">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5 mr-2 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Mobile view - card layout */}
            {isMobile && (
              <div className="mb-4">
                {loading ? (
                  <div className="text-center py-8">Loading subscriptions...</div>
                ) : subscriptions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No subscription history found</div>
                ) : (
                  subscriptions.map(subscription => renderMobileSubscriptionCard(subscription))
                )}
              </div>
            )}

            {/* Desktop view - table layout */}
            {!isMobile && (
              <div className="overflow-x-auto">
                <DataTable
                  data={subscriptions}
                  columns={columns}
                  actions={actions}
                  loading={loading}
                  emptyMessage="No subscription history found"
                  title="Your Subscriptions"
                />
              </div>
            )}

            {subscriptions.length > 0 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}

            <div className="mt-6 md:mt-8 bg-white p-4 md:p-6 rounded-lg shadow">
              <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Subscription Information</h2>
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-start space-x-2">
                  <div className="h-5 w-5 md:h-6 md:w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-green-500"></span>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm md:text-base">Active Subscription</h3>
                    <p className="text-xs md:text-sm text-gray-600">Your subscription is currently active and will automatically renew at the end of the billing period.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="h-5 w-5 md:h-6 md:w-6 rounded-full bg-yellow-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-yellow-500"></span>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm md:text-base">Pending Cancellation</h3>
                    <p className="text-xs md:text-sm text-gray-600">Your subscription will remain active until the end of the current billing period and will not renew.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="h-5 w-5 md:h-6 md:w-6 rounded-full bg-red-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-red-500"></span>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm md:text-base">Canceled</h3>
                    <p className="text-xs md:text-sm text-gray-600">Your subscription has been canceled and is no longer active.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default SubscriptionHistory;