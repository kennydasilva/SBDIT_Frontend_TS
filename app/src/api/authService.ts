import api from "./axios";

interface LoginResponse {
  access: string;
  refresh: string;
}

interface SignupData {
  nome?: string;
  email: string;
  password: string;
  [key: string]: any;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/login/", {
    email: email,
    password: password,
  });

  if (response.data.access && response.data.refresh) {
    localStorage.setItem("token", response.data.access);
    localStorage.setItem("refresh", response.data.refresh);
  }

  return response.data;
};

export const refreshToken = async (): Promise<{ access: string }> => {
  const refresh = localStorage.getItem("refresh");
  
  if (!refresh) {
    throw new Error("No refresh token available");
  }
  
  const response = await api.post<{ access: string }>("/token/refresh/", {
    refresh: refresh,
  });
  
  if (response.data.access) {
    localStorage.setItem("token", response.data.access);
  }
  
  return response.data;
};

export const signup = async (data: SignupData): Promise<any> => {
  const response = await api.post("/cidadaos/registrar/", data);
  return response.data;
};