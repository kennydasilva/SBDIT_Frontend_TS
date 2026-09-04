// api/authService.ts
import axios from "axios";
import api from "./axios";

interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    role: string;
  }
}

interface SignupData {
  nome?: string;
  email: string;
  password: string;
  [key: string]: any;
}

interface UserData {
  id: number;
  email: string;
  role: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>("/login/", {
      email: email,
      password: password,
    });

    console.log("Login API response:", response.data); // Para debug

    if (response.data.access && response.data.refresh) {
      // Salvar tokens com as chaves corretas
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    console.error("Login API error:", error);
    throw error;
  }
};

export const refreshToken = async (): Promise<{ access: string }> => {
  const refresh = localStorage.getItem("refresh");

  if (!refresh) {
    throw new Error("No refresh token available");
  }

  // Nota: /token/refresh/ vive fora do prefixo /api/auth usado pela instância `api`
  const response = await axios.post<{ access: string }>(
    "http://127.0.0.1:8000/api/token/refresh/",
    { refresh: refresh }
  );

  if (response.data.access) {
    localStorage.setItem("access", response.data.access);
  }

  return response.data;
};

export const signup = async (data: SignupData): Promise<any> => {
  const response = await api.post("/cidadaos/registrar/", data);
  return response.data;
};

export const getUserData = (): UserData | null => {
  const userStr = localStorage.getItem("user");

  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const logout = (): void => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
};

export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>("/password-reset/", { email });
  return response.data;
};

export const confirmPasswordReset = async (
  uid: string,
  token: string,
  password: string
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>("/password-reset/confirm/", {
    uid,
    token,
    password,
  });
  return response.data;
};