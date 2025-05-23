import { useState } from 'react';
import { CalendarCheck, Car, LayoutDashboard, Menu, X, LogOut, History } from 'lucide-react';
import Logo from '../../components/Logo';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../../services/apis/authApi';
import { toast } from 'react-toastify';

const Sidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      const result = await logout();
      toast.success(result.message);
      navigate('/login');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  return (
    <>
      {/* Mobile Menu Button - Fixed position */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={24} className="text-gray-700" />
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static top-0 left-0 h-screen w-64 bg-white z-50 
          border-r border-gray-200 shadow-xl lg:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center justify-center w-full lg:w-auto">
            <Logo />
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={24} className="text-gray-700" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/owner/dashboard"
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                    ? 'bg-teal-50 text-teal-700 border-r-2 border-teal-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/owner/cars"
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                    ? 'bg-teal-50 text-teal-700 border-r-2 border-teal-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Car className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Cars</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/owner/rentals"
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                    ? 'bg-teal-50 text-teal-700 border-r-2 border-teal-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <CalendarCheck className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Bookings</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/owner/car-history"
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                    ? 'bg-teal-50 text-teal-700 border-r-2 border-teal-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <History className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Added History</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;