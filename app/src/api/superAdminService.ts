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



export interface cidadao{
    id:number;
    nome:string;
    email:string;
    data_registo:string;
    numero: string;
    
}


export interface Denuncia{
    id: number,
    matricula: string,
    estado: string,
    descricao: string,
    tipo_infracao: string,
    localizacao: string,
    sentido_direccao: string,
    data_registo: string,
    cidadao_id: number,
    pt_id: number
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
export const superAdminService = {

    async listarCidadao(): Promise<cidadao[]> {
        try{
            const response= await api.get<cidadao[]>("/cidadao/lista/");

            return response.data.map(cidadao => ({
                id: cidadao.id,
                nome: cidadao.nome,
                email: cidadao.email,
                data_registo: cidadao.data_registo,
                numero: cidadao.numero
            }));

        }
        catch(error)
        {
            console.error("Erro ao listar cidadãos: ", error);
            throw error;
        }
    },


    async listarPts(): Promise<PTUserResponse[]> {
        try{
            const response= await api.get<PTUserResponse[]>("/pts/lista/");

            return response.data.map(PTUserResponse => ({
                id: PTUserResponse.id,
                nome: PTUserResponse.nome,
                email: PTUserResponse.email,
                numero_agente: PTUserResponse.numero_agente,
                localizacao: PTUserResponse.localizacao,
                data_registo: PTUserResponse.data_registo,
                numero: PTUserResponse.numero,
                admin_id: PTUserResponse.admin_id
            }));

        }
        catch(error)
        {
            console.error("Erro ao listar Policias de Trânsito: ", error);
            throw error;
        }
    },

    async listarDenuncias(): Promise<Denuncia[]> {
        try{
            const response= await api.get<Denuncia[]>("/denuncia/lista/");

            return response.data.map(Denuncia => ({
                id: Denuncia.id,
                matricula: Denuncia.matricula,
                estado: Denuncia.estado,
                descricao: Denuncia.descricao,
                tipo_infracao: Denuncia.tipo_infracao,
                localizacao: Denuncia.localizacao,
                sentido_direccao: Denuncia.sentido_direccao,
                data_registo: Denuncia.data_registo,
                cidadao_id: Denuncia.cidadao_id,
                pt_id: Denuncia.pt_id
            }));

        }
        catch(error)
        {
            console.error("Erro ao listar Denuncias: ", error);
            throw error;
        }
               
    },

};