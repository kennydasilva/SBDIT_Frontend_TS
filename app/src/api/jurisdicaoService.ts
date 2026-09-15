import api from "./axios";
import { limparCache } from "./httpCache";

export interface LimitesVia {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface PontoVia {
  lat: number;
  lng: number;
}

export interface GeometriaVia {
  lat: number;
  lng: number;
  bounds?: LimitesVia;
  // Só presente em vias desenhadas manualmente no mapa (ver DesenharVia em
  // Jurisdicoes.tsx) - o traçado exacto, em vez de só um retângulo
  // aproximado. `bounds` continua a ser o que o backend usa para decidir a
  // que posto pertence uma coordenada.
  path?: PontoVia[];
}

export interface ViaJurisdicao {
  id: number;
  nome_via: string;
  place_id: string;
  geometria: GeometriaVia | null;
}

export interface AddViaData {
  nome_via: string;
  place_id: string;
  geometria?: GeometriaVia | null;
}

export interface ViaEncontrada {
  nome_via: string;
  place_id: string;
  tipo_via?: string;
  geometria: GeometriaVia | null;
}

export interface BairroEncontrado {
  nome: string;
  display_name: string;
  osm_type: string;
  osm_id: number;
}

export const jurisdicaoService = {
  async listarPorAdmin(adminId: number): Promise<ViaJurisdicao[]> {
    try {
      const response = await api.get<ViaJurisdicao[]>(`/admin/${adminId}/vias/`);
      return response.data;
    } catch (error) {
      console.error("Erro ao listar vias da jurisdição: ", error);
      throw error;
    }
  },

  async adicionarVia(adminId: number, data: AddViaData): Promise<{ message: string; id: number }> {
    try {
      const response = await api.post<{ message: string; id: number }>(`/admin/${adminId}/vias/`, data);
      limparCache(`/admin/${adminId}/vias/`);
      return response.data;
    } catch (error) {
      console.error("Erro ao adicionar via à jurisdição: ", error);
      throw error;
    }
  },

  async removerVia(adminId: number, viaId: number): Promise<void> {
    try {
      await api.delete(`/admin/${adminId}/vias/${viaId}/`);
      limparCache(`/admin/${adminId}/vias/`);
    } catch (error) {
      console.error("Erro ao remover via da jurisdição: ", error);
      throw error;
    }
  },

  async adicionarViasBulk(adminId: number, vias: ViaEncontrada[]): Promise<{ message: string; total: number }> {
    try {
      const response = await api.post<{ message: string; total: number }>(`/admin/${adminId}/vias-bulk/`, { vias });
      limparCache(`/admin/${adminId}/vias/`);
      return response.data;
    } catch (error) {
      console.error("Erro ao adicionar vias em massa à jurisdição: ", error);
      throw error;
    }
  },

  async pesquisarVias(query: string): Promise<ViaEncontrada[]> {
    try {
      const response = await api.get<ViaEncontrada[]>("/vias/pesquisar/", { params: { q: query } });
      return response.data;
    } catch (error) {
      console.error("Erro ao pesquisar vias: ", error);
      throw error;
    }
  },

  async pesquisarBairros(query: string): Promise<BairroEncontrado[]> {
    try {
      const response = await api.get<BairroEncontrado[]>("/vias/pesquisar-bairro/", { params: { q: query } });
      return response.data;
    } catch (error) {
      console.error("Erro ao pesquisar bairros: ", error);
      throw error;
    }
  },

  async listarViasDoBairro(osmType: string, osmId: number): Promise<ViaEncontrada[]> {
    try {
      const response = await api.get<ViaEncontrada[]>(`/vias/bairro/${osmType}/${osmId}/`);
      return response.data;
    } catch (error) {
      console.error("Erro ao listar vias do bairro: ", error);
      throw error;
    }
  },
};
