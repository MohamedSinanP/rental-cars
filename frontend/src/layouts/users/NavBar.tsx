import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { NavLink, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import Logo from '../../components/Logo'
import { logout } from '../../services/apis/authApi'
import profile_icon from '../../assets/icons8-customer-48.png';
import { toast } from 'react-toastify'




const navigation = [
  { name: 'Home', href: '/', current: false },
  { name: 'Cars', href: '/cars', current: false },
  { name: 'Pricing', href: '/subscription', current: false },
  { name: 'About Us', href: '/contact', current: false },
]

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}


const NavBar = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth?.user?.userName);
  const handleLogout = async () => {
    try {
      const result = await logout();
      console.log(result, "6666666666666");

      toast.success(result.message);
      navigate('/login');
    } catch (error: any) {
      toast.error(error)
    }
  }

  return (
    <>
      <Disclosure as="nav" className="bg-white">
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
              {/* Mobile menu button*/}
              <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset">
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open main menu</span>
                <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
                <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
              </DisclosureButton>
            </div>
            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
              <Logo />
              <div className="hidden sm:ml-6 sm:block">
                <div className="flex space-x-4">
                  {navigation.map((item) => (
                    // <a
                    //   key={item.name}
                    //   href={item.href}
                    //   aria-current={item.current ? 'page' : undefined}
                    //   className={classNames(
                    //     item.current ? 'bg-red-500 text-white' : 'text-black hover:bg-gray-700 hover:text-white',
                    //     'rounded-md px-3 py-2 text-sm font-medium',
                    //   )}
                    // >
                    //   {item.name}
                    // </a>
                    <ul key={item.name}>
                      <NavLink
                        to={item.href}
                        className={({ isActive }: { isActive: Boolean }) => isActive ? 'bg-teal-400 text-white rounded-md px-3 py-2 text-sm font-medium' : 'text-black hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium'
                        }
                      >{item.name}
                      </NavLink>
                    </ul>
                  ))}
                </div>
              </div>
            </div>

            {user ? <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
              <button
                type="button"
                className="relative rounded-full bg-white-800 p-1 text-gray-400  cursor-pointer hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden"
                onClick={() => navigate('/rentals')}
              >
                <img src="/images/rentals.png" alt="" className='size-14 rounded-full' />
              </button>

              {/* Profile dropdown */}
              <Menu as="div" className="relative ml-3 group">
                <div>
                  <button
                    onClick={() => navigate('/profile')}
                    className="relative flex rounded-full bg-none text-sm"
                  >
                    <img
                      alt="profile"
                      src={profile_icon}
                      className="size-8 rounded-full cursor-pointer"
                    />
                  </button>
                </div>

                {/* Show dropdown only when user hovers */}
                <MenuItems
                  static
                  className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 ring-1 shadow-lg ring-black/5"
                >
                  <MenuItem>
                    <button
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => navigate('/profile')}
                    >
                      Your Profile
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Settings
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={handleLogout}
                    >
                      Sign out
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </div> : <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
              <button
                type="button"
                className="relative bg-teal-400 p-1 mr-4 text-white text-sm cursor-pointer hover:text-teal-400 hover:bg-white hover:border hover:border-teal-400 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden"
                onClick={() => {
                  navigate('/owner-signup')
                }}
              >
                Become A Host Now
              </button>
              <button
                type="button"
                className="relative bg-teal-400 p-1 text-white text-sm cursor-pointer hover:text-teal-400 hover:bg-white hover:border hover:border-teal-400 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden"
                onClick={() => {
                  navigate('/signup')
                }}
              >
                Login/Signup
              </button>
            </div>}

          </div>
        </div>

        <DisclosurePanel className="sm:hidden">
          <div className="space-y-1 px-2 pt-2 pb-3">
            {navigation.map((item) => (
              <DisclosureButton
                key={item.name}
                as="a"
                href={item.href}
                aria-current={item.current ? 'page' : undefined}
                className={classNames(
                  item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                  'block rounded-md px-3 py-2 text-base font-medium',
                )}
              >
                {item.name}
              </DisclosureButton>
            ))}
          </div>
        </DisclosurePanel>
      </Disclosure >
    </>
  )
}

export default NavBar
