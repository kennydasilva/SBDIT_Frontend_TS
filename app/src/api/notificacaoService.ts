import api from "./axios";
import type { PaginatedResponse } from "./types";

export interface Notificacao {
    id: number;
    tipo: "DENUNCIA_RECEBIDA" | "ESTADO_ALTERADO" | "NOVA_PARA_REVISAO" | "ACIDENTE_REPORTADO" | "AGENTE_DESIGNADO" | "ANALISE_FALHOU" | "DENUNCIA_RELACIONADA";
    titulo: string;
    mensagem: string;
    denuncia_id: number | null;
    lida: boolean;
    criada_em: string;
}

// Avisa o contador da barra lateral para se actualizar logo (sem esperar
// pelo próximo intervalo) depois de marcar notificações como lidas.
export const EVENTO_NOTIFICACOES = "notificacoes-atualizadas";
const avisarAlteracao = () => window.dispatchEvent(new Event(EVENTO_NOTIFICACOES));

// Sem cache (httpCache): notificações têm de aparecer sempre actualizadas.
export const notificacaoService = {

    async listar(page: number = 1, soNaoLidas: boolean = false, pageSize?: number): Promise<PaginatedResponse<Notificacao>> {
        const params = { page, page_size: pageSize, ...(soNaoLidas ? { nao_lidas: 1 } : {}) };
        const response = await api.get<PaginatedResponse<Notificacao>>("/notificacoes/", { params });
        return response.data;
    },

    async contarNaoLidas(): Promise<number> {
        const response = await api.get<{ nao_lidas: number }>("/notificacoes/contagem/");
        return response.data.nao_lidas;
    },

    async marcarLida(id: number): Promise<void> {
        await api.patch(`/notificacoes/${id}/lida/`);
        avisarAlteracao();
    },

    async marcarTodasLidas(): Promise<void> {
        await api.patch("/notificacoes/marcar-todas-lidas/");
        avisarAlteracao();
    },
};
