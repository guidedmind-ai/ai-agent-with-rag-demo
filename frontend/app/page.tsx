'use client';

import { useEffect, useState } from 'react';
import RAGPanel from '@/components/RAGPanel';
import FullContextPanel from '@/components/FullContextPanel';
import { api } from '@/lib/api';

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<any>(null);
  const [checkingHealth, setCheckingHealth] = useState(true);

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const health = await api.healthCheck();
      setBackendStatus(health);
    } catch (error) {
      setBackendStatus({ status: 'error', message: 'Backend not available' });
    } finally {
      setCheckingHealth(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">AI Agent Demo: RAG vs Full Context</h1>
          <p className="mt-2 text-blue-100">
            Compare how RAG-based context retrieval differs from using full document context
          </p>
        </div>
      </header>

      {/* Backend Status */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          {checkingHealth ? (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
              <span>Checking backend status...</span>
            </div>
          ) : backendStatus?.model_loaded ? (
            <div className="flex items-center gap-2 text-green-700">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <span>
                Backend Ready - Model: <strong>{backendStatus.model_name}</strong>
                {backendStatus.context_window_limit && (
                  <span className="ml-2 text-xs text-gray-600">
                    (Context: {(backendStatus.context_window_limit / 1024).toFixed(1)}k tokens)
                  </span>
                )}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-700">
              <div className="h-3 w-3 bg-red-500 rounded-full"></div>
              <span>Backend Not Available - Please start the backend server</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Left Panel - RAG */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
            <RAGPanel />
          </div>

          {/* Right Panel - Full Context */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
            <FullContextPanel />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4 mt-6">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>RAG Service: GuidedMind API | LLM: Phi-3-mini-4k-instruct (4-bit)</p>
        </div>
      </footer>
    </div>
  );
}
