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
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="p-8 w-full max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Car Document Verification</h1>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
          </div>
        ) : (
          cars.map((car) => (
            <div key={car.id} className="bg-white shadow-md rounded-lg p-6 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    {car.carName} ({car.carModel})
                  </h2>
                  <p className="text-gray-600">
                    Owner: {car.ownerId.name} ({car.ownerId.email})
                  </p>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {car.isVerified && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                        Verified
                      </span>
                    )}
                    {car.verificationRejected && (
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
                        Rejected
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex flex-col gap-1">
                    {/* Displaying PDFs using Google Docs Viewer */}
                    <a
                      href={`https://docs.google.com/gview?url=${encodeURIComponent(car.rcDoc)}&embedded=true`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-400 underline"
                    >
                      View RC Document
                    </a>
                    <a
                      href={`https://docs.google.com/gview?url=${encodeURIComponent(car.pucDoc)}&embedded=true`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-400 underline"
                    >
                      View PUC Document
                    </a>
                    <a
                      href={`https://docs.google.com/gview?url=${encodeURIComponent(car.insuranceDoc)}&embedded=true`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-400 underline"
                    >
                      View Insurance Document
                    </a>
                  </div>

                  {!car.isVerified && !car.verificationRejected && (
                    <div className="flex gap-2 mt-4">
                      <button
                        className="bg-teal-400 text-white px-4 py-2 rounde transition"
                        onClick={() => handleVerify(car.id)}
                      >
                        Mark as Verified
                      </button>
                      <button
                        className="border border-red-500 text-red-500 px-4 py-2 rounded hover:bg-red-100 transition"
                        onClick={() => openRejectModal(car.id)}
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {car.verificationRejected && car.rejectionReason && (
                    <p className="text-sm text-red-600 mt-2">
                      Reason: {car.rejectionReason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rejection modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Reject Car Verification</h2>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason"
              className="w-full border p-2 rounded mb-4"
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={submitRejection}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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
