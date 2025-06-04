import React, { useEffect, useState } from "react";
import Sidebar from "../../layouts/admin/Sidebar";
import { carVerificationRejectionApi, carVerifyApi, fetchVerificationPendingCars } from "../../services/apis/adminApi";
import { CarDocument } from "../../types/types";

const CarVerification: React.FC = () => {
  const [cars, setCars] = useState<CarDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchCars = async () => {
    try {
      const result = await fetchVerificationPendingCars();
      setCars(result.data);
    } catch (error) {
      console.error("Failed to fetch cars:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await carVerifyApi(id);
      setCars((prev) => prev.filter((car) => car.id !== id));
    } catch (error) {
      console.error("Verification failed:", error);
    }
  };

  const openRejectModal = (id: string) => {
    setSelectedCarId(id);
    setRejectionReason("");
    setShowModal(true);
  };

  const submitRejection = async () => {
    if (!selectedCarId || !rejectionReason.trim()) return;

    try {
      await carVerificationRejectionApi(selectedCarId, rejectionReason)
      setCars((prev) => prev.filter((car) => car.id !== selectedCarId));
    } catch (error) {
      console.error("Rejection failed:", error);
    } finally {
      setShowModal(false);
      setSelectedCarId(null);
      setRejectionReason("");
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area - With left margin to accommodate fixed sidebar */}
      <div className="lg:ml-64 min-h-screen">
        <div className="p-4 lg:p-8">
          {/* Page title */}
          <div className="mb-4 lg:mb-6">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-800 mt-12 lg:mt-0">Car Document Verification</h1>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500" />
              <p className="mt-2 text-sm text-gray-500">Loading verification data...</p>
            </div>
          ) : (
            <div className="space-y-4 lg:space-y-6">
              {cars.map((car) => (
                <div key={car.id} className="bg-white shadow-md rounded-lg p-4 lg:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    <div>
                      <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                        {car.carName} ({car.carModel})
                      </h2>
                      <p className="text-sm lg:text-base text-gray-600 mt-1">
                        Owner: {car.ownerId.name} ({car.ownerId.email})
                      </p>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {car.isVerified && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                            Verified
                          </span>
                        )}
                        {car.verificationRejected && (
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                            Rejected
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex flex-col gap-2 mb-4">
                        {/* Displaying PDFs using Google Docs Viewer */}
                        <a
                          href={`https://docs.google.com/gview?url=${encodeURIComponent(car.rcDoc)}&embedded=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:text-teal-700 underline text-sm lg:text-base transition-colors"
                        >
                          View RC Document
                        </a>
                        <a
                          href={`https://docs.google.com/gview?url=${encodeURIComponent(car.pucDoc)}&embedded=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:text-teal-700 underline text-sm lg:text-base transition-colors"
                        >
                          View PUC Document
                        </a>
                        <a
                          href={`https://docs.google.com/gview?url=${encodeURIComponent(car.insuranceDoc)}&embedded=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:text-teal-700 underline text-sm lg:text-base transition-colors"
                        >
                          View Insurance Document
                        </a>
                      </div>

                      {!car.isVerified && !car.verificationRejected && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors text-sm lg:text-base"
                            onClick={() => handleVerify(car.id)}
                          >
                            Mark as Verified
                          </button>
                          <button
                            className="border border-red-500 text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm lg:text-base"
                            onClick={() => openRejectModal(car.id)}
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {car.verificationRejected && car.rejectionReason && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-sm text-red-700">
                            <span className="font-medium">Rejection Reason:</span> {car.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {cars.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-4">📋</div>
                  <p className="text-gray-500 text-lg">No cars pending verification</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Rejection modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-lg lg:text-xl font-semibold mb-4 text-gray-900">Reject Car Verification</h2>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason"
              className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              rows={4}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitRejection}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                disabled={!rejectionReason.trim()}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarVerification;