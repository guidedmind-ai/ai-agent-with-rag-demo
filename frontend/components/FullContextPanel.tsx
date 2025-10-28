'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { FULL_CONTEXT_DOCUMENT, SAMPLE_QUERIES, LONG_CONTEXT_DOCUMENT, CONTEXT_EXCEED_TEST_QUERIES } from '@/lib/constants';

export default function FullContextPanel() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [useExceedTest, setUseExceedTest] = useState(false);

  const currentDocument = useExceedTest ? LONG_CONTEXT_DOCUMENT : FULL_CONTEXT_DOCUMENT;
  const currentQueries = useExceedTest ? CONTEXT_EXCEED_TEST_QUERIES : SAMPLE_QUERIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await api.queryWithFullContext({
        query,
        full_context: currentDocument
      });

      setResponse(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQuery('');
    setResponse(null);
    setError(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-green-50 border-b-2 border-green-200 p-4">
        <h2 className="text-xl font-bold text-green-900">Full Context Query</h2>
        <p className="text-sm text-green-700">Using entire document as context</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4 space-y-4">
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={useExceedTest}
              onChange={(e) => setUseExceedTest(e.target.checked)}
              className="w-5 h-5 text-yellow-600 rounded focus:ring-2 focus:ring-yellow-500"
            />
            <div className="flex-1">
              <span className="font-semibold text-yellow-900">Use Context Window Exceed Test</span>
              <p className="text-xs text-yellow-700 mt-1">
                Enable to use a 256,000+ character document that exceeds most model context windows. This demonstrates model failure when context is too large.
              </p>
            </div>
          </label>
        </div>

        {useExceedTest && (
          <div className="bg-orange-50 border border-orange-300 rounded-lg p-3">
            <p className="text-sm text-orange-800">
              <strong>⚠️ Warning:</strong> Long context active! Document size: <strong>{currentDocument.length.toLocaleString()} characters</strong> (~64,000 tokens).
              Most models will fail to process this entire context. Test questions reference information at the very end of the document.
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Document Context
            <span className="ml-2 text-xs text-gray-500">
              ({currentDocument.length.toLocaleString()} characters)
            </span>
          </label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 max-h-64 overflow-auto">
            <pre className="text-xs whitespace-pre-wrap font-mono text-gray-700">
              {currentDocument}
            </pre>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Query
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {currentQueries.map((sq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setQuery(sq)}
                className={`text-xs px-2 py-1 rounded hover:opacity-80 ${
                  useExceedTest
                    ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {sq}
              </button>
            ))}
          </div>
          {useExceedTest && (
            <p className="mt-2 text-xs text-orange-700">
              💡 These questions can only be answered from Appendix Z at the end of the document (~250,000 characters in).
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Submit Query'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {response && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Answer:</h3>
              <p className="text-gray-800 whitespace-pre-wrap">{response.answer}</p>
            </div>

            <div className="border-t pt-3">
              <h3 className="font-semibold text-gray-900 mb-2">Context Used:</h3>
              <div className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40 whitespace-pre-wrap break-words overflow-wrap-anywhere font-mono">
                {response.context_used}
              </div>
            </div>

            <div className="border-t pt-3 flex gap-4 text-sm text-gray-600">
              <span>⏱️ Response Time: {response.response_time.toFixed(2)}s</span>
              {response.tokens_used && <span>🔢 Tokens: {response.tokens_used}</span>}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
