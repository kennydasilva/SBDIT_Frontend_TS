import api from "./axios";
import type { DenunciaDetalhada } from "./denunciaService";
import type { PT } from "./ptService";
import type { PaginatedResponse } from "./types";

export interface Admin{
    id:number;
    nome:string;
    email:string;
    posto:string;
    dataCriacao?: string;
    status?:"Ativo" | "Inativo";
}

export interface CreateAdminData{
    nome:string;
    email:string;
    password:string;
    posto:string;
}

export interface UpdateAdminData {
  admin_id: number;
  nome?: string;
  posto?: string;
}

export interface AdminResponse {
  id: number;
  nome: string;
  email: string;
  posto: string;
}



export const adminService={

    async listarAdmins(): Promise<Admin[]> {
        try{
            const response= await api.get<PaginatedResponse<AdminResponse>>("/admins/");

            return response.data.results.map(admin => ({
                id: admin.id,
                nome: admin.nome,
                email: admin.email,
                posto: admin.posto,
                dataCriacao: new Date().toISOString().split('T')[0],
                status: "Ativo"
            }));

        }
        catch(error)
        {
            console.error("Erro ao listar administradores: ", error);
            throw error;
        }
    },



    async criarAdmin(data: CreateAdminData): Promise<{message: string; id:number}>{
        try{
            const response= await api.post("/admins/", data);
            return response.data;
        }
        catch(error){
            console.error("Erro ao criar administrador: ", error);
           throw error;
        }
    },


    async atualizarAdmin(data: UpdateAdminData): Promise<{message:string}>{
        try{
            const response=await api.put("/admins/", data);
            return response.data;
        }
        catch(error){
            console.error("Erro ao atualizar administrador: ", error);
            throw error;
        }
    },

    async apagarAdmin(admin_id: number): Promise<{message:string}>{
        try{
            const response=await api.delete("/admins/", {data: {admin_id: admin_id}
            });
            return response.data;

        }
        catch(error){
            console.error("Errro ao apagar administrador: ", error);
            throw error;
        }
    }
};



export interface cidadao{
    id:number;
    nome:string;
    email:string;
    data_registo:string;
    numero: string;
    ativo?: boolean;
}

export const superAdminService = {

    async listarCidadao(): Promise<cidadao[]> {
        try{
            const response= await api.get<PaginatedResponse<cidadao>>("/cidadao/lista/");
            return response.data.results;
        }
        catch(error)
        {
            console.error("Erro ao listar cidadãos: ", error);
            throw error;
        }
    },

    async alterarStatusCidadao(cidadaoId: number, ativo: boolean): Promise<{message: string}> {
        try{
            const response = await api.patch<{message: string}>(`/cidadao/${cidadaoId}/status/`, { ativo });
            return response.data;
        }
        catch(error)
        {
            console.error("Erro ao alterar estado do cidadão: ", error);
            throw error;
        }
    },

    async listarPts(): Promise<PT[]> {
        try{
            const response= await api.get<PaginatedResponse<PT>>("/pts/");
            return response.data.results;
        }
        catch(error)
        {
            console.error("Erro ao listar Policias de Trânsito: ", error);
            throw error;
        }
    },

    async listarDenuncias(): Promise<DenunciaDetalhada[]> {
        try{
            const response= await api.get<PaginatedResponse<DenunciaDetalhada>>("/denuncias/");
            return response.data.results;
        }
        catch(error)
        {
            console.error("Erro ao listar Denuncias: ", error);
            throw error;
        }

    },

};