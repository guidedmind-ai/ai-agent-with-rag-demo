import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export interface RAGQueryRequest {
  query: string;
  rag_endpoint: string;
  api_key: string;
  rag_payload: any;
}

export interface FullContextQueryRequest {
  query: string;
  full_context: string;
}

export interface QueryResponse {
  answer: string;
  context_used: string;
  tokens_used?: number;
  response_time: number;
  metadata?: any;
}

export const api = {
  async queryWithRAG(request: RAGQueryRequest): Promise<QueryResponse> {
    const response = await axios.post(`${API_BASE_URL}/api/query-rag`, request);
    return response.data;
  },

  async queryWithFullContext(request: FullContextQueryRequest): Promise<QueryResponse> {
    const response = await axios.post(`${API_BASE_URL}/api/query-full-context`, request);
    return response.data;
  },

  async healthCheck(): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/api/health`);
    return response.data;
  }
};
