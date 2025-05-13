import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import { PencilIcon, PlusIcon } from 'lucide-react';
import Sidebar from '../../layouts/admin/Sidebar';
import SubscriptionModal, { Subscription } from '../../components/SubscriptionModal';
import { fetchSubscriptions } from '../../services/apis/adminApi';

const SubscriptionPage = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch subscriptions on component mount
  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        const result = await fetchSubscriptions();
        setSubscriptions(result.data);
      } catch (err) {
        setError('Failed to fetch subscriptions');
        console.error(err);
      }
    };
    loadSubscriptions();
  }, []);

  const columns = [
    {
      key: 'name',
      header: 'Plan Name',
      className: 'font-medium text-gray-900'
    },
    {
      key: 'description',
      header: 'Description',
      className: 'max-w-xs truncate hidden md:table-cell'
    },
    {
      key: 'price',
      header: 'Price',
      render: (item: Subscription) => (
        <span>${item.price.toFixed(2)} <span className="text-gray-500 text-xs">/{item.billingCycle}</span></span>
      )
    },
    {
      key: 'features',
      header: 'Features',
      className: 'hidden lg:table-cell',
      render: (item: Subscription) => (
        <div className="max-w-xs truncate">
          {item.features.slice(0, 2).join(', ')}
          {item.features.length > 2 && <span className="text-gray-500"> +{item.features.length - 2} more</span>}
        </div>
      )
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (item: Subscription) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.isActive
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
          }`}>
          {item.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  const actions = [
    {
      label: '',
      icon: () => <PencilIcon size={16} />,
      onClick: (item: Subscription) => {
        setCurrentSubscription(item);
        setIsEditing(true);
        setShowModal(true);
      },
      className: 'bg-teal-50 text-teal-700 hover:bg-teal-100',
    }
  ];

  // Handle form submission from modal
  const handleSubmitModal = (newSubscription: Subscription, mode: 'add' | 'edit') => {
    if (mode === 'edit') {
      setSubscriptions(prev =>
        prev.map(sub =>
          sub._id === newSubscription._id
            ? newSubscription
            : sub
        )
      );
    } else {
      setSubscriptions(prev => [...prev, newSubscription]);
    }
    resetModal();
  };

  // Reset modal state
  const resetModal = () => {
    setCurrentSubscription(null);
    setIsEditing(false);
    setShowModal(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Subscription Plans</h1>
                {error && <p className="text-red-600 mt-2">{error}</p>}
              </div>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setCurrentSubscription(null);
                  setShowModal(true);
                }}
                className="mt-4 sm:mt-0 inline-flex items-center px-3 py-2 md:px-4 md:py-2 bg-teal-600 border border-transparent rounded-md font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 text-sm"
              >
                <PlusIcon size={18} className="mr-1 md:mr-2" />
                Add Plan
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <DataTable
                data={subscriptions}
                columns={columns}
                actions={actions}
                emptyMessage="No subscription plans found"
                headerClassName="text-lg font-semibold text-gray-800"
              />
            </div>
          </div>
        </main>
      </div>

      {/* Subscription Modal Component */}
      <SubscriptionModal
        isOpen={showModal}
        isEditing={isEditing}
        currentSubscription={currentSubscription}
        onClose={resetModal}
        onSubmit={handleSubmitModal}
      />
    </div>
  );
};

export default SubscriptionPage;