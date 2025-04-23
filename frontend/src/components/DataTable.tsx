import { Lock, Unlock } from 'lucide-react';
import { IUsers } from '../types/types';

type Column<T> = {
  key: keyof T | string;
  header: string;
};

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  loading?: boolean;
  onToggleBlock: (id: string) => void;
};

const DataTable = <T extends IUsers>({
  data,
  columns,
  title = 'Users',
  onToggleBlock,
  loading = false,
}: DataTableProps<T>) => {
  const renderCell = (item: T, column: Column<T>) => {
    switch (column.key) {
      case 'name':
        return (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium">{item.userName?.charAt(0) || '?'}</span>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">{item.userName}</div>
            </div>
          </div>
        );
      case 'email':
        return <div className="text-sm text-gray-600">{item.email}</div>;
      case 'role':
        return (
          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(item.role)}`}>
            {item.role}
          </span>
        );
      case 'status':
        return (
          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {item.isBlocked ? 'Blocked' : 'Active'}
          </span>
        );
      case 'commission':
        return (
          <div className="text-sm text-gray-600">
            <span className="font-medium">{item.commission}%</span>
          </div>
        );
      default:
        const value = item[column.key as keyof T];
        return <span>{String(value ?? '')}</span>;
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800';
      case 'Editor':
        return 'bg-blue-100 text-blue-800';
      case 'Owner':
        return 'bg-orange-100 text-orange-800';
      case 'User':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">Loading data...</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="border-b border-gray-200">
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.header}
                  </th>
                ))}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={`${item._id}-${String(column.key)}`} className="px-6 py-4 whitespace-nowrap">
                      {renderCell(item, column)}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => onToggleBlock(item._id)}
                      className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${item.isBlocked
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                    >
                      {item.isBlocked ? (
                        <>
                          <Unlock size={16} className="mr-1" />
                          Unblock
                        </>
                      ) : (
                        <>
                          <Lock size={16} className="mr-1" />
                          Block
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.length === 0 && (
            <div className="text-center py-6">
              <p className="text-gray-500">No data found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataTable;
