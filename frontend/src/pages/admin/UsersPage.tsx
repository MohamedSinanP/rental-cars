import { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable';
import Sidebar from '../../layouts/admin/Sidebar';
import { fetchUsers } from '../../services/apis/adminApi';
import { toast } from 'react-toastify';
import Pagination from '../../components/Pagination';
import { IUsers } from '../../types/types';


const UsersPage = () => {
  const [users, setUsers] = useState<IUsers[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  const handleToggleBlock = async (userId: string) => {
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
        setError('Failed to fetch users. Please try again.');
        toast.error('Error fetching users');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [currentPage]);

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    { key: 'status', header: 'Status' },
  ];

  return (
    <>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <DataTable
            data={users}
            columns={columns}
            title="Users"
            loading={loading}
            onToggleBlock={handleToggleBlock}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div >
    </>
  );
};

export default UsersPage;
