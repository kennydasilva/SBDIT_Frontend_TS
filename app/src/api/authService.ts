import api from "./axios";

interface LoginResponse {
  access: string;
  refresh: string;
  user:{
    id:number;
    email:string;
    role:string;
  }
}

interface SignupData {
  nome?: string;
  email: string;
  password: string;
  [key: string]: any;
}

interface UserData{
  id: number;
  email:string;
  role:string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/login/", {
    email: email,
    password: password,
  });

  if (response.data.access && response.data.refresh) {
    localStorage.setItem("token", response.data.access);
    localStorage.setItem("refresh", response.data.refresh);
    
    localStorage.setItem("user", JSON.stringify(response.data.user));
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

export const getUserData=(): UserData | null =>{
  const userStr=localStorage.getItem("user");

  if (!userStr) return null;

  try{
    return JSON.parse(userStr);
  }
  catch{
    return null;
  }
};


export const logout=(): void =>{
  localStorage.removeItem("token");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
}