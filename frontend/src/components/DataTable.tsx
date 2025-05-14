import { ReactNode } from 'react';
import LoadingSpinner from './LoadingSpinner';

// Define a minimal DataItem type
export type DataItem = {
  _id: string;
};

// Update Column and Action to use T extends DataItem
export type Column<T extends DataItem> = {
  key: keyof T | string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
};

export type Action<T extends DataItem> = {
  label: string | ((item: T) => string);
  icon?: ReactNode | ((item: T) => ReactNode);
  onClick: (item: T) => void;
  className?: string | ((item: T) => string);
  isVisible?: (item: T) => boolean;
  render?: (item: T) => ReactNode;
};

interface DataTableProps<T extends DataItem> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  title?: string;
  loading?: boolean;
  emptyMessage?: string;
  headerClassName?: string;
  rowClassName?: (item: T) => string;
}

const DataTable = <T extends DataItem>({
  data,
  columns,
  actions = [],
  title,
  loading = false,
  emptyMessage = 'No data found',
  headerClassName = 'text-xl font-semibold text-gray-800',
  rowClassName = () => 'hover:bg-gray-50',
}: DataTableProps<T>) => {
  // Default render function
  const defaultRender = (item: T, key: keyof T | string) => {
    const getNestedValue = (obj: Record<string, unknown>, path: string[]): unknown => {
      if (path.length === 0) return obj;
      const [first, ...rest] = path;
      const value = obj[first];
      if (!value || typeof value !== 'object') {
        return rest.length === 0 ? value : undefined;
      }
      return getNestedValue(value as Record<string, unknown>, rest);
    };

    const value = key.toString().includes('.')
      ? getNestedValue(item as Record<string, unknown>, key.toString().split('.'))
      : item[key as keyof T];

    return <span>{value !== undefined && value !== null ? String(value) : ''}</span>;
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow">
      {title && (
        <div className="flex justify-between items-center mb-6">
          <h2 className={headerClassName}>{title}</h2>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="border-b border-gray-200">
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                  >
                    {column.header}
                  </th>
                ))}
                {actions.length > 0 && (
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item) => (
                <tr key={item._id} className={rowClassName(item)}>
                  {columns.map((column) => (
                    <td
                      key={`${item._id}-${String(column.key)}`}
                      className={`px-6 py-4 whitespace-nowrap ${column.className || ''}`}
                    >
                      {column.render
                        ? column.render(item)
                        : defaultRender(item, column.key)}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {actions.map((action, index) => {
                          if (action.isVisible && !action.isVisible(item)) {
                            return null;
                          }
                          if (action.render) {
                            return (
                              <div key={index} className="inline-block">
                                {action.render(item)}
                              </div>
                            );
                          }
                          const actionLabel = typeof action.label === 'function'
                            ? action.label(item)
                            : action.label;
                          const actionClass = typeof action.className === 'function'
                            ? action.className(item)
                            : action.className || 'bg-blue-50 text-blue-700 hover:bg-blue-100';
                          const iconElement = typeof action.icon === 'function'
                            ? action.icon(item)
                            : action.icon;
                          return (
                            <button
                              key={index}
                              onClick={() => action.onClick(item)}
                              className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${actionClass}`}
                            >
                              {iconElement && <span className="mr-1">{iconElement}</span>}
                              {actionLabel}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && (
            <div className="text-center py-6">
              <p className="text-gray-500">{emptyMessage}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataTable;