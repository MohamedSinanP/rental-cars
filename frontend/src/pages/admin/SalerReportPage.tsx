import { useState, useEffect } from 'react';
import { DollarSign, Calendar, Download, Car, RefreshCw } from 'lucide-react';
import Sidebar from '../../layouts/admin/Sidebar';
import DataTable, { Column } from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import { getRentalForAdmin, getSalesReportPdf, getStatsForAdmin } from '../../services/apis/adminApi';
import { formatINR } from '../../utils/commonUtilities';
import { toast } from 'react-toastify';

// Interface for DataItem that matches what DataTable expects
interface DataItem {
  id: string;
  ownerId: { userName: string };
  carId: { carName: string };
  bookingDate: string;
  dropOffDate: string;
  totalPrice: number;
  adminCommissionAmount: number;
  [key: string]: string | number | { userName: string } | { carName: string } | undefined;
}
interface SummaryData {
  totalCommissionEarnings: number;
  totalSubscriptionEarnings: number;
  totalBookings: number;
  totalPlatformRevenue: number;
}

// Define types for API response data
interface BookingData {
  id: string;
  ownerId: {
    userName: string;
  };
  carId: {
    carName: string;
  };
  bookingDate: string;
  dropOffDate: string;
  totalPrice: number;
  adminCommissionAmount: number;
}

interface RentalApiResponse {
  data: {
    data: BookingData[];
    totalPages: number;
    currentPage: number;
  };
}

type TimeFilterType = 'yearly' | 'monthly' | 'custom';

const SalesReportPage = () => {
  // State management
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('yearly');
  const [startDate, setStartDate] = useState<string>('2025-01-01');
  const [endDate, setEndDate] = useState<string>('2025-05-08');
  const [salesData, setSalesData] = useState<DataItem[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalCommissionEarnings: 0,
    totalSubscriptionEarnings: 0,
    totalBookings: 0,
    totalPlatformRevenue: 0,
  });
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDateRange, setShowDateRange] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const limit = 6;

  // Fetch summary data
  useEffect(() => {
    const fetchCardData = async () => {
      try {
        const result = await getStatsForAdmin();
        const data = result.data;
        setSummaryData({
          totalCommissionEarnings: data.totalCommission,
          totalSubscriptionEarnings: data.subscriptionEarnings,
          totalBookings: data.totalBookings,
          totalPlatformRevenue: data.totalEarnings,
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      }
    };
    fetchCardData();
  }, []);

  // Fetch sales data based on filters
  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      try {
        let result: RentalApiResponse | undefined;
        if (timeFilter === 'yearly') {
          result = await getRentalForAdmin(currentPage, limit, 'yearly', year);
        } else if (timeFilter === 'monthly') {
          result = await getRentalForAdmin(currentPage, limit, 'monthly', year, undefined, undefined, month);
        } else if (timeFilter === 'custom') {
          result = await getRentalForAdmin(currentPage, limit, 'custom', year, startDate, endDate);
        }

        if (result && result.data) {
          const bookings = result.data.data || [];
          const mappedData: DataItem[] = bookings.map((booking: BookingData) => ({
            id: booking.id,
            ownerId: booking.ownerId,
            carId: booking.carId,
            bookingDate: booking.bookingDate,
            dropOffDate: booking.dropOffDate,
            totalPrice: booking.totalPrice,
            adminCommissionAmount: booking.adminCommissionAmount,
          }));
          setSalesData(mappedData);
          setTotalPages(result.data.totalPages || 1);
          setCurrentPage(result.data.currentPage || 1);
        } else {
          setSalesData([]);
          setTotalPages(1);
        }
      } catch (error) {
        console.error('Error fetching sales data:', error);
        setSalesData([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [timeFilter, year, month, currentPage, startDate, endDate]);

  // Apply custom date filter
  const applyDateFilter = async () => {
    setLoading(true);
    try {
      const result = await getRentalForAdmin(currentPage, limit, 'custom', year, startDate, endDate);

      if (result && result.data && result.data.data) {
        const bookings = result.data.data;
        const mappedData: DataItem[] = bookings.map((booking: BookingData) => ({
          id: booking.id,
          ownerId: booking.ownerId,
          carId: booking.carId,
          bookingDate: booking.bookingDate,
          dropOffDate: booking.dropOffDate,
          totalPrice: booking.totalPrice,
          adminCommissionAmount: booking.adminCommissionAmount,
        }));
        setSalesData(mappedData);
        setTotalPages(result.data.totalPages || 1);
      } else {
        setSalesData([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching custom date range data:', error);
      setSalesData([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (filter: TimeFilterType) => {
    setTimeFilter(filter);
    setCurrentPage(1);

    if (filter === 'custom') {
      setShowDateRange(true);
    } else {
      setShowDateRange(false);
    }
  };

  // Download sales report function
  const downloadSalesReport = async () => {
    if (salesData.length === 0) {
      toast.error('No data available to download');
      return;
    }

    try {
      const result = await getSalesReportPdf(timeFilter, year, startDate, endDate, month);
      const blob = new Blob([result], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      let filename;
      if (timeFilter === 'yearly') {
        filename = `sales_report_${year}.pdf`;
      } else if (timeFilter === 'monthly') {
        filename = `sales_report_${year}_${month}.pdf`;
      } else {
        filename = `sales_report_${startDate}_to_${endDate}.pdf`;
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading sales report:', error);
      toast.error('Failed to download the sales report. Please try again.');
    }
  };

  // Define table columns
  const columns: Column<DataItem>[] = [
    {
      key: 'owner',
      header: 'Owner',
      render: (item) => <div className="font-medium text-gray-900">{item.ownerId.userName}</div>,
    },
    {
      key: 'car',
      header: 'Car',
      render: (item) => <span className="text-gray-600">{item.carId.carName}</span>,
    },
    {
      key: 'bookingDate',
      header: 'Booking Date',
      render: (item) => <span className="text-gray-600 hidden sm:inline">{new Date(item.bookingDate).toLocaleDateString()}</span>,
    },
    {
      key: 'dropOffDate',
      header: 'Drop-off',
      render: (item) => <span className="text-gray-600 hidden sm:inline">{new Date(item.dropOffDate).toLocaleDateString()}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (item) => <span className="text-gray-900 font-medium">{formatINR(item.totalPrice)}</span>,
    },
    {
      key: 'commission',
      header: 'Commission',
      render: (item) => <span className="text-teal-600 font-medium">{formatINR(item.adminCommissionAmount)}</span>,
    },
  ];

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center h-64">
      <RefreshCw className="w-8 h-8 text-teal-500 animate-spin" />
      <p className="mt-2 text-sm text-gray-500">Loading sales data...</p>
    </div>
  );

  const currentYear = new Date().getFullYear();
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Sales Report</h1>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-4 md:p-6 flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500 mb-1">Total Commission Earnings</p>
                <h3 className="text-xl md:text-2xl font-bold">{formatINR(summaryData.totalCommissionEarnings)}</h3>
              </div>
              <div className="bg-teal-100 p-2 md:p-3 rounded-full">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-teal-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 md:p-6 flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500 mb-1">Total Subscription Earnings</p>
                <h3 className="text-xl md:text-2xl font-bold">{formatINR(summaryData.totalSubscriptionEarnings)}</h3>
              </div>
              <div className="bg-blue-100 p-2 md:p-3 rounded-full">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 md:p-6 flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500 mb-1">Total Bookings</p>
                <h3 className="text-xl md:text-2xl font-bold">{summaryData.totalBookings}</h3>
              </div>
              <div className="bg-purple-100 p-2 md:p-3 rounded-full">
                <Car className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 md:p-6 flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500 mb-1">Total Platform Revenue</p>
                <h3 className="text-xl md:text-2xl font-bold">{formatINR(summaryData.totalPlatformRevenue)}</h3>
              </div>
              <div className="bg-green-100 p-2 md:p-3 rounded-full">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
              </div>
            </div>
          </div>

          {/* Filter Controls and Data Table */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 md:p-6">
              <div className="flex flex-col space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Booking Data</h3>
                <div className="flex flex-col gap-3 items-end">
                  <div className="flex items-center gap-2">
                    <div className="flex rounded-md overflow-hidden border border-gray-200">
                      <button
                        onClick={() => handleFilterChange('yearly')}
                        className={`px-3 py-1 text-sm cursor-pointer ${timeFilter === 'yearly' ? 'bg-teal-600 text-white' : 'bg-white text-gray-700'}`}
                      >
                        Yearly
                      </button>
                      <button
                        onClick={() => handleFilterChange('monthly')}
                        className={`px-3 py-1 text-sm cursor-pointer ${timeFilter === 'monthly' ? 'bg-teal-600 text-white' : 'bg-white text-gray-700'}`}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => handleFilterChange('custom')}
                        className={`px-3 py-1 text-sm cursor-pointer ${timeFilter === 'custom' ? 'bg-teal-600 text-white' : 'bg-white text-gray-700'}`}
                      >
                        Custom
                      </button>
                    </div>
                  </div>
                  {(timeFilter === 'yearly' || timeFilter === 'monthly') && (
                    <div className="flex items-center gap-2">
                      <select
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                      >
                        {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                      {timeFilter === 'monthly' && (
                        <select
                          className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                          value={month}
                          onChange={(e) => setMonth(parseInt(e.target.value))}
                        >
                          {months.map((m) => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                          ))}
                        </select>
                      )}
                    </div>
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
                        onClick={() => {
                          setCurrentPage(1);
                          applyDateFilter();
                        }}
                        className="bg-teal-600 text-white px-3 py-1 rounded-md text-sm flex items-center"
                      >
                        <Calendar className="w-3 h-3 mr-1" />
                        Apply
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={downloadSalesReport}
                    className="bg-teal-600 text-white px-3 py-1 rounded-md text-sm flex items-center shadow-sm hover:bg-teal-700 transition-colors cursor-pointer"
                    disabled={salesData.length === 0 || loading}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download Report
                  </button>
                </div>
              </div>
            </div>

            {/* Sales Data Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <LoadingSpinner />
              ) : (
                <DataTable
                  data={salesData}
                  columns={columns}
                  title=""
                  loading={false}
                  emptyMessage="No sales data available for the selected period"
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

export default SalesReportPage;