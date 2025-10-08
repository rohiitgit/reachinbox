import axios from 'axios';
import { Email, SearchParams, ApiResponse } from '../types';

// Use environment variable for API URL, fallback to local development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const emailApi = {
  searchEmails: async (params: SearchParams): Promise<ApiResponse<Email[]>> => {
    const response = await api.get('/emails/search', { params });
    return response.data;
  },

  getEmailById: async (id: string): Promise<ApiResponse<Email>> => {
    const response = await api.get(`/emails/${id}`);
    return response.data;
  },

  updateCategory: async (id: string, category: string): Promise<ApiResponse<void>> => {
    const response = await api.patch(`/emails/${id}/category`, { category });
    return response.data;
  },

  generateReply: async (id: string): Promise<ApiResponse<{ suggestedReply: string }>> => {
    const response = await api.post(`/emails/${id}/reply`);
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/emails/stats/overview');
    return response.data;
  },

  getConnectionStatus: async (): Promise<ApiResponse<Record<string, boolean>>> => {
    const response = await api.get('/emails/status/connections');
    return response.data;
  }
};
