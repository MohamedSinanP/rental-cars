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
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const result = await fetchUsers(currentPage, limit);
        setUsers(result.data.data);
        setCurrentPage(result.data.currentPage);
        setTotalPages(result.data.totalPages);
      } catch (err) {
        toast.error('Error fetching users');
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
          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium">{user.userName?.charAt(0) || '?'}</span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{user.userName}</div>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      render: (user) => <div className="text-sm text-gray-600">{user.email}</div>
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => (
        <span className={"px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"}>
          {user.role}
        </span >
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          } `}>
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

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <DataTable
          data={users}
          columns={columns}
          actions={actions}
          title="Users"
          loading={loading}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default UsersPage;