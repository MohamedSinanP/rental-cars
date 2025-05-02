import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AccountSidebar: React.FC = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('My Profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'profile', icon: '👤', text: 'My Profile', path: '/profile' },
    { id: 'wishlist', icon: '❤️', text: 'Wishlist', path: '/' },
    { id: 'rentals', icon: '🚗', text: 'My Rentals', path: '/rentals' },
    { id: 'wallet', icon: '💳', text: 'Wallet', path: '/wallet' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile menu button - only visible on small screens */}
      <div className="lg:hidden fixed top-20 left-4 z-30">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md bg-gray-100 shadow-md"
          aria-label="Toggle sidebar menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar - responsive with overlay on mobile */}
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
                navigate(item?.path)
                if (isMobileMenuOpen) setIsMobileMenuOpen(false);
              }}
            >
              <span className="mr-3">{item.icon}</span>
              <span className="text-gray-700">{item.text}</span>
              <span className="ml-auto text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          ))}
        </div>

        <div className="px-6 mt-12">
          <button className="flex items-center justify-between w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700 mb-2 cursor-pointer">
            <span>Sign out</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Overlay for mobile - closes sidebar when clicked */}
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