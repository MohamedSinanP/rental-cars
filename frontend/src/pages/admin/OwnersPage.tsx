import { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable';
import Sidebar from '../../layouts/admin/Sidebar';
import { toast } from 'react-toastify';
import { fetchOwners } from '../../services/apis/adminApi';
import { IUsers } from '../../types/types';


const OwnersPage = () => {
  const [users, setUsers] = useState<IUsers[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const handleToggleBlock = async (userId: string) => {
  };
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const result = await fetchOwners();
        setUsers(result.data);
      } catch (err) {
        toast.error('Error fetching users');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    { key: 'commision', header: 'Commision(%)' },
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
            title="Owners"
            loading={loading}
            onToggleBlock={handleToggleBlock}
          />
        </div>
      </div>
    </>
  );
};

export default OwnersPage;
