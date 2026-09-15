import { useEffect, useState } from "react";
import { GoogleMap, MarkerF, Rectangle, useJsApiLoader } from "@react-google-maps/api";
import { AlertTriangle, Loader2, MapPinned, Search, Trash2, Plus, LandPlot } from "lucide-react";
import { adminService } from "../../api/superAdminService";
import type { Admin } from "../../api/superAdminService";
import {
  jurisdicaoService,
  type ViaJurisdicao,
  type ViaEncontrada,
  type BairroEncontrado,
} from "../../api/jurisdicaoService";
import { configService } from "../../api/configService";
import { GOOGLE_MAPS_LIBRARIES, CENTRO_PADRAO_MAPA } from "../../utils/maps";
import { CARD, INPUT, LABEL, BUTTON_PRIMARY, BUTTON_SECONDARY } from "../../utils/uiClasses";

const containerStyle = { width: "100%", height: "280px", borderRadius: "0.5rem" };

/** Espera o utilizador parar de escrever antes de disparar a pesquisa. */
function useDebounced<T>(valor: T, atrasoMs = 400): T {
  const [debounced, setDebounced] = useState(valor);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(valor), atrasoMs);
    return () => clearTimeout(t);
  }, [valor, atrasoMs]);

  return debounced;
}

export default function Jurisdicoes() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [adminSelecionado, setAdminSelecionado] = useState<number | "">("");
  const [vias, setVias] = useState<ViaJurisdicao[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [loadingVias, setLoadingVias] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    carregarAdmins();
    configService.obterPublica().then((config) => {
      if (config.GOOGLE_MAPS_API_KEY) setApiKey(config.GOOGLE_MAPS_API_KEY);
    });
  }, []);

  useEffect(() => {
    if (adminSelecionado === "") {
      setVias([]);
      return;
    }
    carregarVias(adminSelecionado);
  }, [adminSelecionado]);

  const carregarAdmins = async () => {
    try {
      setLoadingAdmins(true);
      setError(null);
      const { results: data } = await adminService.listarAdmins();
      setAdmins(data);
    } catch (err) {
      setError("Erro ao carregar administradores.");
    } finally {
      setLoadingAdmins(false);
    }
  };

  const carregarVias = async (adminId: number) => {
    try {
      setLoadingVias(true);
      const data = await jurisdicaoService.listarPorAdmin(adminId);
      setVias(data);
    } catch (err) {
      alert("Erro ao carregar vias da jurisdição.");
    } finally {
      setLoadingVias(false);
    }
  };

  const handleRemover = async (viaId: number) => {
    if (adminSelecionado === "") return;

    try {
      await jurisdicaoService.removerVia(adminSelecionado, viaId);
      await carregarVias(adminSelecionado);
    } catch (err) {
      alert("Erro ao remover via.");
    }
  };

  if (loadingAdmins) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <p className="text-rose-600">{error}</p>
          <button
            onClick={carregarAdmins}
            className={`${BUTTON_PRIMARY} mt-4`}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50/50 min-h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Jurisdições dos Postos</h1>
        <p className="text-gray-500 mt-1">
          Define as vias/estradas sob responsabilidade de cada posto (administrador)
        </p>
      </div>

      <div className={`${CARD} p-4 mb-6`}>
        <label className={LABEL}>Posto (Administrador)</label>
        <select
          value={adminSelecionado}
          onChange={(e) => setAdminSelecionado(e.target.value ? Number(e.target.value) : "")}
          className={INPUT}
        >
          <option value="">Selecione um posto...</option>
          {admins.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome} — {a.posto}
            </option>
          ))}
        </select>
      </div>

      {adminSelecionado !== "" && (
        <>
          <PesquisaVia
            adminId={adminSelecionado}
            onViaAdicionada={() => carregarVias(adminSelecionado)}
          />

          <PesquisaBairro
            adminId={adminSelecionado}
            onViasAdicionadas={() => carregarVias(adminSelecionado)}
          />

          {apiKey ? (
            <MapaVias apiKey={apiKey} vias={vias} />
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 p-4 text-sm text-gray-500 mb-6">
              <MapPinned size={16} />
              A carregar mapa...
            </div>
          )}

          <div className={`${CARD} overflow-hidden`}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <MapPinned size={18} className="text-gray-500" />
              <h2 className="font-semibold text-gray-900">Vias atribuídas ({vias.length})</h2>
            </div>

            {loadingVias ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : vias.length === 0 ? (
              <p className="p-6 text-center text-gray-500">Nenhuma via atribuída a este posto ainda.</p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {vias.map((v) => (
                  <li key={v.id} className="flex items-center justify-between px-6 py-3">
                    <span className="text-sm text-gray-900">{v.nome_via}</span>
                    <button
                      onClick={() => handleRemover(v.id)}
                      className="text-rose-600 hover:text-rose-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Pesquisa uma via/estrada específica pelo nome (OpenStreetMap Nominatim,
 * filtrado a resultados classificados como via - exclui estabelecimentos,
 * terminais, etc., que antes apareciam misturados na pesquisa do Google
 * Places).
 */
function PesquisaVia({
  adminId,
  onViaAdicionada,
}: {
  adminId: number;
  onViaAdicionada: () => void;
}) {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<ViaEncontrada[]>([]);
  const [pesquisando, setPesquisando] = useState(false);
  const [adicionandoId, setAdicionandoId] = useState<string | null>(null);
  const queryDebounced = useDebounced(query);

  useEffect(() => {
    if (queryDebounced.trim().length < 3) {
      setResultados([]);
      return;
    }

    let cancelado = false;
    setPesquisando(true);

    jurisdicaoService
      .pesquisarVias(queryDebounced)
      .then((data) => {
        if (!cancelado) setResultados(data);
      })
      .catch(() => {
        if (!cancelado) setResultados([]);
      })
      .finally(() => {
        if (!cancelado) setPesquisando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [queryDebounced]);

  const handleAdicionar = async (via: ViaEncontrada) => {
    try {
      setAdicionandoId(via.place_id);
      await jurisdicaoService.adicionarVia(adminId, {
        nome_via: via.nome_via,
        place_id: via.place_id,
        geometria: via.geometria,
      });
      setQuery("");
      setResultados([]);
      onViaAdicionada();
    } catch (err) {
      alert("Erro ao adicionar via.");
    } finally {
      setAdicionandoId(null);
    }
  };

  return (
    <div className={`${CARD} p-4 mb-6`}>
      <label className={LABEL}>Adicionar via/estrada à jurisdição</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex: Avenida Vladimir Lenine, Hulene..."
          className={`${INPUT} pl-9`}
        />
        {pesquisando && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" size={16} />
        )}
      </div>

      {resultados.length > 0 && (
        <ul className="mt-2 rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          {resultados.map((via) => (
            <li key={via.place_id} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50/60">
              <span className="text-sm text-gray-700">{via.nome_via}</span>
              <button
                onClick={() => handleAdicionar(via)}
                disabled={adicionandoId === via.place_id}
                className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {adicionandoId === via.place_id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {!pesquisando && queryDebounced.trim().length >= 3 && resultados.length === 0 && (
        <p className="mt-2 text-xs text-gray-500">Nenhuma via encontrada para "{queryDebounced}".</p>
      )}
    </div>
  );
}

/**
 * Pesquisa um bairro e lista de uma vez todas as vias nomeadas lá dentro
 * (OpenStreetMap Overpass), para não ter de adicionar via a via quando o
 * posto cobre o bairro inteiro.
 */
function PesquisaBairro({
  adminId,
  onViasAdicionadas,
}: {
  adminId: number;
  onViasAdicionadas: () => void;
}) {
  const [query, setQuery] = useState("");
  const [bairros, setBairros] = useState<BairroEncontrado[]>([]);
  const [pesquisando, setPesquisando] = useState(false);
  const [bairroSelecionado, setBairroSelecionado] = useState<BairroEncontrado | null>(null);
  const [viasDoBairro, setViasDoBairro] = useState<ViaEncontrada[]>([]);
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());
  const [carregandoVias, setCarregandoVias] = useState(false);
  const [erroVias, setErroVias] = useState<string | null>(null);
  const [adicionando, setAdicionando] = useState(false);
  const queryDebounced = useDebounced(query);

  useEffect(() => {
    if (queryDebounced.trim().length < 3) {
      setBairros([]);
      return;
    }

    let cancelado = false;
    setPesquisando(true);

    jurisdicaoService
      .pesquisarBairros(queryDebounced)
      .then((data) => {
        if (!cancelado) setBairros(data);
      })
      .catch(() => {
        if (!cancelado) setBairros([]);
      })
      .finally(() => {
        if (!cancelado) setPesquisando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [queryDebounced]);

  const handleEscolherBairro = async (bairro: BairroEncontrado) => {
    setBairroSelecionado(bairro);
    setBairros([]);
    setQuery("");
    setViasDoBairro([]);
    setErroVias(null);

    try {
      setCarregandoVias(true);
      const data = await jurisdicaoService.listarViasDoBairro(bairro.osm_type, bairro.osm_id);
      setViasDoBairro(data);
      setSelecionadas(new Set(data.map((v) => v.place_id)));
    } catch (err: any) {
      setErroVias(
        err?.response?.data?.error || "Não foi possível obter as vias deste bairro. Tenta novamente daqui a pouco."
      );
    } finally {
      setCarregandoVias(false);
    }
  };

  const alternarSelecao = (placeId: string) => {
    setSelecionadas((prev) => {
      const nova = new Set(prev);
      if (nova.has(placeId)) nova.delete(placeId);
      else nova.add(placeId);
      return nova;
    });
  };

  const handleAdicionarSelecionadas = async () => {
    const vias = viasDoBairro.filter((v) => selecionadas.has(v.place_id));
    if (vias.length === 0) return;

    try {
      setAdicionando(true);
      await jurisdicaoService.adicionarViasBulk(adminId, vias);
      setBairroSelecionado(null);
      setViasDoBairro([]);
      onViasAdicionadas();
    } catch (err) {
      alert("Erro ao adicionar vias do bairro.");
    } finally {
      setAdicionando(false);
    }
  };

  return (
    <div className={`${CARD} p-4 mb-6`}>
      <label className={LABEL}>
        <div className="flex items-center gap-2">
          <LandPlot size={16} />
          Carregar todas as vias de um bairro
        </div>
      </label>
      <p className="text-xs text-gray-500 mb-2">
        Pesquisa o bairro (ex: "Albazine") e escolhe quais das vias encontradas fazem parte da jurisdição.
      </p>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex: Albazine, Mavalane..."
          className={`${INPUT} pl-9`}
        />
        {pesquisando && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" size={16} />
        )}
      </div>

      {bairros.length > 0 && (
        <ul className="mt-2 rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          {bairros.map((b) => (
            <li key={`${b.osm_type}-${b.osm_id}`}>
              <button
                onClick={() => handleEscolherBairro(b)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50/60"
              >
                {b.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {bairroSelecionado && (
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
          <p className="text-sm font-medium text-gray-900 mb-3">{bairroSelecionado.nome}</p>

          {carregandoVias ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin" />
              A procurar vias do bairro...
            </div>
          ) : erroVias ? (
            <p className="text-sm text-rose-600">{erroVias}</p>
          ) : viasDoBairro.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma via nomeada encontrada neste bairro.</p>
          ) : (
            <>
              <ul className="max-h-64 overflow-y-auto space-y-1 mb-3">
                {viasDoBairro.map((via) => (
                  <li key={via.place_id}>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selecionadas.has(via.place_id)}
                        onChange={() => alternarSelecao(via.place_id)}
                      />
                      {via.nome_via}
                    </label>
                  </li>
                ))}
              </ul>
              <div className="flex gap-3">
                <button
                  onClick={() => setBairroSelecionado(null)}
                  className={BUTTON_SECONDARY}
                  disabled={adicionando}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAdicionarSelecionadas}
                  disabled={adicionando || selecionadas.size === 0}
                  className={BUTTON_PRIMARY}
                >
                  {adicionando ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    `Adicionar ${selecionadas.size} via(s)`
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MapaVias({ apiKey, vias }: { apiKey: string; vias: ViaJurisdicao[] }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "sgdit-google-maps",
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  if (loadError || !isLoaded) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 p-4 text-sm text-gray-500 mb-6">
        <MapPinned size={16} />
        {loadError ? "Erro ao carregar o mapa." : "A carregar mapa..."}
      </div>
    );
  }

  return (
    <div className={`${CARD} p-4 mb-6`}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={vias.find((v) => v.geometria)?.geometria ?? CENTRO_PADRAO_MAPA}
        zoom={vias.some((v) => v.geometria) ? 13 : 11}
      >
        {vias.map((v) => {
          if (!v.geometria) return null;

          return (
            <div key={v.id} style={{ display: "contents" }}>
              {v.geometria.bounds && (
                <Rectangle
                  bounds={v.geometria.bounds}
                  options={{
                    strokeColor: "#2563EB",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: "#2563EB",
                    fillOpacity: 0.15,
                  }}
                />
              )}
              <MarkerF position={v.geometria} title={v.nome_via} />
            </div>
          );
        })}
      </GoogleMap>
      <p className="mt-2 text-xs text-gray-500">
        A área a azul é aproximada (limites da via/bairro no OpenStreetMap), não é o traçado exato da estrada.
      </p>
    </div>
  );
}
