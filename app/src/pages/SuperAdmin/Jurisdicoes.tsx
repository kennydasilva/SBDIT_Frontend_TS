import { useEffect, useRef, useState } from "react";

import { GoogleMap, MarkerF, Rectangle, Polyline, Polygon, useJsApiLoader } from "@react-google-maps/api";

import { Loader2, MapPinned, Search, Trash2, Plus, LandPlot, Route, PenLine, Undo2 } from "../../components/icons";
import { adminService } from "../../api/superAdminService";

import type { Admin } from "../../api/superAdminService";
import {
  jurisdicaoService,
  type ViaJurisdicao,
  type ViaEncontrada,
  type BairroEncontrado,
  type PontoVia,
  type LimitesVia,
} from "../../api/jurisdicaoService";

import { configService } from "../../api/configService";

import { GOOGLE_MAPS_LIBRARIES, CENTRO_PADRAO_MAPA, geoJsonParaAneis } from "../../utils/maps";

import MapaCobertura from "./MapaCobertura";
import { CARD, INPUT, LABEL, BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_DANGER, PAGE, ICON_BUTTON_DANGER, MODAL_FOOTER, LINK, TABLE_HEAD_CELL, TABLE_ROW_HOVER } from "../../utils/uiClasses";

import { mostrarErro } from "../../utils/mensagens";

import PageHeader from "../../components/app/PageHeader";
import Campo from "../../components/app/Campo";
import EmptyState from "../../components/app/EmptyState";
import { Link } from "react-router-dom";
import { PaginaEsqueleto } from "../../components/app/Carregando";

import { ErroPagina } from "../../components/app/Lista";


const containerStyle = { width: "100%", height: "280px", borderRadius: "0.5rem" };
const BADGE_TAG = "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium shrink-0";

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
  const [aba, setAba] = useState<"gerir" | "cobertura">("gerir");
  // Bairro escolhido na pesquisa só para o ver no mapa (não adiciona nada).
  const [centrarEm, setCentrarEm] = useState<{ lat: number; lng: number } | null>(null);

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
      mostrarErro(err, "Erro ao carregar as vias da jurisdição");
    } finally {
      setLoadingVias(false);
    }
  };

  const handleRemover = async (viaId: number): Promise<boolean> => {
    if (adminSelecionado === "") return false;

    try {
      await jurisdicaoService.removerVia(adminSelecionado, viaId);
      await carregarVias(adminSelecionado);
      return true;
    } catch (err) {
      mostrarErro(err, "Erro ao remover a via");
      return false;
    }
  };

  if (loadingAdmins) return <PaginaEsqueleto />;

  if (error) return <ErroPagina mensagem={error} onTentar={carregarAdmins} />;

  return (
    <div className={PAGE}>
      <PageHeader titulo="Jurisdições dos Postos" texto="Define as vias/estradas sob responsabilidade de cada posto (administrador)" />

      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {[
          { id: "gerir" as const, label: "Gerir posto" },
          { id: "cobertura" as const, label: "Mapa de cobertura" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setAba(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              aba === t.id ? "border-blue-600 text-blue-800" : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {aba === "cobertura" ? (
        apiKey ? (
          <MapaCobertura apiKey={apiKey} />
        ) : (
          <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
            <MapPinned size={16} />
            A carregar mapa...
          </div>
        )
      ) : (
      <>

      <div className={`${CARD} mb-6 p-4`}>
        <Campo rotulo="Posto" className="max-w-md">
          <select
            value={adminSelecionado}
            onChange={(e) => setAdminSelecionado(e.target.value ? Number(e.target.value) : "")}
            className={INPUT}
          >
            <option value="">Escolha um posto…</option>
            {admins.map((a) => (
              <option key={a.id} value={a.id}>
                {a.posto} ({a.nome})
              </option>
            ))}
          </select>
        </Campo>
      </div>

      {/* Sem posto escolhido: a lista de postos, em vez de uma página vazia. */}
      {adminSelecionado === "" && (
        <div className={`${CARD} overflow-hidden`}>
          {admins.length === 0 ? (
            <EmptyState
              icon={MapPinned}
              titulo="Ainda não há postos"
              texto="Cada posto é criado com o seu administrador. Depois de criado, atribua-lhe aqui as vias da sua jurisdição."
              acao={<Link to="/super-admin/admins" className={BUTTON_PRIMARY}>Criar administrador</Link>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className={TABLE_HEAD_CELL}>Posto</th>
                    <th className={TABLE_HEAD_CELL}>Administrador</th>
                    <th className={TABLE_HEAD_CELL}><span className="sr-only">Abrir</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {admins.map((a) => (
                    <tr key={a.id} className={TABLE_ROW_HOVER}>
                      <td className="px-6 py-3.5 text-sm font-medium text-gray-900">{a.posto}</td>
                      <td className="px-6 py-3.5 text-sm text-gray-700">{a.nome}</td>
                      <td className="px-6 py-3.5 text-right text-sm">
                        <button type="button" onClick={() => setAdminSelecionado(a.id)} className={LINK}>
                          Gerir jurisdição
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {adminSelecionado !== "" && (
        <>
          <PesquisaJurisdicao
            adminId={adminSelecionado}
            onViasAdicionadas={() => carregarVias(adminSelecionado)}
            onCentrar={setCentrarEm}
          />

          {apiKey ? (
            <MapaVias
              apiKey={apiKey}
              vias={vias}
              adminId={adminSelecionado}
              centrarEm={centrarEm}
              onViaAdicionada={() => carregarVias(adminSelecionado)}
              onRemoverVia={handleRemover}
            />
          ) : (
            <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-gray-50 p-4 text-sm text-gray-600 mb-6">
              <MapPinned size={16} />
              A carregar mapa...
            </div>
          )}

          <div className={`${CARD} overflow-hidden`}>
            <div className="px-6 py-3.5 border-b border-gray-200 flex items-center gap-2">
              <MapPinned size={18} className="text-gray-500" />
              <h2 className="font-semibold text-gray-900">Vias atribuídas ({vias.length})</h2>
              {vias.some((v) => v.area_km2 != null) && (
                <span className="ml-auto text-sm text-gray-500">
                  Área em zonas:{" "}
                  <strong className="text-gray-900">
                    {vias.reduce((t, v) => t + (v.area_km2 ?? 0), 0).toFixed(2)} km²
                  </strong>
                </span>
              )}
            </div>

            {loadingVias ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : vias.length === 0 ? (
              <p className="p-6 text-center text-gray-500">Nenhuma via atribuída a este posto ainda.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {vias.map((v) => (
                  <li key={v.id} className="flex items-center justify-between px-6 py-3">
                    <span className="text-sm text-gray-900">
                      {v.nome_via}
                      {v.area_km2 != null && (
                        <span className="ml-2 text-xs text-gray-500">zona · {v.area_km2} km²</span>
                      )}
                    </span>
                    <button
                      onClick={() => handleRemover(v.id)}
                      className={ICON_BUTTON_DANGER} aria-label="Eliminar" title="Eliminar"
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
      </>
      )}
    </div>
  );
}

/**
 * Uma única pesquisa que serve para as duas coisas que se pode fazer aqui:
 * - Encontrar UMA via específica pelo nome e adicioná-la directamente.
 * - Encontrar um BAIRRO e, a partir dele, carregar todas as vias lá dentro
 *   de uma vez (OpenStreetMap Overpass), escolhendo quais adicionar.
 *
 * Os dois tipos de resultado aparecem na mesma lista, cada um com o rótulo
 * "Via" ou "Bairro" e um ícone diferente, para ficar óbvio o que cada linha
 * faz ao clicar - "Via" adiciona logo, "Bairro" abre a lista de vias dele.
 * (Antes eram duas caixas de pesquisa separadas, e não ficava claro qual
 * delas usar para quê.)
 */
function PesquisaJurisdicao({
  adminId,
  onViasAdicionadas,
  onCentrar,
}: {
  adminId: number;
  onViasAdicionadas: () => void;
  onCentrar: (ponto: { lat: number; lng: number }) => void;
}) {
  const [query, setQuery] = useState("");
  const [vias, setViasResultado] = useState<ViaEncontrada[]>([]);
  const [bairros, setBairros] = useState<BairroEncontrado[]>([]);
  const [pesquisando, setPesquisando] = useState(false);
  const [adicionandoId, setAdicionandoId] = useState<string | null>(null);
  const [bairroSelecionado, setBairroSelecionado] = useState<BairroEncontrado | null>(null);
  const [viasDoBairro, setViasDoBairro] = useState<ViaEncontrada[]>([]);
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());
  const [carregandoVias, setCarregandoVias] = useState(false);
  const [erroVias, setErroVias] = useState<string | null>(null);
  const [adicionando, setAdicionando] = useState(false);
  const [adicionandoZonaId, setAdicionandoZonaId] = useState<string | null>(null);
  const [erroZona, setErroZona] = useState<string | null>(null);
  const queryDebounced = useDebounced(query);

  useEffect(() => {
    if (queryDebounced.trim().length < 3) {
      setViasResultado([]);
      setBairros([]);
      return;
    }

    let cancelado = false;
    setPesquisando(true);

    Promise.all([
      jurisdicaoService.pesquisarVias(queryDebounced).catch(() => []),
      jurisdicaoService.pesquisarBairros(queryDebounced).catch(() => []),
    ])
      .then(([vias, bairros]) => {
        if (cancelado) return;
        setViasResultado(vias);
        setBairros(bairros);
      })
      .finally(() => {
        if (!cancelado) setPesquisando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [queryDebounced]);

  const handleAdicionarVia = async (via: ViaEncontrada) => {
    try {
      setAdicionandoId(via.place_id);
      await jurisdicaoService.adicionarVia(adminId, {
        nome_via: via.nome_via,
        place_id: via.place_id,
        geometria: via.geometria,
      });
      setQuery("");
      setViasResultado([]);
      setBairros([]);
      onViasAdicionadas();
    } catch (err) {
      mostrarErro(err, "Erro ao adicionar a via");
    } finally {
      setAdicionandoId(null);
    }
  };

  const handleAdicionarZona = async (bairro: BairroEncontrado) => {
    const chave = `${bairro.osm_type}-${bairro.osm_id}`;

    try {
      setAdicionandoZonaId(chave);
      setErroZona(null);

      const polygon = await jurisdicaoService.obterPoligonoBairro(bairro.osm_type, bairro.osm_id);

      await jurisdicaoService.adicionarVia(adminId, {
        nome_via: bairro.nome,
        place_id: `osm:zona:${bairro.osm_type}:${bairro.osm_id}`,
        geometria: { lat: bairro.lat ?? 0, lng: bairro.lng ?? 0, polygon },
      });

      setQuery("");
      setViasResultado([]);
      setBairros([]);
      onViasAdicionadas();
    } catch (err: any) {
      setErroZona(
        err?.response?.data?.error || `Não foi possível adicionar a zona "${bairro.nome}". Tenta novamente daqui a pouco.`
      );
    } finally {
      setAdicionandoZonaId(null);
    }
  };

  const handleEscolherBairro = async (bairro: BairroEncontrado) => {
    setBairroSelecionado(bairro);
    setQuery("");
    setViasResultado([]);
    setBairros([]);
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
      mostrarErro(err, "Erro ao adicionar as vias do bairro");
    } finally {
      setAdicionando(false);
    }
  };

  const semResultados =
    !pesquisando && queryDebounced.trim().length >= 3 && vias.length === 0 && bairros.length === 0;

  return (
    <div className={`${CARD} p-4 mb-6`}>
      <label className={LABEL}>Pesquisar via ou bairro</label>
      <p className="text-xs text-gray-500 mb-2">
        Clique numa via para a adicionar, ou num bairro para o adicionar inteiro como zona. Em cada bairro pode
        também vê-lo no mapa antes de decidir, ou escolher só algumas das suas vias.
      </p>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex: Avenida Vladimir Lenine, ou Albazine"
          className={`${INPUT} pl-9`}
        />
        {pesquisando && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 animate-spin" size={16} />
        )}
      </div>

      {(vias.length > 0 || bairros.length > 0) && (
        <ul className="mt-2 rounded-md border border-gray-200 divide-y divide-gray-200 overflow-hidden">
          {bairros.map((b) => {
            const chave = `${b.osm_type}-${b.osm_id}`;
            return (
              <li key={`bairro-${chave}`} className="flex items-center justify-between gap-2 px-4 py-2.5 hover:bg-blue-50/60">
                {/* Acção principal: clicar no bairro desenha logo a zona
                    (contorno real), sem passos extra - é o que se espera ao
                    pesquisar um bairro (igual ao TruckFreightEasy). */}
                <button
                  onClick={() => handleAdicionarZona(b)}
                  disabled={adicionandoZonaId === chave}
                  className="flex items-center gap-3 text-left flex-1 min-w-0 disabled:opacity-60"
                  title="Adicionar o bairro inteiro (contorno real) como zona"
                >
                  <span className={`${BADGE_TAG} bg-blue-50 text-blue-700`}>
                    {adicionandoZonaId === chave ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <LandPlot size={12} />
                    )}
                    Bairro
                  </span>
                  <span className="text-sm text-gray-700 truncate">{b.display_name}</span>
                </button>
                {/* Secundário: para quem quer escolher vias individuais em
                    vez do bairro inteiro (raro - só quando o Overpass tem
                    ruas com nome que interessa cobrir à parte). */}
                {b.lat != null && b.lng != null && (
                  <button
                    onClick={() => onCentrar({ lat: b.lat as number, lng: b.lng as number })}
                    className="text-xs text-gray-500 hover:text-blue-700 underline shrink-0"
                    title="Centrar o mapa neste bairro, sem adicionar nada à jurisdição"
                  >
                    ver no mapa
                  </button>
                )}
                <button
                  onClick={() => handleEscolherBairro(b)}
                  className="text-xs text-gray-500 hover:text-blue-700 underline shrink-0"
                  title="Ver e escolher vias individuais deste bairro, em vez do bairro inteiro"
                >
                  escolher vias
                </button>
              </li>
            );
          })}
          {vias.map((via) => (
            <li key={`via-${via.place_id}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50/60">
              <div className="flex items-center gap-3">
                <span className={`${BADGE_TAG} bg-gray-100 text-gray-600`}>
                  <Route size={12} />
                  Via
                </span>
                <span className="text-sm text-gray-700">{via.nome_via}</span>
              </div>
              <button
                onClick={() => handleAdicionarVia(via)}
                disabled={adicionandoId === via.place_id}
                className="text-blue-600 hover:text-blue-800 disabled:opacity-50 shrink-0"
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

      {semResultados && (
        <p className="mt-2 text-xs text-gray-500">Nenhuma via ou bairro encontrado para "{queryDebounced}".</p>
      )}

      {erroZona && (
        <p className="mt-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
          {erroZona}
        </p>
      )}

      {bairroSelecionado && (
        <div className="mt-4 rounded-md border border-blue-100 bg-blue-50/40 p-4">
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
              <div className={MODAL_FOOTER}>
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

function calcularBoundsDoPath(path: PontoVia[]): LimitesVia {
  const lats = path.map((p) => p.lat);
  const lngs = path.map((p) => p.lng);
  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs),
  };
}

function MapaVias({
  apiKey,
  vias,
  adminId,
  centrarEm,
  onViaAdicionada,
  onRemoverVia,
}: {
  apiKey: string;
  vias: ViaJurisdicao[];
  adminId: number;
  centrarEm: { lat: number; lng: number } | null;
  onViaAdicionada: () => void;
  onRemoverVia: (viaId: number) => Promise<boolean>;
}) {
  // Desenho manual sem depender do DrawingManager do Google (a biblioteca
  // "drawing" foi descontinuada na Maps JS API v3.65) - construído à mão a
  // partir de cliques no mapa. "via" = linha aberta (2+ pontos), "zona" =
  // área fechada (3+ pontos, fecha o anel sozinha no fim).
  const [modo, setModo] = useState<"via" | "zona" | null>(null);
  const [aDesenhar, setADesenhar] = useState(false);
  const [pontos, setPontos] = useState<PontoVia[]>([]);
  const [nomeVia, setNomeVia] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [erroGuardar, setErroGuardar] = useState<string | null>(null);
  const minPontos = modo === "zona" ? 3 : 2;

  // Seleccionar uma via existente clicando no seu traçado/retângulo no mapa,
  // para a poder remover sem ter de a procurar na lista "Vias atribuídas".
  const [viaSeleccionadaId, setViaSeleccionadaId] = useState<number | null>(null);
  const [removendo, setRemovendo] = useState(false);

  // Confirmação explícita de adicionar/remover - com muitas vias sobrepostas
  // (bairros bulk-carregados), a diferença no mapa é muitas vezes
  // impercetível ao olho, por isso o feedback não pode depender só do
  // desenho mudar visualmente.
  const [mensagem, setMensagem] = useState<string | null>(null);
  const mostrarMensagem = (texto: string) => {
    setMensagem(texto);
    setTimeout(() => setMensagem((actual) => (actual === texto ? null : actual)), 4000);
  };

  // Centrar o mapa no bairro escolhido na pesquisa ("ver no mapa") -
  // facilita encontrar a zona certa antes de desenhar uma via.
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!centrarEm || !mapRef.current) return;
    mapRef.current.panTo(centrarEm);
    mapRef.current.setZoom(15);
  }, [centrarEm]);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "sgdit-google-maps",
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  if (loadError || !isLoaded) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-gray-50 p-4 text-sm text-gray-600 mb-6">
        <MapPinned size={16} />
        {loadError ? "Erro ao carregar o mapa." : "A carregar mapa..."}
      </div>
    );
  }

  // Já não é preciso clicar em "Concluir" antes de poder nomear/guardar -
  // assim que há pontos suficientes, o campo de nome e o botão Guardar já
  // aparecem (podes continuar a acrescentar pontos, escrever o nome a
  // qualquer momento, ou duplo-clique no mapa para fechar de vez).
  const pronto = modo !== null && pontos.length >= minPontos;

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!aDesenhar || !e.latLng) return;
    setPontos((prev) => [...prev, { lat: e.latLng!.lat(), lng: e.latLng!.lng() }]);
  };

  const handleMapDblClick = () => {
    if (!aDesenhar || pontos.length < minPontos) return;
    setADesenhar(false);
  };

  const handleIniciarDesenho = (tipo: "via" | "zona") => {
    setModo(tipo);
    setADesenhar(true);
    setPontos([]);
    setNomeVia("");
    setErroGuardar(null);
    setViaSeleccionadaId(null);
  };

  const handleSelecionarVia = (viaId: number) => {
    if (aDesenhar) return; // não seleccionar por engano enquanto se desenha
    setViaSeleccionadaId((atual) => (atual === viaId ? null : viaId));
  };

  const handleRemoverSelecionada = async () => {
    if (viaSeleccionadaId === null) return;

    const nome = vias.find((v) => v.id === viaSeleccionadaId)?.nome_via ?? "Via";

    try {
      setRemovendo(true);
      const sucesso = await onRemoverVia(viaSeleccionadaId);
      setViaSeleccionadaId(null);
      if (sucesso) mostrarMensagem(`"${nome}" removida da jurisdição.`);
    } finally {
      setRemovendo(false);
    }
  };

  const handleApagarUltimoPonto = () => {
    setPontos((prev) => prev.slice(0, -1));
  };

  const handleConcluirTracado = () => {
    if (pontos.length < minPontos) return;
    setADesenhar(false);
  };

  const handleGuardar = async () => {
    if (!modo || pontos.length < minPontos || !nomeVia.trim()) return;

    try {
      setGuardando(true);
      setErroGuardar(null);

      if (modo === "zona") {
        // GeoJSON exige o anel fechado (1º ponto repetido no fim). O
        // backend recorta automaticamente contra zonas já existentes
        // (ver JurisdicaoService.adicionar_zona) e recalcula lat/lng/bounds
        // a partir da forma final - os valores aqui são só um placeholder
        // válido para o pedido.
        const anelFechado = [...pontos, pontos[0]].map((p) => [p.lng, p.lat]);

        await jurisdicaoService.adicionarVia(adminId, {
          nome_via: nomeVia.trim(),
          place_id: `manual:zona:${Date.now()}`,
          geometria: {
            lat: pontos[0].lat,
            lng: pontos[0].lng,
            polygon: { type: "Polygon", coordinates: [anelFechado] },
          },
        });
      } else {
        const bounds = calcularBoundsDoPath(pontos);
        const centro = pontos[Math.floor(pontos.length / 2)];

        await jurisdicaoService.adicionarVia(adminId, {
          nome_via: nomeVia.trim(),
          place_id: `manual:${Date.now()}`,
          geometria: { lat: centro.lat, lng: centro.lng, bounds, path: pontos },
        });
      }

      const nomeGuardado = nomeVia.trim();
      handleCancelarDesenho();
      onViaAdicionada();
      mostrarMensagem(`"${nomeGuardado}" adicionada à jurisdição.`);
    } catch (err: any) {
      setErroGuardar(
        err?.response?.data?.error || `Erro ao guardar ${modo === "zona" ? "a zona" : "a via"} desenhada.`
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelarDesenho = () => {
    setModo(null);
    setADesenhar(false);
    setPontos([]);
    setNomeVia("");
    setErroGuardar(null);
  };

  return (
    <div className={`${CARD} p-4 mb-6`}>
      <div className="flex items-center justify-between mb-2 gap-3">
        <p className="text-xs text-gray-500">
          Não encontras a via na pesquisa (comum: muitas ruas ainda não têm nome no OpenStreetMap)? Desenha-a
          directamente no mapa. Clica num traçado já desenhado para o seleccionar e remover.
        </p>
        <div className="flex gap-2 shrink-0">
          {aDesenhar && pontos.length > 0 && (
            <button onClick={handleApagarUltimoPonto} className={BUTTON_SECONDARY} title="Apagar o último ponto marcado">
              <Undo2 size={16} />
              Apagar último ponto
            </button>
          )}
          {aDesenhar && (
            <button onClick={handleConcluirTracado} disabled={pontos.length < minPontos} className={BUTTON_PRIMARY}>
              Concluir {modo === "zona" ? "zona" : "traçado"}
            </button>
          )}
          {(modo !== null) && (
            <button onClick={handleCancelarDesenho} className={BUTTON_SECONDARY}>
              Cancelar
            </button>
          )}
          {viaSeleccionadaId !== null && (
            <button onClick={handleRemoverSelecionada} disabled={removendo} className={BUTTON_DANGER}>
              {removendo ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Remover via seleccionada
            </button>
          )}
          {modo === null && viaSeleccionadaId === null && (
            <>
              <button onClick={() => handleIniciarDesenho("via")} className={BUTTON_SECONDARY} title="Traçar uma via (linha)">
                <PenLine size={16} />
                Desenhar via
              </button>
              <button onClick={() => handleIniciarDesenho("zona")} className={BUTTON_PRIMARY} title="Desenhar uma zona (área fechada, ex: um bairro)">
                <LandPlot size={16} />
                Desenhar zona
              </button>
            </>
          )}
        </div>
      </div>

      {aDesenhar && (
        <p className="mb-2 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
          {modo === "zona"
            ? `Clica no mapa para marcar os cantos da área (${pontos.length} marcado${pontos.length === 1 ? "" : "s"}). Duplo-clique fecha o contorno sozinho - já podes escrever o nome a qualquer momento.`
            : `Clica no mapa para marcar pontos ao longo da rua (${pontos.length} marcado${pontos.length === 1 ? "" : "s"}). Duplo-clique termina o traçado - já podes escrever o nome a qualquer momento.`}
        </p>
      )}

      {mensagem && (
        <p className="mb-2 text-xs text-blue-800 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
          {mensagem}
        </p>
      )}


      <GoogleMap
        mapContainerStyle={containerStyle}
        center={vias.find((v) => v.geometria)?.geometria ?? CENTRO_PADRAO_MAPA}
        zoom={vias.some((v) => v.geometria) ? 13 : 11}
        onLoad={(map) => {
          mapRef.current = map;
        }}
        onClick={handleMapClick}
        onDblClick={handleMapDblClick}
        options={{
          draggableCursor: aDesenhar ? "crosshair" : undefined,
          // Duplo-clique no mapa fecha o desenho (ver handleMapDblClick) -
          // sem isto, o duplo-clique também fazia zoom no mapa por baixo.
          disableDoubleClickZoom: aDesenhar,
        }}
      >
        {pontos.length > 0 && (
          <>
            {/* clickable=false em tudo o que é desenhado - senão um clique
                em cima da própria linha/ponto (ex: para marcar um ponto no
                meio de dois já existentes) é apanhado pelo overlay em vez
                de chegar ao mapa, e o ponto nunca é acrescentado. */}
            {modo === "zona" && pontos.length >= 3 && (
              <Polygon
                paths={[pontos]}
                options={{
                  strokeColor: "#1E40AF",
                  strokeOpacity: 0.9,
                  strokeWeight: 3,
                  fillColor: "#1E40AF",
                  fillOpacity: 0.2,
                  clickable: false,
                }}
              />
            )}
            <Polyline
              path={modo === "zona" ? [...pontos, pontos[0]] : pontos}
              options={{ strokeColor: "#1E40AF", strokeWeight: 4, clickable: false }}
            />
            {pontos.map((p, i) => (
              <MarkerF
                key={i}
                position={p}
                clickable={false}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 5,
                  fillColor: "#1E40AF",
                  fillOpacity: 1,
                  strokeColor: "#FFFFFF",
                  strokeWeight: 1.5,
                }}
              />
            ))}
          </>
        )}

        {vias.map((v) => {
          if (!v.geometria) return null;

          const seleccionada = v.id === viaSeleccionadaId;
          const cor = seleccionada ? "#E11D48" : "#1E40AF";

          return (
            <div key={v.id} style={{ display: "contents" }}>
              {v.geometria.polygon ? (
                <Polygon
                  paths={geoJsonParaAneis(v.geometria.polygon)}
                  options={{
                    strokeColor: cor,
                    strokeOpacity: 0.9,
                    strokeWeight: seleccionada ? 3 : 2,
                    fillColor: cor,
                    fillOpacity: seleccionada ? 0.3 : 0.18,
                    clickable: !aDesenhar,
                  }}
                  onClick={() => handleSelecionarVia(v.id)}
                />
              ) : v.geometria.path ? (
                <Polyline
                  path={v.geometria.path}
                  options={{ strokeColor: cor, strokeOpacity: 0.9, strokeWeight: seleccionada ? 6 : 4, clickable: !aDesenhar }}
                  onClick={() => handleSelecionarVia(v.id)}
                />
              ) : (
                v.geometria.bounds && (
                  <Rectangle
                    bounds={v.geometria.bounds}
                    options={{
                      strokeColor: cor,
                      strokeOpacity: 0.8,
                      strokeWeight: seleccionada ? 3 : 2,
                      fillColor: cor,
                      fillOpacity: seleccionada ? 0.25 : 0.15,
                      clickable: !aDesenhar,
                    }}
                    onClick={() => handleSelecionarVia(v.id)}
                  />
                )
              )}
              <MarkerF
                position={v.geometria}
                title={v.nome_via}
                clickable={!aDesenhar}
                onClick={() => handleSelecionarVia(v.id)}
              />
            </div>
          );
        })}
      </GoogleMap>

      {pronto ? (
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nomeVia}
              onChange={(e) => setNomeVia(e.target.value)}
              placeholder={modo === "zona" ? "Nome desta zona..." : "Nome desta via..."}
              className={INPUT}
              autoFocus
            />
            <button onClick={handleGuardar} disabled={guardando || !nomeVia.trim()} className={BUTTON_PRIMARY}>
              {guardando ? <Loader2 size={16} className="animate-spin" /> : "Guardar"}
            </button>
          </div>
          {erroGuardar && <p className="mt-2 text-xs text-rose-600">{erroGuardar}</p>}
        </div>
      ) : (
        <p className="mt-2 text-xs text-gray-500">
          A área/traçado a azul vem do OpenStreetMap (aproximado) ou foi desenhado à mão.
        </p>
      )}
    </div>
  );
}
