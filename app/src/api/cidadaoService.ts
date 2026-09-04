import api from "./axios";
import { cachedGet } from "./httpCache";



export interface cidadao{
    id:number;
    nome:string;
    email:string;
    data_registo:string;
    numero: string;
    
}


export interface cidadaoResponse{
    id:number;
    nome:string;
    email:string;
    data_registo:string;
    numero: string;
    numero_denuncias?: number;
    codigo_ranking?: string;
}

export interface RankingEntry{
    posicao: number;
    codigo: string;
    numero_denuncias: number;
}





export const cidadaoService = {


    async getCidadaoId(userid:number): Promise<cidadaoResponse>{

        try{

            const response= await api.get<cidadaoResponse>(`/cidadao/user/${userid}/`);
            return response.data;
        }
        catch(error){
            console.error("Erro ao obter Cidadão por ID: ", error);
            throw error;
        }

    },

    async updateCidadao(dados: cidadao, userid: number): Promise<cidadaoResponse> {
        try {

            const response = await api.put<cidadaoResponse>(`/cidadao/user/${userid}/`, dados);
            return response.data;
        } catch (error) {
            console.error("Erro ao atualizar cidadão: ", error);
            throw error;
        }
    },

    async ranking(): Promise<RankingEntry[]> {
        try {
            return await cachedGet<RankingEntry[]>(api, "/cidadao/user/ranking/");
        } catch (error) {
            console.error("Erro ao obter ranking de cidadãos: ", error);
            throw error;
        }
    },

};