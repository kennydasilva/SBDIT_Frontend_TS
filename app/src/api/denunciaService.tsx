import api from "./axios";


export interface Denuncia{
    id:number;
    matricula:string;
    tipo_infracao:string;
    data:string;
    estado:string;
    cidadao_id:number;
    pt_id:number;
    codigo_legal:string;
    descricao:string;
    foto_url:string;
    localizacao:string;
    data_registo:string;

}

export interface CreateDenunciaData{
    cidadao_id:number;
    matricula:string;
    descricao:string;
    tipo_infracao:string;
    localizacao:string;
    sentido_direccao:string;
    caminho_ficheiro:File;
}

export interface DenunciaResponse{
    id:number;
    matricula:string;
    estado:string;
    descricao:string;
}

export const denunciaService = {

    async criar (data:CreateDenunciaData):Promise<{message:string; id:number}>{

        try{
            const formData=new FormData();

            formData.append("cidadao_id", String(data.cidadao_id));
            formData.append("matricula", data.matricula);
            formData.append("descricao", data.descricao);
            formData.append("tipo_infracao", data.tipo_infracao);
            formData.append("localizacao", data.localizacao);

            if (data.sentido_direccao){
                formData.append("sentido_direccao", data.sentido_direccao);
            }
            
            formData.append("caminho_ficheiro", data.caminho_ficheiro);

            const response=await api.post("/denuncias", formData, {
                headers:{
                    "Content-Type":"multipart/form-data",
                }
            });

            return response.data;

        }
        catch(error){
            console.error("Erro ao criar denúncia:", error);
            throw error;
        }
    }
}