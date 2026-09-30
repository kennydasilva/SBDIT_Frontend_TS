import api from "./axios";
import { limparCache } from "./httpCache";
import { mostrarSucesso } from "../utils/mensagens";

// Resultado do reencaminhamento: denúncias abertas sem posto que, com as
// zonas/vias actuais, passaram para um posto.
export interface Reencaminhamento {
  total: number;
  acidentes: number;
  sms: number;
  por_posto: Record<string, number>;
}

// Avisa quando adicionar uma zona/vias passou denúncias antigas sem posto
// para um posto (feito automaticamente no backend).
function avisarReencaminhadas(r?: Reencaminhamento) {
  if (!r || r.total === 0) return;
  const postos = Object.entries(r.por_posto).map(([p, n]) => `${p} (${n})`).join(", ");
  mostrarSucesso(
    `${r.total} ${r.total === 1 ? "denúncia sem posto passou" : "denúncias sem posto passaram"} para: ${postos}.` +
      (r.sms ? ` ${r.sms} SMS de acidente recente enviado(s).` : "")
  );
}

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

// GeoJSON Polygon/MultiPolygon tal como o Nominatim devolve - coordenadas em
// [lng, lat], não [lat, lng].
export interface PoligonoGeoJSON {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
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
  // Só presente em "zonas" (bairro inteiro) - o contorno real, mais preciso
  // que `bounds`. Ver `pesquisarBairros` + `obterPoligonoBairro`.
  polygon?: PoligonoGeoJSON;
}

export interface ViaJurisdicao {
  id: number;
  nome_via: string;
  place_id: string;
  geometria: GeometriaVia | null;
  // Só nas zonas (polígono): área em km² calculada no backend.
  area_km2?: number | null;
}

// Jurisdições de todos os postos ao mesmo tempo (mapa de cobertura).
export interface PostoJurisdicao {
  admin_id: number;
  posto: string;
  total_zonas: number;
  total_vias: number;
  area_km2_total: number;
  itens: ViaJurisdicao[];
}

// Denúncias que caíram fora de qualquer jurisdição.
export interface CoberturaJurisdicoes {
  total_sem_posto: number;
  sem_coordenadas: number;
  total_denuncias: number;
  pontos: {
    id: number;
    tipo_infracao: string;
    estado: string;
    latitude: number;
    longitude: number;
    localizacao: string | null;
    data_registo: string;
  }[];
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
  lat: number | null;
  lng: number | null;
}

export const jurisdicaoService = {
  async visaoGeral(): Promise<PostoJurisdicao[]> {
    const response = await api.get<PostoJurisdicao[]>("/jurisdicoes/visao-geral/");
    return response.data;
  },

  async reencaminhar(): Promise<Reencaminhamento> {
    const response = await api.post<Reencaminhamento>("/jurisdicoes/reencaminhar/");
    return response.data;
  },

  async cobertura(): Promise<CoberturaJurisdicoes> {
    const response = await api.get<CoberturaJurisdicoes>("/jurisdicoes/cobertura/");
    return response.data;
  },

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
      const response = await api.post<{ message: string; id: number; reencaminhadas?: Reencaminhamento }>(`/admin/${adminId}/vias/`, data);
      limparCache(`/admin/${adminId}/vias/`);
      avisarReencaminhadas(response.data.reencaminhadas);
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
      const response = await api.post<{ message: string; total: number; reencaminhadas?: Reencaminhamento }>(`/admin/${adminId}/vias-bulk/`, { vias });
      limparCache(`/admin/${adminId}/vias/`);
      avisarReencaminhadas(response.data.reencaminhadas);
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

  async obterPoligonoBairro(osmType: string, osmId: number): Promise<PoligonoGeoJSON> {
    try {
      const response = await api.get<{ polygon: PoligonoGeoJSON }>(`/vias/bairro/${osmType}/${osmId}/poligono/`);
      return response.data.polygon;
    } catch (error) {
      console.error("Erro ao obter o polígono do bairro: ", error);
      throw error;
    }
  },
};
