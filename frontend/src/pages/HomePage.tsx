import React from 'react'
import NavBar from '../layouts/users/NavBar'
import Footer from '../layouts/users/Footer'
import {
  CalendarDaysIcon,
  ClockIcon,
  LifebuoyIcon,
  MapPinIcon,
  ShieldCheckIcon,
  TruckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/solid'
import { useNavigate } from 'react-router-dom'

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className='min-h-screen'>
        {/* navbar section */}
        <NavBar />
        {/* Hero section */}
        <div className='max-sm:mt-20 flex flex-col items-center sm:flex-row gap-2 justify-center relative px-5 py-10'>
          <div className='flex flex-col items-center sm:mr-40 z-10 text-center sm:text-left max-sm:mb-10'>
            <h1 className='text-4xl font-semibold'>
              Find, book and
              <br />
              rent a car <span className='text-teal-400'>Easily</span>
            </h1>
            <p className='my-5 text-sm text-gray-600'>
              Get a car whenever and wherever you
              <br />
              need it with your iOS and Android devices
            </p>
            <button
              className='bg-white text-teal-400 text-md px-4 py-2 border rounded-lg hover:bg-teal-400 hover:text-white transition cursor-pointer'
              onClick={() => navigate('/cars')}
            >
              Explore Now
            </button>
          </div>
          {/* Car image with background layers */}
          <div className='relative w-[320px] sm:w-[500px] mt-10 sm:mt-0'>
            <div className='absolute top-15 left-10 w-[100%] h-[100%] bg-teal-100 rounded-[50%] rotate-[30deg] z-0'></div>
            <div className='absolute top-10 left-5 w-[100%] h-[100%] bg-teal-200 rounded-[50%] rotate-[45deg] opacity-60 z-0'></div>
            <img src="images/background-image.png" alt="Car" className='relative z-10' />
          </div>
        </div>

        {/* How it works section */}
        <div className='text-center py-16 px-4 my-10'>
          <button className='bg-blue-100 text-teal-400 text-xs px-4 py-1 rounded-full mb-3'>
            HOW IT WORK
          </button>
          <h2 className='text-2xl font-semibold mb-10'>Rent with following 3 working steps</h2>
          <div className='flex flex-col sm:flex-row justify-center gap-10'>
            {/* Step 1 */}
            <div className='flex flex-col items-center'>
              <MapPinIcon className='text-teal-400 w-8 h-8 mb-2' />
              <h3 className='font-semibold mb-1'>Choose location</h3>
              <p className='text-sm text-gray-600'>Choose your and find your best car</p>
            </div>
            {/* Step 2 */}
            <div className='flex flex-col items-center'>
              <CalendarDaysIcon className='text-teal-400 w-8 h-8 mb-2' />
              <h3 className='font-semibold mb-1'>Pick-up date</h3>
              <p className='text-sm text-gray-600'>Select your pick-up date and time to book your car</p>
            </div>
            {/* Step 3 */}
            <div className='flex flex-col items-center'>
              <TruckIcon className='text-teal-400 w-8 h-8 mb-2' />
              <h3 className='font-semibold mb-1'>Book your car</h3>
              <p className='text-sm text-gray-600'>Book your car and we will deliver it directly to you</p>
            </div>
          </div>
        </div>

        {/* Why choose us section */}
        <div className='flex flex-col sm:flex-row items-center justify-center px-6 sm:px-16 py-20 gap-10 my-10'>
          <div className='relative w-[320px] sm:w-[450px] h-auto flex items-center justify-center'>
            <div className='absolute w-[80%] h-[80%] bg-teal-100 rotate-[30deg] rounded-[10%] z-0'></div>
            <img src="images/background-image.png" alt="Car" className='relative z-10 w-full' />
          </div>

          {/* Feature List */}
          <div className='max-w-lg'>
            <button className='bg-blue-100 text-teal-400 text-xs px-4 py-1 rounded-full mb-3'>
              WHY CHOOSE US
            </button>
            <h2 className='text-2xl font-semibold mb-8'>We offer the best experience with our rental deals</h2>

            <div className='space-y-6'>
              <div className='flex items-start gap-4'>
                <ShieldCheckIcon className='text-teal-400 w-6 h-6 mt-1' />
                <div>
                  <h4 className='font-semibold'>Best price guaranteed</h4>
                  <p className='text-sm text-gray-600'>
                    Find a lower price? We’ll refund you 100% of the difference.
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-4'>
                <UserGroupIcon className='text-teal-400 w-6 h-6 mt-1' />
                <div>
                  <h4 className='font-semibold'>Experience driver</h4>
                  <p className='text-sm text-gray-600'>
                    Don’t have driver? Don’t worry, we have many experienced driver for you.
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-4'>
                <ClockIcon className='text-teal-400 w-6 h-6 mt-1' />
                <div>
                  <h4 className='font-semibold'>24 hour car delivery</h4>
                  <p className='text-sm text-gray-600'>
                    Book your car anytime and we will deliver it directly to you.
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-4'>
                <LifebuoyIcon className='text-teal-400 w-6 h-6 mt-1' />
                <div>
                  <h4 className='font-semibold'>24/7 technical support</h4>
                  <p className='text-sm text-gray-600'>
                    Have a question? Contact Rentcars support any time when you have problem.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* footer section */}
        <Footer />
      </div>
    </>
  )
}

export default HomePage
