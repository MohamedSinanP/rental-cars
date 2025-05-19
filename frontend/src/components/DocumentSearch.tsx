import React, { FormEvent, useState } from 'react';
import { getCarDocsDetails } from '../services/apis/ownerApi';
import { Sparkles, Loader2, FileText } from 'lucide-react'; // Optional icons

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
    setSearchResults(null);

    try {
      const result = await getCarDocsDetails(carId, searchQuery);
      setSearchResults(result.data);
    } catch (err) {
      console.error('Document search failed:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800 flex items-center justify-center gap-2">
        <Sparkles className="w-5 h-5 text-teal-500" />
        AI-Powered Car Document Assistant
      </h2>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-col md:flex-row gap-3 items-stretch">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ask something about your car documents..."
            className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-5 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Searching...
              </span>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {searchResults && (
        <div className="animate-fade-in bg-white border border-gray-200 rounded-2xl p-5 shadow-md transition-all">
          <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" />
            Search Results
          </h3>
          <p className="text-gray-800 mb-1">{searchResults.answer}</p>
          {searchResults.documentSource && (
            <p className="text-sm text-gray-500">
              Source: {searchResults.documentSource}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentSearch;
