import { useEffect, useState } from 'react';
import { Lock, Unlock, Search, RefreshCw } from 'lucide-react';
import DataTable, { Column, Action } from '../../components/DataTable';
import Sidebar from '../../layouts/admin/Sidebar';
import { blockUser, fetchUsers } from '../../services/apis/adminApi';
import { toast } from 'react-toastify';
import Pagination from '../../components/Pagination';
import { IUsers } from '../../types/types';

const UsersPage = () => {
  const [users, setUsers] = useState<IUsers[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');

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

  const handleToggleBlock = async (user: IUsers) => {
    try {
      const result = await blockUser(user._id);
      const updatedUser = result.data;

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u._id === user._id ? { ...u, ...updatedUser } : u
        )
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Pass the search term to the API
        const result = await fetchUsers(currentPage, limit, debouncedSearchTerm);
        setUsers(result.data.data);
        setCurrentPage(result.data.currentPage);
        setTotalPages(result.data.totalPages);
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
    fetchUserData();
  }, [currentPage, debouncedSearchTerm]);

  // Define columns with responsive renderers
  const columns: Column<IUsers>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (user) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium">{user.userName?.charAt(0) || '?'}</span>
          </div>
          <div className="ml-2 sm:ml-4">
            <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-full">
              {user.userName}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      render: (user) => (
        <div className="text-xs sm:text-sm text-gray-600 truncate max-w-[150px] md:max-w-full">
          {user.email}
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => (
        <span className="px-2 py-1 sm:px-3 sm:py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          {user.role}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => (
        <span className={`px-2 py-1 sm:px-3 sm:py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
          {user.isBlocked ? 'Blocked' : 'Active'}
        </span>
      )
    },
  ];

  // Define actions
  const actions: Action<IUsers>[] = [
    {
      label: (user) => user.isBlocked ? 'Unblock' : 'Block',
      icon: (user) => user.isBlocked ? <Unlock size={16} /> : <Lock size={16} />,
      onClick: handleToggleBlock,
      className: (user) => user.isBlocked
        ? 'bg-green-50 text-green-700 hover:bg-green-100'
        : 'bg-red-50 text-red-700 hover:bg-red-100'
    }
  ];

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center h-64">
      <RefreshCw className="w-8 h-8 text-teal-500 animate-spin" />
      <p className="mt-2 text-sm text-gray-500">Loading users data...</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content - Made responsive and scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6">
          {/* Page title */}
          <div className="mb-4 lg:mb-6">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Users Management</h1>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Users
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
                placeholder="Search by name or email..."
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
                  data={users}
                  columns={columns}
                  actions={actions}
                  title="Users"
                  loading={false}
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

export default UsersPage;