import React, { FormEvent, useState } from 'react';
import { getCarDocsDetails } from '../services/apis/ownerApi';

interface DocumentSearchProps {
  carId: string;
}

interface SearchResult {
  success: boolean;
  answer: string;
  documentSource?: string;
  confidence?: number;
}

const DocumentSearch: React.FC<DocumentSearchProps> = ({ carId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getCarDocsDetails(carId, searchQuery);
      console.log("this is the LLM result ", result);

      setSearchResults(result.data);
    } catch (err) {
      console.error('Document search failed:', err);
      setError('Failed to search documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-semibold text-center mb-4">Get your car details using AI</h2>
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search here "
            className="w-full border border-gray-300 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-70"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {searchResults && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Document Search Results</h3>
          <div className="text-gray-700 mb-2">
            {searchResults.answer}
          </div>
          {searchResults.documentSource && (
            <div className="text-sm text-gray-500">
              Source: {searchResults.documentSource}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentSearch;