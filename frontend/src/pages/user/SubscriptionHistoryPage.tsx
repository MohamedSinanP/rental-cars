import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import DataTable from '../../components/DataTable';
import NavBar from '../../layouts/users/NavBar';
import Footer from '../../layouts/users/Footer';
import AccountSidebar from '../../layouts/users/AccountSidebar';
import Pagination from '../../components/Pagination';
import ActiveSubscriptionCard from '../../components/ActiveSubscriptionCard';
import { getUserSubscriptions, getActiveSubscription } from '../../services/apis/userApis';

// Define types based on your data model
type Subscription = {
  id: string;
  subscriptionId: {
    id: string;
    name: string;
    price: number;
  };
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
};

type ActiveSubscription = Subscription | null;

const SubscriptionHistory: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<ActiveSubscription>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSubLoading, setActiveSubLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSubError, setActiveSubError] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const limit = 6;

  useEffect(() => {
    fetchActiveSubscription();
    fetchSubscriptions(currentPage, limit);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [currentPage]);

  const fetchActiveSubscription = async () => {
    try {
      setActiveSubLoading(true);
      const result = await getActiveSubscription();

      if (result.data && Object.keys(result.data).length > 0) {
        setActiveSubscription(result.data);
        setActiveSubError(null);
      } else {
        setActiveSubscription(null);
        setActiveSubError(null);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setActiveSubError(error.message);
      } else {
        setActiveSubError('Failed to load active subscription. Please try again later.');
      }
      setActiveSubscription(null);
    } finally {
      setActiveSubLoading(false);
    }
  };

  const fetchSubscriptions = async (page: number, limit: number) => {
    try {
      setLoading(true);
      const result = await getUserSubscriptions(page, limit);
      setSubscriptions(result.data.data);
      setCurrentPage(result.data.currentPage);
      setTotalPages(result.data.totalPages);
      setError(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to load subscription history. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSuccess = () => {
    fetchActiveSubscription();
    fetchSubscriptions(currentPage, limit);
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
            item.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
          }`}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </span>
      )
    }
  ];

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Render card view for mobile displays
  const renderMobileSubscriptionCard = (subscription: Subscription) => {
    return (
      <div key={subscription.id} className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex justify-between items-start mb-2">
          <span className="font-medium text-base">{subscription.subscriptionId.name}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${subscription.status === 'active' ? 'bg-green-100 text-green-800' :
            subscription.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              subscription.status === 'completed' ? 'bg-blue-100 text-blue-800' :
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
      </div>
    );
  };

  // Render loading state for mobile subscriptions
  const renderMobileLoadingState = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-4 animate-pulse">
          <div className="flex justify-between items-start mb-2">
            <div className="h-5 bg-gray-200 rounded w-2/5 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-1/5"></div>
          </div>
          <div className="space-y-2 mb-3">
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/5"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render loading state for the active subscription card
  const renderActiveSubscriptionLoadingState = () => (
    <div className="bg-white rounded-lg shadow p-6 mb-6 animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {[...Array(4)].map((_, index) => (
          <div key={index}>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 pt-4">
        <div className="h-10 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  );

  // Render content based on loading state and device type
  const renderContent = () => {
    if (loading) {
      return isMobile ? (
        renderMobileLoadingState()
      ) : (
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex items-center">
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

    if (subscriptions.length === 0) {
      return (
        <div className="text-center py-8 bg-white rounded-lg shadow p-6 text-gray-500">
          No subscription history found
        </div>
      );
    }

    // Render normal content based on device type
    return isMobile ? (
      subscriptions.map((subscription) => renderMobileSubscriptionCard(subscription))
    ) : (
      <div className="overflow-x-auto">
        <DataTable
          data={subscriptions}
          columns={columns}
          actions={[]}
          loading={false}
          emptyMessage="No subscription history found"
          title="Your Subscriptions"
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
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">Subscription Management</h1>

            {/* Active Subscription Card with Loading State */}
            {activeSubLoading ? (
              renderActiveSubscriptionLoadingState()
            ) : (
              <ActiveSubscriptionCard
                subscription={activeSubscription}
                loading={false}
                error={activeSubError}
                onCancelSuccess={handleCancelSuccess}
              />
            )}

            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Subscription History</h2>

            {renderContent()}

            {!loading && subscriptions.length > 0 && (
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
                    <p className="text-xs md:text-sm text-gray-600">Your subscription is currently active.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="h-5 w-5 md:h-6 md:w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-blue-500"></span>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm md:text-base">Completed</h3>
                    <p className="text-xs md:text-sm text-gray-600">
                      Your subscription has ended. You no longer have access to the subscribed services.
                    </p>
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