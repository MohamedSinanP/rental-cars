import React, { useState, useEffect } from 'react';
import { PlusCircle, MinusCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import AccountSidebar from '../../layouts/users/AccountSidebar';
import DataTable, { DataItem, Column as DataTableColumn } from '../../components/DataTable';
import { getUserWallet } from '../../services/apis/userApis';
import NavBar from '../../layouts/users/NavBar';
import Footer from '../../layouts/users/Footer';
import { formatINR } from '../../utils/commonUtilities';
import Pagination from '../../components/Pagination';

// Type definitions
interface Transaction extends DataItem {
  transactionId: string;
  date: Date;
  paymentType: 'Credit' | 'Debit' | 'Refund';
  transactionAmount: number;
  status: 'Completed' | 'Pending';
}

interface WalletData {
  balance: number;
  pendingAmount: number;
  transactions: Transaction[];
}


// Initial empty state for wallet data
const initialWalletState: WalletData = {
  balance: 0,
  pendingAmount: 0,
  transactions: []
};

const WalletPage: React.FC = () => {
  const [walletData, setWalletData] = useState<WalletData>(initialWalletState);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterValue, setFilterValue] = useState<string>('all');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;

  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Fetch wallet data from API
  useEffect(() => {
    const fetchWalletData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await getUserWallet(currentPage, limit);
        const transformedTransactions: Transaction[] = result.data.transactions.map((transaction: any) => ({
          ...transaction,
          _id: transaction.transactionId, // Add _id field required by DataItem
          date: new Date(transaction.date)
        }));

        setWalletData({
          ...result.data,
          transactions: transformedTransactions
        });
        setCurrentPage(result.data.currentPage);
        setTotalPages(result.data.totalPages);
      } catch (err: any) {
        console.error('Error fetching wallet data:', err);
        setError(err.response?.data?.message || 'Failed to load wallet data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  // Filter transactions based on selected filter
  const filteredTransactions: Transaction[] = walletData.transactions.filter(transaction => {
    if (filterValue === 'all') return true;
    if (filterValue === 'credit') return transaction.paymentType === 'Credit' || transaction.paymentType === 'Refund';
    if (filterValue === 'debit') return transaction.paymentType === 'Debit';
    if (filterValue === 'pending') return transaction.status === 'Pending';
    return true;
  });

  // Define columns for the DataTable component
  const columns: DataTableColumn<Transaction>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (item: Transaction) => (
        <div className="flex flex-col">
          <span className="font-medium">{item.date.toLocaleDateString()}</span>
          <span className="text-xs text-gray-500">{item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )
    },
    {
      key: 'paymentType',
      header: 'Type',
      render: (item: Transaction) => (
        <div className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center
          ${item.paymentType === 'Credit' ? 'bg-green-50 text-green-700' :
            item.paymentType === 'Refund' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
          {item.paymentType === 'Credit' && <PlusCircle className="w-4 h-4 mr-1" />}
          {item.paymentType === 'Debit' && <MinusCircle className="w-4 h-4 mr-1" />}
          {item.paymentType === 'Refund' && <RefreshCw className="w-4 h-4 mr-1" />}
          {item.paymentType}
        </div>
      )
    },
    {
      key: 'transactionAmount',
      header: 'Amount',
      render: (item: Transaction) => (
        <span className={`font-semibold ${item.transactionAmount > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {item.transactionAmount > 0 ? '+' : ''}${formatINR(item.transactionAmount)}
        </span>
      )
    },
    {
      key: 'transactionId',
      header: 'Transaction ID',
      render: (item: Transaction) => (
        <span className="text-gray-600 text-sm truncate max-w-xs">{item.transactionId}</span>
      )
    }
  ];

  // Define responsive columns for mobile view
  const mobileColumns: DataTableColumn<Transaction>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (item: Transaction) => (
        <div className="flex flex-col">
          <span className="font-medium">{item.date.toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'paymentType',
      header: 'Type',
      render: (item: Transaction) => (
        <div className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center
          ${item.paymentType === 'Credit' ? 'bg-green-50 text-green-700' :
            item.paymentType === 'Refund' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
          {item.paymentType === 'Credit' && <PlusCircle className="w-3 h-3 mr-1" />}
          {item.paymentType === 'Debit' && <MinusCircle className="w-3 h-3 mr-1" />}
          {item.paymentType === 'Refund' && <RefreshCw className="w-3 h-3 mr-1" />}
          {item.paymentType}
        </div>
      )
    },
    {
      key: 'transactionAmount',
      header: 'Amount',
      render: (item: Transaction) => (
        <span className={`font-semibold text-sm ${item.transactionAmount > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {item.transactionAmount > 0 ? '+' : ''}${Math.abs(item.transactionAmount).toFixed(2)}
        </span>
      )
    }
  ];

  // Error component
  const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center mb-6">
      <AlertTriangle className="w-5 h-5 mr-2" />
      <p>{message}</p>
    </div>
  );

  return (
    <>
      <NavBar />
      <div className="flex min-h-screen bg-gray-50">
        {/* Mobile sidebar toggle button */}
        <button
          className="lg:hidden fixed z-30 top-4 left-4 p-2 rounded-md bg-white shadow-md"
          onClick={toggleMobileSidebar}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Account Sidebar - Responsive */}
        <div className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 lg:transform-none lg:relative ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <AccountSidebar />
        </div>

        {/* Mobile sidebar overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <div className="flex-grow p-4 sm:p-6 w-full">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6 mt-8 lg:mt-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Wallet</h1>
            </div>

            {/* Error Message */}
            {error && <ErrorMessage message={error} />}

            {/* Loading State */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                {/* Balance Cards */}
                <div className="grid grid-cols-1 gap-6 mb-8">
                  {/* Available Balance Card */}
                  <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg text-gray-600">Available Balance</h2>
                      <div className="p-2 bg-green-50 rounded-full">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="mb-4">
                      <span className="text-2xl sm:text-3xl font-bold text-gray-900">${formatINR(walletData.balance)}</span>
                    </div>
                  </div>
                </div>

                {/* Transaction History */}
                <div className="mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2 sm:mb-0">Transaction History</h2>

                    {/* Filter dropdown */}
                    <div className="relative">
                      <select
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                        className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Transactions</option>
                        <option value="credit">Credits & Refunds</option>
                        <option value="debit">Debits</option>
                        <option value="pending">Pending</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* DataTable Component - Responsive */}
                  <div className="hidden sm:block">
                    <DataTable
                      data={filteredTransactions}
                      columns={columns}
                      emptyMessage="No transactions found"
                      loading={false}
                      headerClassName="text-xl font-semibold text-gray-800"
                      rowClassName={() => "hover:bg-blue-50"}
                    />
                  </div>

                  {/* Mobile DataTable */}
                  <div className="sm:hidden">
                    <DataTable
                      data={filteredTransactions}
                      columns={mobileColumns}
                      emptyMessage="No transactions found"
                      loading={false}
                      headerClassName="text-lg font-semibold text-gray-800"
                      rowClassName={() => "hover:bg-blue-50"}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage} />
      </div>
      <Footer />
    </>
  );
};

export default WalletPage;