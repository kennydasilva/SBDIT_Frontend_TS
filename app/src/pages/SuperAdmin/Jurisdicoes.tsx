import { useEffect, useState } from "react";
import { GoogleMap, MarkerF, Rectangle, Polyline, useJsApiLoader } from "@react-google-maps/api";
import { AlertTriangle, Loader2, MapPinned, Search, Trash2, Plus, LandPlot, Route, PenLine } from "lucide-react";
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
import { GOOGLE_MAPS_LIBRARIES, CENTRO_PADRAO_MAPA } from "../../utils/maps";
import { CARD, INPUT, LABEL, BUTTON_PRIMARY, BUTTON_SECONDARY } from "../../utils/uiClasses";

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
          <PesquisaJurisdicao
            adminId={adminSelecionado}
            onViasAdicionadas={() => carregarVias(adminSelecionado)}
          />

          {apiKey ? (
            <MapaVias
              apiKey={apiKey}
              vias={vias}
              adminId={adminSelecionado}
              onViaAdicionada={() => carregarVias(adminSelecionado)}
            />
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
}: {
  adminId: number;
  onViasAdicionadas: () => void;
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
      alert("Erro ao adicionar via.");
    } finally {
      setAdicionandoId(null);
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
      alert("Erro ao adicionar vias do bairro.");
    } finally {
      setAdicionando(false);
    }
  };

  const semResultados =
    !pesquisando && queryDebounced.trim().length >= 3 && vias.length === 0 && bairros.length === 0;

  return (
    <div className={`${CARD} p-4 mb-6`}>
      <label className={LABEL}>Adicionar à jurisdição</label>
      <p className="text-xs text-gray-500 mb-2">
        Pesquisa o nome de uma via (ex: "Avenida Vladimir Lenine") para a adicionar directamente, ou o nome de um
        bairro (ex: "Albazine") para escolher, de uma vez, quais das suas vias adicionar.
      </p>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar via ou bairro..."
          className={`${INPUT} pl-9`}
        />
        {pesquisando && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" size={16} />
        )}
      </div>

      {(vias.length > 0 || bairros.length > 0) && (
        <ul className="mt-2 rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          {bairros.map((b) => (
            <li key={`bairro-${b.osm_type}-${b.osm_id}`}>
              <button
                onClick={() => handleEscolherBairro(b)}
                className="w-full flex items-center gap-3 text-left px-4 py-2.5 hover:bg-blue-50/60"
              >
                <span className={`${BADGE_TAG} bg-blue-50 text-blue-700`}>
                  <LandPlot size={12} />
                  Bairro
                </span>
                <span className="text-sm text-gray-700">{b.display_name}</span>
              </button>
            </li>
          ))}
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
  onViaAdicionada,
}: {
  apiKey: string;
  vias: ViaJurisdicao[];
  adminId: number;
  onViaAdicionada: () => void;
}) {
  // Desenho manual sem depender do DrawingManager do Google (a biblioteca
  // "drawing" foi descontinuada na Maps JS API v3.65) - construído à mão a
  // partir de cliques no mapa + <Polyline> a crescer em tempo real.
  const [desenhando, setDesenhando] = useState(false);
  const [pontos, setPontos] = useState<PontoVia[]>([]);
  const [nomeVia, setNomeVia] = useState("");
  const [guardando, setGuardando] = useState(false);

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

  const pronto = pontos.length >= 2 && !desenhando;

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!desenhando || !e.latLng) return;
    setPontos((prev) => [...prev, { lat: e.latLng!.lat(), lng: e.latLng!.lng() }]);
  };

  const handleIniciarDesenho = () => {
    setDesenhando(true);
    setPontos([]);
    setNomeVia("");
  };

  const handleConcluirTracado = () => {
    if (pontos.length < 2) return;
    setDesenhando(false);
  };

  const handleGuardar = async () => {
    if (pontos.length < 2 || !nomeVia.trim()) return;

    const bounds = calcularBoundsDoPath(pontos);
    const centro = pontos[Math.floor(pontos.length / 2)];

    try {
      setGuardando(true);
      await jurisdicaoService.adicionarVia(adminId, {
        nome_via: nomeVia.trim(),
        place_id: `manual:${Date.now()}`,
        geometria: { lat: centro.lat, lng: centro.lng, bounds, path: pontos },
      });
      setPontos([]);
      setNomeVia("");
      onViaAdicionada();
    } catch (err) {
      alert("Erro ao guardar via desenhada.");
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelarDesenho = () => {
    setDesenhando(false);
    setPontos([]);
    setNomeVia("");
  };

  return (
    <div className={`${CARD} p-4 mb-6`}>
      <div className="flex items-center justify-between mb-2 gap-3">
        <p className="text-xs text-gray-500">
          Não encontras a via na pesquisa (comum: muitas ruas ainda não têm nome no OpenStreetMap)? Desenha-a
          directamente no mapa.
        </p>
        <div className="flex gap-2 shrink-0">
          {desenhando && (
            <button onClick={handleConcluirTracado} disabled={pontos.length < 2} className={BUTTON_PRIMARY}>
              Concluir traçado
            </button>
          )}
          {(desenhando || pontos.length > 0) && (
            <button onClick={handleCancelarDesenho} className={BUTTON_SECONDARY}>
              Cancelar
            </button>
          )}
          {!desenhando && pontos.length === 0 && (
            <button onClick={handleIniciarDesenho} className={BUTTON_PRIMARY}>
              <PenLine size={16} />
              Desenhar via
            </button>
          )}
        </div>
      </div>

      {desenhando && (
        <p className="mb-2 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
          Clica no mapa para marcar pontos ao longo da rua ({pontos.length} marcado{pontos.length === 1 ? "" : "s"}).
          Quando tiveres pelo menos 2, clica em "Concluir traçado".
        </p>
      )}

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={vias.find((v) => v.geometria)?.geometria ?? CENTRO_PADRAO_MAPA}
        zoom={vias.some((v) => v.geometria) ? 13 : 11}
        onClick={handleMapClick}
        options={{ draggableCursor: desenhando ? "crosshair" : undefined }}
      >
        {pontos.length > 0 && (
          <>
            {/* clickable=false em tudo o que é desenhado - senão um clique
                em cima da própria linha/ponto (ex: para marcar um ponto no
                meio de dois já existentes) é apanhado pelo overlay em vez
                de chegar ao mapa, e o ponto nunca é acrescentado. */}
            <Polyline path={pontos} options={{ strokeColor: "#2563EB", strokeWeight: 4, clickable: false }} />
            {pontos.map((p, i) => (
              <MarkerF
                key={i}
                position={p}
                clickable={false}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 5,
                  fillColor: "#2563EB",
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

          return (
            <div key={v.id} style={{ display: "contents" }}>
              {v.geometria.path ? (
                <Polyline
                  path={v.geometria.path}
                  options={{ strokeColor: "#2563EB", strokeOpacity: 0.8, strokeWeight: 4, clickable: false }}
                />
              ) : (
                v.geometria.bounds && (
                  <Rectangle
                    bounds={v.geometria.bounds}
                    options={{
                      strokeColor: "#2563EB",
                      strokeOpacity: 0.8,
                      strokeWeight: 2,
                      fillColor: "#2563EB",
                      fillOpacity: 0.15,
                      clickable: false,
                    }}
                  />
                )
              )}
              <MarkerF position={v.geometria} title={v.nome_via} clickable={!desenhando} />
            </div>
          );
        })}
      </GoogleMap>

      {pronto ? (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={nomeVia}
            onChange={(e) => setNomeVia(e.target.value)}
            placeholder="Nome desta via..."
            className={INPUT}
            autoFocus
          />
          <button onClick={handleGuardar} disabled={guardando || !nomeVia.trim()} className={BUTTON_PRIMARY}>
            {guardando ? <Loader2 size={16} className="animate-spin" /> : "Guardar"}
          </button>
        </div>
      ) : (
        <p className="mt-2 text-xs text-gray-500">
          A área/traçado a azul vem do OpenStreetMap (aproximado) ou foi desenhado à mão.
        </p>
      )}
    </div>
  );
}
