import { useState } from 'react';
import { Users, UserCog, LayoutDashboard, Menu, X, ClipboardCheck, LogOut, BadgeCheck, FileBarChart } from 'lucide-react';
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
      navigate('/admin/login');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    };
  };

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
              <NavLink to={'/admin/dashboard'} onClick={handleLinkClick}>
                <div className="flex items-center gap-x-2">
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Dashboard</span>
                </div>
              </NavLink>
            </li>
            <li className='m-4'>
              <NavLink to={'/admin/users'} onClick={handleLinkClick}>
                <div className="flex items-center gap-x-2">
                  <Users className="w-5 h-5" />
                  <span>Users</span>
                </div>
              </NavLink>
            </li>

            <li className='m-4'>
              <NavLink to={'/admin/owners'} onClick={handleLinkClick}>
                <div className="flex items-center gap-x-2">
                  <UserCog className="w-5 h-5" />
                  <span>Owners</span>
                </div>
              </NavLink>
            </li>

            <li className='m-4'>
              <NavLink to={'/admin/approvals'} onClick={handleLinkClick}>
                <div className="flex items-center gap-x-2">
                  <ClipboardCheck className="w-5 h-5" />
                  <span>Approval</span>
                </div>
              </NavLink>
            </li>
            <li className='m-4'>
              <NavLink to={'/admin/subscription'} onClick={handleLinkClick}>
                <div className="flex items-center gap-x-2">
                  <BadgeCheck className="w-5 h-5" />
                  <span>Subscription</span>
                </div>
              </NavLink>
            </li>
            <li className='m-4'>
              <NavLink to={'/admin/user-subscription'} onClick={handleLinkClick}>
                <div className="flex items-center gap-x-2">
                  <BadgeCheck className="w-5 h-5" />
                  <span>Users Subscription</span>
                </div>
              </NavLink>
            </li>
            <li className='m-4'>
              <NavLink to={'/admin/sales-report'} onClick={handleLinkClick}>
                <div className="flex items-center gap-x-2">
                  <FileBarChart className="w-5 h-5" />
                  <span>Sales Report</span>
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
