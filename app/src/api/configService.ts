import api from "./axios";
import { cachedGet, limparCache } from "./httpCache";

export interface ConfigEntry {
  chave: string;
  publica: boolean;
  descricao: string | null;
  valor_mascarado: string;
  atualizado_em: string;
}

export interface SetConfigData {
  chave: string;
  valor: string;
  publica: boolean;
  descricao?: string;
}

// Chaves públicas (ex: Google Maps) mudam muito raramente - TTL longo
const TTL_CONFIG_PUBLICA_MS = 5 * 60_000;

export const configService = {
  /** Só as chaves marcadas como públicas (ex: chave JS do Google Maps) */
  async obterPublica(): Promise<Record<string, string>> {
    try {
      return await cachedGet<Record<string, string>>(
        api,
        "/config/publica/",
        undefined,
        TTL_CONFIG_PUBLICA_MS
      );
    } catch (error) {
      console.error("Erro ao obter configuração pública: ", error);
      throw error;
    }
  },

  /** Gestão completa (Super Admin) - valores sempre mascarados na resposta */
  async listar(): Promise<ConfigEntry[]> {
    try {
      const response = await api.get<ConfigEntry[]>("/config/");
      return response.data;
    } catch (error) {
      console.error("Erro ao listar configurações: ", error);
      throw error;
    }
  },

  async definir(data: SetConfigData): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>("/config/", data);
      limparCache("/config/publica/");
      return response.data;
    } catch (error) {
      console.error("Erro ao guardar configuração: ", error);
      throw error;
    }
  },

  async apagar(chave: string): Promise<void> {
    try {
      await api.delete(`/config/${chave}/`);
      limparCache("/config/publica/");
    } catch (error) {
      console.error("Erro ao apagar configuração: ", error);
      throw error;
    }
  },
};
