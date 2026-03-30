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



export const ptService={

    async listarPT(): Promise<PT[]> {
        try{
            const response= await api.get<PTResponse[]>("/pts/");

            return response.data.map(pt => ({
                id: pt.id,
                nome: pt.nome,
                email: pt.email,
                numero_agente: pt.numero_agente,
                localizacao: pt.localizacao,
                admin_id:pt.admin_id,
                
            }));

        }
        catch(error)
        {
            console.error("Erro ao listar Policia de Transito: ", error);
            throw error;
        }
    },



    async criarPT(data: CreatePTData): Promise<{message: string; id:number}>{
        try{
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
            const response=await api.put("/pts/", data);
            return response.data;
        }
        catch(error){
            console.error("Erro ao atualizar PT: ", error);
            throw error;
        }
    },

    async apagarPT(id: number): Promise<{message:string}>{
        try{
            const response=await api.delete("/pts/", {data: {id: id}
            });
            return response.data;

        }
        catch(error){
            console.error("Errro ao apagar PT: ", error);
            throw error;
        }
    }
};