import { tr } from "zod/v4/locales";
import api from "./axios";



export interface PT{
    id:number;
    nome:string;
    email:string;
    numero_agente:string;
    localizacao: string;
    admin_id:number;
}

export interface CreatePTData{
    nome:string;
    email:string;
    password:string;
    numero_agente:string;
    localizacao:string;
    admin_id:number;
}

export interface UpdatePTData {
  pt_id: number;
  nome?: string;
  numero_agente:string;
  localizacao:string;
}

export interface PTResponse {
  id: number;
  nome: string;
  email: string;
  numero_agente:string;
  localizacao:string;
  admin_id:number;
}

export interface PTUserResponse {
    id: number;
    nome: string;
    email: string;
    numero_agente: string;
    localizacao: string;
    data_registo: string;
    numero: string;
    admin_id: number;
}



export const ptService={


    async getPtyId(userid:number): Promise<PTUserResponse>{

        try{

            const response= await api.get<PTUserResponse>(`/pts/user/${userid}/`);

            return response.data;
        }
        catch(error){
            console.error("Erro ao obter PT por ID: ", error);
            throw error;
        }

    },

    async listarPT(adminId: number): Promise<PT[]> {
        try{

            alert("id do admin 1: " + adminId); 
        
            const response= await api.get<PT[]>(`/pts/admin/${adminId}/`);

            return response.data;

        }
        catch(error)
        {
            console.error("Erro ao listar Policia de Transito: ", error);
            throw error;
        }
    },



    async criarPT(data: CreatePTData): Promise<{message: string; id:number}>{
        try{

             alert("id do admin 2: " + data.admin_id);
            const response= await api.post("/pts/", data);
            return response.data;
        }
        catch(error){
            console.error("Erro ao criar PT: ", error);
           throw error;
        }
    },


    async atualizarPT(data: UpdatePTData): Promise<{message:string}>{
        try{
            const response=await api.put(`/pts/${data.pt_id}/`, data);
            return response.data;
        }
        catch(error){
            console.error("Erro ao atualizar PT: ", error);
            throw error;
        }
    },

    async apagarPT(id: number): Promise<{message:string}>{
        try{
            const response=await api.delete(`/pts/${id}/`);
            
            return response.data;

        }
        catch(error){
            console.error("Errro ao apagar PT: ", error);
            throw error;
        }
    }
};