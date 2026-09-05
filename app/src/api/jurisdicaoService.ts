import api from "./axios";
import { limparCache } from "./httpCache";

export interface ViaJurisdicao {
  id: number;
  nome_via: string;
  place_id: string;
  geometria: { lat: number; lng: number } | null;
}

export interface AddViaData {
  nome_via: string;
  place_id: string;
  geometria?: { lat: number; lng: number } | null;
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
};
