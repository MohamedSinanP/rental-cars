import { useEffect, useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const limit = 6;
  const [loading, setLoading] = useState<boolean>(true);

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
    };
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const result = await fetchUsers(currentPage, limit);
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
  }, [currentPage]);

  // Define columns with custom renderers
  const columns: Column<IUsers>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (user) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium">{user.userName?.charAt(0) || '?'}</span>
          </div>
          <div className="ml-2 md:ml-4">
            <div className="text-xs md:text-sm font-medium text-gray-900">{user.userName}</div>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      render: (user) => <div className="text-xs md:text-sm text-gray-600">{user.email}</div>
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => (
        <span className="px-2 py-1 md:px-3 md:py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          {user.role}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => (
        <span className={`px-2 py-1 md:px-3 md:py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex flex-col md:flex-row">
      {/* Mobile menu button */}
      <div className="md:hidden p-4">
        <button
          onClick={toggleSidebar}
          className="text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>

      {/* Sidebar - hidden on mobile by default, shown when menu button is clicked */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block`}>
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 p-2 md:p-6">
        <DataTable
          data={users}
          columns={columns}
          actions={actions}
          title="Users"
          loading={loading}
        />
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default UsersPage;