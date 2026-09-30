import api from "./axios";
import type { PaginatedResponse } from "./types";

export interface FiltrosRelatorio {
  data_inicio?: string;   // AAAA-MM-DD
  data_fim?: string;
  admin_id?: string;      // id do posto, "sem_posto" ou vazio (todos) - só Super Admin
  tipo?: string;
  estado?: string;
}

export interface RelatorioResumo {
  total_denuncias: number;
  taxa_resolucao: number;
  tempo_medio_resposta_horas: number | null;
  por_estado: Record<string, number>;
  por_tipo_infracao: Record<string, number>;
  por_mes: { mes: string; total: number }[];
  por_posto: {
    admin_id: number | null;
    posto: string;
    total: number;
    aprovadas: number;
    acidentes: number;
    taxa_resolucao: number;
    tempo_medio_resposta_horas: number | null;
  }[];
  agentes: {
    pt_id: number;
    nome: string;
    numero_agente: string;
    posto: string | null;
    decisoes: number;
    aprovadas: number;
    arquivadas: number;
    tempo_medio_decisao_horas: number | null;
  }[];
  acidentes: {
    total: number;
    reportes_juntados: number;
    sem_posto: number;
    a_aguardar_agente: number;
    com_agente: number;
    tempo_medio_ate_designar_min: number | null;
  };
  qualidade: {
    rejeitadas_ia: number;
    video_ilegivel: number;
    testemunhas: number;
    videos_semelhantes: number;
    possiveis_falsas: number;
    taxa_rejeicao_ia: number;
  };
}

// Só envia os filtros preenchidos.
const limpar = (f: FiltrosRelatorio) =>
  Object.fromEntries(Object.entries(f).filter(([, v]) => v !== undefined && v !== ""));

// Sem cache: os relatórios mudam com os filtros e devem reflectir o estado actual.
export const relatorioService = {
  async obterResumo(filtros: FiltrosRelatorio): Promise<RelatorioResumo> {
    const response = await api.get<RelatorioResumo>("/relatorios/resumo/", { params: limpar(filtros) });
    return response.data;
  },

  /** Descarrega o ficheiro gerado no servidor (Excel ou PDF). */
  async exportar(formato: "excel" | "pdf", filtros: FiltrosRelatorio): Promise<void> {
    const response = await api.get(`/relatorios/exportar/${formato}/`, {
      params: limpar(filtros),
      responseType: "blob",
    });
    const disposicao = String(response.headers["content-disposition"] ?? "");
    const nome = /filename="?([^"]+)"?/.exec(disposicao)?.[1] ?? `relatorio-sgdit.${formato === "excel" ? "xlsx" : "pdf"}`;

    const url = URL.createObjectURL(response.data as Blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nome;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },

  /** Postos para o filtro do Super Admin. */
  async listarPostos(): Promise<{ id: number; posto: string }[]> {
    const response = await api.get<PaginatedResponse<{ id: number; posto: string }>>("/admins/", {
      params: { page_size: 100 },
    });
    return response.data.results;
  },
};
