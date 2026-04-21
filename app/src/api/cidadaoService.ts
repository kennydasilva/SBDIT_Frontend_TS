import api from "./axios";



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

    async updateCidadao(dados: cidadao): Promise<cidadaoResponse> {
        try {
            
            const response = await api.put<cidadaoResponse>(`/cidadao/user/${dados.id}/`, dados);
            return response.data;
        } catch (error) {
            console.error("Erro ao atualizar cidadão: ", error);
            throw error;
        }
    },

    
};