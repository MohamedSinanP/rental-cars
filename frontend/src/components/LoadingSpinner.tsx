import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
      <div
        className="w-12 h-12 border-4 border-t-teal-500 border-r-teal-500 border-b-teal-300 border-l-teal-300 rounded-full animate-spin"
      />
    </div>
  );
};

export default LoadingSpinner;