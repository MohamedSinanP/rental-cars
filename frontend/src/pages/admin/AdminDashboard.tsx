import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, UserCog, BarChart2, Calendar, Loader } from 'lucide-react';
import Sidebar from '../../layouts/admin/Sidebar';
import { getStatsForAdmin, getRentalStatsForAdmin } from '../../services/apis/adminApi';
import { formatINR } from '../../utils/commonUtilities';

// Define TypeScript interfaces for data structures
interface ChartDataPoint {
  month?: number;
  year?: number;
  date?: string;
  totalCommission: number;
  count: number;
  name?: string;
}

interface AdminStats {
  totalUsers: number;
  totalOwners: number;
  subscriptionEarnings: number;
  totalEarnings: number;
}

type TimeFilterType = 'yearly' | 'monthly' | 'custom';

const AdminDashboard: React.FC = () => {
  // Filter state
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('monthly');
  const [startDate, setStartDate] = useState<string>('2025-01-01');
  const [endDate, setEndDate] = useState<string>('2025-05-05');
  const [statsData, setStatsData] = useState<AdminStats | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState<boolean>(true);
  const [showDateRange, setShowDateRange] = useState<boolean>(false);

  // Fetch dashboard statistics on component mount
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const stats = await getStatsForAdmin();
        setStatsData(stats.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchDashboardStats();
  }, []);

  // Fetch chart data based on filters
  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        let response;

        if (timeFilter === 'monthly') {
          response = await getRentalStatsForAdmin('monthly', year);
        } else if (timeFilter === 'yearly') {
          response = await getRentalStatsForAdmin('yearly', year);
        }

        if (response && response.data) {
          const formattedData = formatChartData(response.data, timeFilter);
          setChartData(formattedData);
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (timeFilter === 'yearly' || timeFilter === 'monthly') {
      fetchChartData();
    }
  }, [timeFilter, year]);

  // Format the data based on the time filter
  const formatChartData = (data: ChartDataPoint[], filter: TimeFilterType): ChartDataPoint[] => {
    if (filter === 'monthly') {
      // Convert month numbers to names
      return data.map(item => {
        const monthNames = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        const fullMonthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];

        return {
          ...item,
          name: monthNames[item.month ? item.month - 1 : 0],
          fullName: fullMonthNames[item.month ? item.month - 1 : 0]
        };
      });
    } else if (filter === 'yearly') {
      return data.map(item => ({
        ...item,
        name: item.year?.toString() || ''
      }));
    } else {
      return data.map(item => ({
        ...item,
        name: formatDateForDisplay(item.date || '')
      }));
    }
  };

  const formatDateForDisplay = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const handleFilterChange = (filter: TimeFilterType): void => {
    setTimeFilter(filter);
    if (filter === 'custom') {
      setShowDateRange(true);
    } else {
      setShowDateRange(false);
    }
  };

  const applyDateFilter = async () => {
    setLoading(true);
    try {
      const response = await getRentalStatsForAdmin('custom', year, startDate, endDate);
      if (response && response.data) {
        const formattedData = formatChartData(response.data, 'custom');
        setChartData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching custom date range data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Users</p>
              <h3 className="text-2xl font-bold">{statsData ? statsData.totalUsers.toLocaleString() : '...'}</h3>
            </div>
            <div className="bg-teal-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-teal-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Owners</p>
              <h3 className="text-2xl font-bold">{statsData ? statsData.totalOwners.toLocaleString() : '...'}</h3>
            </div>
            <div className="bg-teal-100 p-3 rounded-full">
              <UserCog className="w-6 h-6 text-teal-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Earnings</p>
              <h3 className="text-2xl font-bold">${statsData ? formatINR(statsData.totalEarnings) : '...'}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <BarChart2 className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Subscription Earnings</p>
              <h3 className="text-2xl font-bold">${statsData ? formatINR(statsData.subscriptionEarnings) : '...'}</h3>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>
        {/* Chart Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h3 className="text-lg font-semibold text-gray-800">Earning Details By Commission from Owners</h3>

            <div className="flex flex-col gap-3 items-end">
              <div className="flex items-center gap-2">
                <div className="flex rounded-md overflow-hidden border border-gray-200">
                  <button
                    onClick={() => handleFilterChange('yearly')}
                    className={`px-3 py-1 text-sm ${timeFilter === 'yearly' ? 'bg-teal-600 text-white' : 'bg-white text-gray-700'}`}
                  >
                    Yearly
                  </button>
                  <button
                    onClick={() => handleFilterChange('monthly')}
                    className={`px-3 py-1 text-sm ${timeFilter === 'monthly' ? 'bg-teal-600 text-white' : 'bg-white text-gray-700'}`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => handleFilterChange('custom')}
                    className={`px-3 py-1 text-sm ${timeFilter === 'custom' ? 'bg-teal-600 text-white' : 'bg-white text-gray-700'}`}
                  >
                    Custom
                  </button>
                </div>
              </div>

              {(timeFilter === 'monthly' || timeFilter === 'yearly') && (
                <select
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                >
                  {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              )}
              {showDateRange && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">From:</span>
                    <input
                      type="date"
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min="2024-01-01"
                      max={endDate}
                    />
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">To:</span>
                    <input
                      type="date"
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                      max={`${currentYear}-12-31`}
                    />
                  </div>
                  <button
                    onClick={applyDateFilter}
                    className="bg-teal-600 text-white px-3 py-1 rounded-md text-sm flex items-center"
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="h-64">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader className="w-8 h-8 text-teal-600 animate-spin" />
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="blueToTeal" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#4F46E5" /> {/* Indigo */}
                      <stop offset="100%" stopColor="#14B8A6" /> {/* Teal */}
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalCommission"
                    name="Commission"
                    stroke="url(#blueToTeal)" // Use the gradient for the line
                    strokeWidth={2}
                    dot={{
                      stroke: 'url(#blueToTeal)',
                      strokeWidth: 2,
                      r: 4,
                      fill: '#fff',
                    }}
                    activeDot={{
                      r: 6,
                      stroke: 'url(#blueToTeal)',
                      strokeWidth: 2,
                      fill: '#fff',
                    }}
                    isAnimationActive={true}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>

            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No data available for the selected period</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;