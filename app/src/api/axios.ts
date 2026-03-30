// api/axios.ts
import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from "axios";

const api: AxiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000/api/auth",
  headers: {
    "Content-type": "application/json",
  },
  withCredentials: false,
});

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // CORREÇÃO: Usar "access" em vez de "token" para ser consistente com o login
  const token = localStorage.getItem("access");
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refresh = localStorage.getItem("refresh");
        
        if (!refresh) {
          throw new Error("No refresh token");
        }
        
        const response = await axios.post(
          "http://127.0.0.1:8000/api/token/refresh/",
          { refresh: refresh }
        );
        
        if (response.data.access) {
          localStorage.setItem("access", response.data.access);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;