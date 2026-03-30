import { tr } from "zod/v4/locales";
import api from "./axios";

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
            const response= await api.get<AdminResponse[]>("/admins/");

            return response.data.map(admin => ({
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