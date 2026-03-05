import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { PublicClientApplication } from '@azure/msal-browser';
import { apiRequest } from '@/config/authConfig';
import { API_CONFIG } from '@/config/appConfig';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types';

/**
 * API Service
 * Handles all HTTP requests to the backend with authentication
 */
class ApiService {
  private client: AxiosInstance;
  private msalInstance: PublicClientApplication | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle common errors
        if (error.response?.status === 401) {
          // Token expired - redirect to login
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setMsalInstance(instance: PublicClientApplication) {
    this.msalInstance = instance;
  }

  private async getAccessToken(): Promise<string | null> {
    if (!this.msalInstance) return null;

    const accounts = this.msalInstance.getAllAccounts();
    if (accounts.length === 0) return null;

    try {
      const response = await this.msalInstance.acquireTokenSilent({
        ...apiRequest,
        account: accounts[0],
      });
      return response.accessToken;
    } catch (error) {
      console.error('Failed to acquire token:', error);
      return null;
    }
  }

  // Generic request methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // Helper for paginated requests
  async getPaginated<T>(
    url: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<T>> {
    const response = await this.client.get<PaginatedResponse<T>>(url, { params });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
