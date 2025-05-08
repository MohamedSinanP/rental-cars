import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Heart,
  Car,
  Wallet,
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

const AccountSidebar: React.FC = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('My Profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'profile', icon: <User className="w-5 h-5" />, text: 'My Profile', path: '/profile' },
    { id: 'wishlist', icon: <Heart className="w-5 h-5" />, text: 'Wishlist', path: '/' },
    { id: 'rentals', icon: <Car className="w-5 h-5" />, text: 'My Rentals', path: '/rentals' },
    { id: 'wallet', icon: <Wallet className="w-5 h-5" />, text: 'Wallet', path: '/wallet' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile menu toggle button */}
      <div className="lg:hidden fixed top-20 left-4 z-30">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md bg-gray-100 shadow-md"
          aria-label="Toggle sidebar menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-700" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-20 h-full bg-white shadow-md transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:block lg:w-64
        ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full'}
      `}>
        <div className="p-6 space-y-4">
          {menuItems.map(item => (
            <div
              key={item.id}
              className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 rounded-md transition-colors ${activeItem === item.text ? 'bg-gray-100' : ''
                }`}
              onClick={() => {
                setActiveItem(item.text);
                navigate(item.path);
                if (isMobileMenuOpen) setIsMobileMenuOpen(false);
              }}
            >
              <span className="mr-3 text-gray-700">{item.icon}</span>
              <span className="text-gray-700">{item.text}</span>
              <span className="ml-auto text-gray-400">
                <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          ))}
        </div>

        <div className="px-6 mt-12">
          <button className="flex items-center justify-between w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700 mb-2 cursor-pointer">
            <span>Sign out</span>
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default AccountSidebar;
