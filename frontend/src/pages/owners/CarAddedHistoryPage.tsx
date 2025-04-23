import React, { useEffect, useState } from 'react';
import Sidebar from '../../layouts/owners/Sidebar';
import { fetchAllOwnerCars } from '../../services/apis/ownerApi';
import { ICar } from '../../types/types';

const CarAddedHistoryPage: React.FC = () => {
  const [carData, setCarData] = useState<ICar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCarData = async () => {
      try {
        const result = await fetchAllOwnerCars();
        console.log(result, "this is resul");

        setCarData(result.data.cars);
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch car data');
      } finally {
        setLoading(false);
      }
    };

    fetchCarData();
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h2 className="text-2xl font-semibold mb-6">Car Verification History</h2>

        <div className="overflow-x-auto bg-white rounded shadow p-4">
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Image</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Car Name</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Rejection Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {carData.map((car) => (
                  <tr key={car._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <img
                        src={car.carImages[0]}
                        alt={car.carName}
                        className="h-16 w-24 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{car.carName}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${car.isVerified
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                          }`}
                      >
                        {car.isVerified ? 'Verified' : 'Rejected'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {car.rejectionReason ?? '—'}
                    </td>
                  </tr>
                ))}
                {carData.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-500">
                      No cars found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarAddedHistoryPage;
