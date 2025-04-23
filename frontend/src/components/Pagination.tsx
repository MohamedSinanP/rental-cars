import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];

  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 border rounded transition-colors duration-200 ${page === currentPage
            ? 'bg-teal-400 text-white border-teal-400'
            : 'bg-white text-gray-700 hover:bg-teal-400'
            }`}
        >
          {page}
        </button>
      ))}
    </div>
  );
};

export default Pagination;
