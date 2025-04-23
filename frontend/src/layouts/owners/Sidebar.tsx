import { useState } from 'react';
import { CalendarCheck, Car, LayoutDashboard, Menu, X, Settings, LogOut, History } from 'lucide-react';
import Logo from '../../components/Logo';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { removeAuth } from '../../redux/slices/authSlice';
import { logout } from '../../services/apis/authApi';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };
  const handleLogout = async () => {
    const result = await logout(navigate);
    navigate('/login');
  }

  return (
    <div className="h-full relative min-h-screen flex">
      {!isOpen && (
        <div className="lg:hidden p-4 z-50">
          <button onClick={() => setIsOpen(true)} className="text-gray-800">
            <Menu size={28} />
          </button>
        </div>
      )}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-white text-black z-40 border border-gray-400 transform transition-transform duration-300
    ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex-shrink-0`}
      >
        <div className="p-4 flex justify-between items-center lg:hidden">
          <Logo />
          <button onClick={() => setIsOpen(false)}>
            <X size={28} />
          </button>
        </div>

        <div className="p-4">
          <div className='mb-6 hidden lg:flex justify-center'>
            <Logo />
          </div>
          <ul className="space-y-4 flex flex-col items-center">
            <li className='m-4'>
              <NavLink to={'/owner/dashboard'} onClick={handleLinkClick}>
                <div className="flex items-center gap-x-2">
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Dashboard</span>
                </div>
              </NavLink>
            </li>
            <li className='m-4'>
              <NavLink to={'/owner/cars'} onClick={handleLinkClick}>
                <div className="flex items-center gap-x-2">
                  <Car className="w-5 h-5" />
                  <span>Cars</span>
                </div>
              </NavLink>
            </li>
            <li className='m-4'>
              <NavLink to={'/owner/rentals'} onClick={handleLinkClick}>
                <div className="flex items-center gap-x-2">
                  <CalendarCheck className="w-5 h-5" />
                  <span>Bookings</span>
                </div>
              </NavLink>
            </li>
            <li className='m-4'>
              <NavLink to={'/owner/car-history'} onClick={handleLinkClick}>
                <div className="flex items-center gap-x-2">
                  <History className="w-5 h-5" />
                  <span>Added History</span>
                </div>
              </NavLink>
            </li>
            <li className='m-4'>
              <NavLink to={'/'} onClick={handleLinkClick}>
                <div className="flex items-center gap-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </div>
              </NavLink>
            </li>
            <li className='m-4'>
              <button className="flex items-center gap-x-2 cursor-pointer">
                <LogOut className="w-5 h-5" />
                <span onClick={handleLogout} >LogOut</span>
              </button>
            </li>
          </ul>
        </div>

      </div>
    </div >
  );
};

export default Sidebar;
