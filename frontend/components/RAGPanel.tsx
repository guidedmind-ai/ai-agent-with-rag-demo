'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { DEFAULT_RAG_ENDPOINT, DEFAULT_RAG_PAYLOAD, SAMPLE_QUERIES } from '@/lib/constants';

export default function RAGPanel() {
  const [endpoint, setEndpoint] = useState(DEFAULT_RAG_ENDPOINT);
  const [apiKey, setApiKey] = useState('');
  const [payload, setPayload] = useState(JSON.stringify(DEFAULT_RAG_PAYLOAD, null, 2));
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-update the query field in RAG payload when query changes
  useEffect(() => {
    try {
      const parsedPayload = JSON.parse(payload);
      parsedPayload.query = query;
      setPayload(JSON.stringify(parsedPayload, null, 2));
    } catch (e) {
      // If JSON is invalid, don't update
    }
  }, [query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const parsedPayload = JSON.parse(payload);

      const result = await api.queryWithRAG({
        query,
        rag_endpoint: endpoint,
        api_key: apiKey,
        rag_payload: parsedPayload
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
      <div className="bg-blue-50 border-b-2 border-blue-200 p-4">
        <h2 className="text-xl font-bold text-blue-900">RAG-Enabled Query</h2>
        <p className="text-sm text-blue-700">Using external RAG service for context retrieval</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            RAG Endpoint
          </label>
          <input
            type="text"
            value={endpoint}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Key (X-API-Key)
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            RAG Payload (JSON)
          </label>
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={12}
          />
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {SAMPLE_QUERIES.map((sq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setQuery(sq)}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
