import React from 'react';
import { Users, Car, Shield, ArrowRight, MessageSquare, Calendar, DollarSign } from 'lucide-react';
import NavBar from '../../layouts/users/NavBar';
import Footer from '../../layouts/users/Footer';
import { useNavigate } from 'react-router-dom';

const AboutUsPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <>
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 py-12 pt-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About OwnCars</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Revolutionizing car rentals by connecting vehicle owners with drivers who need them.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Mission</h2>
          <div className="bg-teal-50 p-8 rounded-lg">
            <p className="text-lg text-gray-700 mb-4">
              At OwnCars, we're transforming the traditional car rental model into a community-powered marketplace.
              Our platform enables car owners to earn extra income by listing their vehicles when they're not in use,
              while providing renters with more affordable, convenient, and personalized rental options.
            </p>
            <p className="text-lg text-gray-700">
              We're committed to building a sustainable, efficient, and trustworthy ecosystem that benefits everyone
              involved while reducing the overall number of idle vehicles on our roads.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">How OwnCars Works</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* For Car Owners */}
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
              <div className="flex items-center mb-4">
                <Car className="text-teal-400 mr-4" size={32} />
                <h3 className="text-2xl font-semibold">For Car Owners</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex">
                  <span className="bg-teal-400 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">1</span>
                  <span>List your vehicle on our platform with photos and details</span>
                </li>
                <li className="flex">
                  <span className="bg-teal-400 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">2</span>
                  <span>Set your availability and pricing preferences</span>
                </li>
                <li className="flex">
                  <span className="bg-teal-400 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">3</span>
                  <span>Approve rental requests from verified drivers</span>
                </li>
                <li className="flex">
                  <span className="bg-teal-400 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">4</span>
                  <span>Hand over the keys and earn money while your car is in use</span>
                </li>
              </ul>
              <button className="mt-6 flex items-center text-teal-400 font-medium hover:text-teal-600">
                Become a Host Now <ArrowRight size={16} className="ml-1" />
              </button>
            </div>

            {/* For Renters */}
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
              <div className="flex items-center mb-4">
                <Users className="text-teal-400 mr-4" size={32} />
                <h3 className="text-2xl font-semibold">For Renters</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex">
                  <span className="bg-teal-400 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">1</span>
                  <span>Browse available vehicles in your area</span>
                </li>
                <li className="flex">
                  <span className="bg-teal-400 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">2</span>
                  <span>Filter by price, type, features, and availability</span>
                </li>
                <li className="flex">
                  <span className="bg-teal-400 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">3</span>
                  <span>Book your preferred car with just a few clicks</span>
                </li>
                <li className="flex">
                  <span className="bg-teal-400 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">4</span>
                  <span>Pick up the keys and enjoy your ride</span>
                </li>
              </ul>
              <button className="mt-6 flex items-center text-teal-400 font-medium hover:text-teal-600">
                Find Your Ride <ArrowRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Why Choose OwnCars</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="h-10 w-10 text-teal-400" />,
                title: "Trust & Safety",
                description: "Comprehensive insurance coverage and thorough driver verification for peace of mind."
              },
              {
                icon: <DollarSign className="h-10 w-10 text-teal-400" />,
                title: "Better Value",
                description: "Competitive pricing with no hidden fees. Owners earn, drivers save."
              },
              {
                icon: <Calendar className="h-10 w-10 text-teal-400" />,
                title: "Flexible Options",
                description: "Rent by the hour, day, or week. Choose exactly what you need, when you need it."
              },
              {
                icon: <MessageSquare className="h-10 w-10 text-teal-400" />,
                title: "Direct Communication",
                description: "Chat directly with car owners for a more personalized rental experience."
              },
              {
                icon: <Car className="h-10 w-10 text-teal-400" />,
                title: "Diverse Selection",
                description: "From economy cars to luxury vehicles, find the perfect match for any occasion."
              },
              {
                icon: <Users className="h-10 w-10 text-teal-400" />,
                title: "Community Driven",
                description: "Join thousands of members already sharing and renting vehicles in your area."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center text-center">
                {feature.icon}
                <h3 className="mt-4 text-xl font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Our Story */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Story</h2>
          <div className="bg-gray-50 p-8 rounded-lg">
            <p className="text-lg text-gray-700 mb-4">
              OwnCars began with a simple observation: millions of cars sit parked and unused for the majority of their
              lifetime, while at the same time, many people struggle to find affordable and convenient rental options.
            </p>
            <p className="text-lg text-gray-700 mb-4">
              Founded in 2023, we set out to solve this problem by creating a platform that connects car owners with people who need temporary access to a vehicle. Our team of automotive enthusiasts and tech innovators worked to build a seamless, secure marketplace where trust and convenience are paramount.
            </p>
            <p className="text-lg text-gray-700">
              Today, OwnCars is growing rapidly, with thousands of successful rentals completed and a vibrant community of owners and renters who believe in the power of sharing resources. We're proud to be at the forefront of the sharing economy, making car rental more accessible, affordable, and sustainable.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Join the OwnCars Community?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              className="bg-teal-400 text-white px-6 py-3 rounded-md hover:bg-teal-500 transition-colors"
              onClick={() => navigate('/cars')}
            >
              Rent a Car
            </button>
            <button className="bg-white text-teal-400 px-6 py-3 rounded-md border border-teal-400 hover:bg-teal-50 transition-colors"
              onClick={() => navigate('/owner-signup')}
            >
              List Your Car
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AboutUsPage;