import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { NavLink, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import Logo from '../../components/Logo'
import { logout } from '../../services/apis/authApi'
import { toast } from 'react-toastify'
import profile_icon from '../../assets/profile_icon.png'

const navigation = [
  { name: 'Home', href: '/', current: false },
  { name: 'Cars', href: '/cars', current: false },
  { name: 'Pricing', href: '/subscription', current: false },
  { name: 'About Us', href: '/about', current: false },
]

function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(' ')
}

const NavBar = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth?.user?.userName);

  const handleLogout = async () => {
    try {
      const result = await logout();
      toast.success(result.message);
      navigate('/login');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  }

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <Disclosure as="nav" className="bg-white shadow-md fixed w-full top-0 left-0 z-50">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              {/* Logo and left section */}
              <div className="flex items-center">
                <div className="flex-shrink-0 cursor-pointer" onClick={handleLogoClick}>
                  <Logo />
                </div>
                <div className="hidden md:ml-8 md:flex md:space-x-8">
                  {navigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }: { isActive: boolean }) =>
                        classNames(
                          isActive
                            ? 'text-teal-500 border-b-2 border-teal-500'
                            : 'text-gray-700 hover:text-teal-500 hover:border-b-2 hover:border-teal-500',
                          'px-1 py-2 text-sm font-medium transition-all duration-200'
                        )
                      }
                    >
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="flex md:hidden">
                <DisclosureButton className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </DisclosureButton>
              </div>

              {/* Right section - Auth buttons or user profile */}
              <div className="hidden md:flex md:items-center md:space-x-4">
                {user ? (
                  <div className="flex items-center space-x-4">
                    {/* Rentals button */}
                    <button
                      type="button"
                      className="flex items-center justify-center rounded-full bg-gray-50 p-2 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                      onClick={() => navigate('/rentals')}
                    >
                      <img src="/images/rentals.png" alt="My Rentals" className="h-8 w-8 rounded-full" />
                      <span className="ml-2 text-sm font-medium text-gray-700">My Rentals</span>
                    </button>

                    {/* Profile dropdown */}
                    <Menu as="div" className="relative ml-3 group">
                      <Menu.Button className="flex items-center rounded-full bg-gray-50 p-1 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                        <span className="sr-only">Open user menu</span>
                        <img
                          className="h-8 w-8 rounded-full"
                          alt="Profile"
                          src={profile_icon}
                        />
                        <span className="ml-2 mr-1 font-medium">{user}</span>
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </Menu.Button>

                      <MenuItems
                        className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none"
                      >
                        <MenuItem>
                          {({ active }: { active: boolean }) => (
                            <button
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'flex w-full items-center px-4 py-2 text-sm text-gray-700 cursor-pointer'
                              )}
                              onClick={() => navigate('/profile')}
                            >
                              <UserCircleIcon className="mr-3 h-5 w-5 text-gray-500" aria-hidden="true" />
                              Your Profile
                            </button>
                          )}
                        </MenuItem>
                        <MenuItem>
                          {({ active }: { active: boolean }) => (
                            <button
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'flex w-full items-center px-4 py-2 text-sm text-gray-700 cursor-pointer'
                              )}
                              onClick={handleLogout}
                            >
                              <svg className="mr-3 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              Sign out
                            </button>
                          )}
                        </MenuItem>
                      </MenuItems>
                    </Menu>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      className="rounded-md bg-white px-4 py-2 text-sm font-medium text-teal-500 border border-teal-500 hover:bg-teal-50 transition-colors duration-200 cursor-pointer"
                      onClick={() => navigate('/owner-signup')}
                    >
                      Become A Host
                    </button>
                    <button
                      type="button"
                      className="rounded-md bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 transition-colors duration-200 cursor-pointer"
                      onClick={() => navigate('/signup')}
                    >
                      Login / Signup
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <DisclosurePanel className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <DisclosureButton
                  key={item.name}
                  as={NavLink}
                  to={item.href}
                  className={({ isActive }: { isActive: boolean }) =>
                    classNames(
                      isActive
                        ? 'bg-teal-50 text-teal-500'
                        : 'text-gray-700 hover:bg-teal-50 hover:text-teal-500',
                      'block rounded-md px-3 py-2 text-base font-medium'
                    )
                  }
                >
                  {item.name}
                </DisclosureButton>
              ))}
            </div>

            {/* Mobile auth buttons */}
            {!user ? (
              <div className="border-t border-gray-200 pb-3 pt-4">
                <div className="flex items-center justify-center space-x-4 px-4">
                  <button
                    type="button"
                    className="flex-1 rounded-md bg-white px-3 py-2 text-sm font-medium text-teal-500 border border-teal-500 hover:bg-teal-50"
                    onClick={() => navigate('/owner-signup')}
                  >
                    Become A Host
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-md bg-teal-500 px-3 py-2 text-sm font-medium text-white hover:bg-teal-600"
                    onClick={() => navigate('/signup')}
                  >
                    Login / Signup
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-200 pb-3 pt-4">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      alt="Profile"
                      src={profile_icon}
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1 px-2">
                  <DisclosureButton
                    as="button"
                    className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-500 cursor-pointer"
                    onClick={() => navigate('/rentals')}
                  >
                    My Rentals
                  </DisclosureButton>
                  <DisclosureButton
                    as="button"
                    className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-500 cursor-pointer"
                    onClick={() => navigate('/profile')}
                  >
                    Your Profile
                  </DisclosureButton>
                  <DisclosureButton
                    as="button"
                    className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-500"
                    onClick={handleLogout}
                  >
                    Sign out
                  </DisclosureButton>
                </div>
              </div>
            )}
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  )
}

export default NavBar


