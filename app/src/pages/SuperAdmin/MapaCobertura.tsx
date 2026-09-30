import { useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, MarkerF, Polygon, Polyline, Rectangle, useJsApiLoader } from "@react-google-maps/api";
import { Loader2, MapPinned, AlertTriangle, MapPinOff } from "lucide-react";
import {
  jurisdicaoService, type PostoJurisdicao, type CoberturaJurisdicoes,
} from "../../api/jurisdicaoService";
import { GOOGLE_MAPS_LIBRARIES, CENTRO_PADRAO_MAPA, geoJsonParaAneis } from "../../utils/maps";
import { labelEstado, labelTipo } from "../../utils/estadoDenuncia";
import { CARD, SECTION_TITLE, ALERT_WARNING, BUTTON_PRIMARY } from "../../utils/uiClasses";

// Uma cor por posto (repete se houver mais postos do que cores).
const CORES = ["#2563EB", "#059669", "#D97706", "#7C3AED", "#DB2777", "#0891B2", "#65A30D", "#DC2626", "#4F46E5", "#0D9488"];

const mapaStyle = { width: "100%", height: "520px", borderRadius: "0.75rem" };

/**
 * Jurisdições de TODOS os postos ao mesmo tempo (cada posto com a sua cor)
 * e as denúncias que caíram fora de qualquer jurisdição (a vermelho) - para
 * ver onde faltam zonas e se há postos a sobrepor-se.
 */
export default function MapaCobertura({ apiKey }: { apiKey: string }) {
  const [postos, setPostos] = useState<PostoJurisdicao[]>([]);
  const [cobertura, setCobertura] = useState<CoberturaJurisdicoes | null>(null);
  const [ocultos, setOcultos] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "sgdit-google-maps",
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const carregar = async () => {
    try {
      setLoading(true);
      setError(null);
      const [p, c] = await Promise.all([jurisdicaoService.visaoGeral(), jurisdicaoService.cobertura()]);
      setPostos(p);
      setCobertura(c);
    } catch {
      setError("Erro ao carregar o mapa de cobertura.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const corDe = useMemo(() => {
    const m = new Map<number, string>();
    postos.forEach((p, i) => m.set(p.admin_id, CORES[i % CORES.length]));
    return m;
  }, [postos]);

  const alternar = (adminId: number) =>
    setOcultos((s) => {
      const novo = new Set(s);
      if (novo.has(adminId)) novo.delete(adminId);
      else novo.add(adminId);
      return novo;
    });

  const centrar = (lat: number, lng: number) => {
    mapRef.current?.panTo({ lat, lng });
    mapRef.current?.setZoom(16);
  };

  // Enquadra tudo (jurisdições + pontos sem posto) quando os dados chegam.
  const enquadrar = (map: google.maps.Map) => {
    const limites = new google.maps.LatLngBounds();
    let tem = false;
    postos.forEach((p) =>
      p.itens.forEach((i) => {
        const b = i.geometria?.bounds;
        if (b) {
          limites.extend({ lat: b.north, lng: b.east });
          limites.extend({ lat: b.south, lng: b.west });
          tem = true;
        } else if (i.geometria) {
          limites.extend({ lat: i.geometria.lat, lng: i.geometria.lng });
          tem = true;
        }
      })
    );
    cobertura?.pontos.forEach((p) => {
      limites.extend({ lat: p.latitude, lng: p.longitude });
      tem = true;
    });
    if (tem) map.fitBounds(limites, 40);
  };

  useEffect(() => {
    if (mapRef.current && !loading) enquadrar(mapRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <p className="text-rose-600">{error}</p>
        <button onClick={carregar} className={`${BUTTON_PRIMARY} mt-4`}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {cobertura && cobertura.total_sem_posto > 0 && (
        <div className={ALERT_WARNING}>
          <strong>{cobertura.total_sem_posto}</strong> de {cobertura.total_denuncias} denúncias caíram fora de qualquer
          jurisdição — não foram encaminhadas a nenhum posto (e num acidente nenhum Admin recebeu o SMS).
          {cobertura.sem_coordenadas > 0 && (
            <> {cobertura.sem_coordenadas} delas não têm local no mapa (são anteriores à marcação no mapa).</>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className={`${CARD} p-3`}>
          {loadError || !isLoaded ? (
            <div className="flex items-center gap-2 p-4 text-sm text-gray-500">
              <MapPinned size={16} />
              {loadError ? "Erro ao carregar o mapa." : "A carregar mapa..."}
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={mapaStyle}
              center={CENTRO_PADRAO_MAPA}
              zoom={12}
              onLoad={(map) => {
                mapRef.current = map;
                enquadrar(map);
              }}
            >
              {postos
                .filter((p) => !ocultos.has(p.admin_id))
                .flatMap((p) =>
                  p.itens.map((item) => {
                    const cor = corDe.get(p.admin_id)!;
                    const g = item.geometria;
                    if (!g) return null;
                    const titulo = `${p.posto} — ${item.nome_via}`;
                    if (g.polygon) {
                      return (
                        <Polygon
                          key={item.id}
                          paths={geoJsonParaAneis(g.polygon)}
                          options={{ fillColor: cor, fillOpacity: 0.25, strokeColor: cor, strokeWeight: 2, clickable: false }}
                        />
                      );
                    }
                    if (g.path && g.path.length > 1) {
                      return (
                        <Polyline key={item.id} path={g.path}
                          options={{ strokeColor: cor, strokeWeight: 4, strokeOpacity: 0.85, clickable: false }} />
                      );
                    }
                    if (g.bounds) {
                      return (
                        <Rectangle key={item.id} bounds={g.bounds}
                          options={{ fillColor: cor, fillOpacity: 0.12, strokeColor: cor, strokeWeight: 1, clickable: false }} />
                      );
                    }
                    return <MarkerF key={item.id} position={{ lat: g.lat, lng: g.lng }} title={titulo} />;
                  })
                )}

              {cobertura?.pontos.map((p) => (
                <MarkerF
                  key={`d-${p.id}`}
                  position={{ lat: p.latitude, lng: p.longitude }}
                  title={`Denúncia #${p.id} (${labelTipo(p.tipo_infracao)}) — fora de jurisdição`}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 7,
                    fillColor: "#E11D48",
                    fillOpacity: 1,
                    strokeColor: "#FFFFFF",
                    strokeWeight: 2,
                  }}
                />
              ))}
            </GoogleMap>
          )}
        </div>

        <div className="space-y-6">
          <div className={`${CARD} p-5`}>
            <h2 className={`${SECTION_TITLE} mb-3`}>Postos</h2>
            <p className="text-xs text-gray-500 mb-3">Clique num posto para o mostrar/esconder no mapa.</p>
            <ul className="space-y-2">
              {postos.map((p) => {
                const oculto = ocultos.has(p.admin_id);
                return (
                  <li key={p.admin_id}>
                    <button
                      onClick={() => alternar(p.admin_id)}
                      className={`w-full text-left flex items-start gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-gray-50 ${oculto ? "opacity-40" : ""}`}
                    >
                      <span className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ background: corDe.get(p.admin_id) }} />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-gray-900 truncate">{p.posto}</span>
                        <span className="block text-xs text-gray-500">
                          {p.itens.length === 0 ? (
                            <span className="text-amber-700">Sem jurisdição definida</span>
                          ) : (
                            <>
                              {p.total_zonas} {p.total_zonas === 1 ? "zona" : "zonas"}
                              {p.total_zonas > 0 && ` (${p.area_km2_total} km²)`} · {p.total_vias} {p.total_vias === 1 ? "via" : "vias"}
                            </>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className={`${CARD} p-5`}>
            <h2 className={`${SECTION_TITLE} mb-3 flex items-center gap-2`}>
              <MapPinOff size={18} className="text-rose-600" />
              Fora de jurisdição ({cobertura?.pontos.length ?? 0})
            </h2>
            {!cobertura || cobertura.pontos.length === 0 ? (
              <p className="text-sm text-gray-500">Todas as denúncias com local no mapa caíram numa jurisdição.</p>
            ) : (
              <ul className="space-y-1 max-h-72 overflow-y-auto -mx-2">
                {cobertura.pontos.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => centrar(p.latitude, p.longitude)}
                      className="w-full text-left rounded-lg px-2 py-2 hover:bg-gray-50"
                      title="Centrar no mapa"
                    >
                      <p className="text-sm text-gray-900">
                        #{p.id} · {labelTipo(p.tipo_infracao)}
                        <span className="text-gray-400"> · {labelEstado(p.estado, p.tipo_infracao)}</span>
                      </p>
                      <p className="text-xs text-gray-500 truncate">{p.localizacao || "Sem descrição do local"}</p>
                      <p className="text-xs text-gray-400">{p.data_registo}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-gray-400 mt-3">
              Para cobrir estes locais, vá a "Gerir posto", escolha o posto responsável e adicione a zona ou as vias.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
