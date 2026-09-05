import { useEffect, useRef, useState } from "react";
import { GoogleMap, MarkerF, Rectangle, Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { AlertTriangle, Loader2, MapPinned, Search, Trash2 } from "lucide-react";
import { adminService } from "../../api/superAdminService";
import type { Admin } from "../../api/superAdminService";
import { jurisdicaoService, type ViaJurisdicao } from "../../api/jurisdicaoService";
import { configService } from "../../api/configService";
import { GOOGLE_MAPS_LIBRARIES, CENTRO_PADRAO_MAPA } from "../../utils/maps";

const containerStyle = { width: "100%", height: "280px", borderRadius: "0.5rem" };

export default function Jurisdicoes() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [adminSelecionado, setAdminSelecionado] = useState<number | "">("");
  const [vias, setVias] = useState<ViaJurisdicao[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [loadingVias, setLoadingVias] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
      const data = await adminService.listarAdmins();
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

  const handlePlaceSelecionado = async (place: google.maps.places.PlaceResult) => {
    if (adminSelecionado === "") {
      alert("Escolhe primeiro um posto (administrador).");
      return;
    }

    if (!place.place_id || !place.name) return;

    const location = place.geometry?.location;
    const viewport = place.geometry?.viewport;

    try {
      setSubmitting(true);
      await jurisdicaoService.adicionarVia(adminSelecionado, {
        nome_via: place.formatted_address || place.name,
        place_id: place.place_id,
        geometria: location
          ? {
              lat: location.lat(),
              lng: location.lng(),
              // área aproximada da via (retângulo), não é o traçado exato da
              // estrada, mas dá uma ideia visual melhor que só um ponto
              bounds: viewport
                ? {
                    north: viewport.getNorthEast().lat(),
                    east: viewport.getNorthEast().lng(),
                    south: viewport.getSouthWest().lat(),
                    west: viewport.getSouthWest().lng(),
                  }
                : undefined,
            }
          : null,
      });
      await carregarVias(adminSelecionado);
    } catch (err) {
      alert("Erro ao adicionar via.");
    } finally {
      setSubmitting(false);
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
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={carregarAdmins}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Jurisdições dos Postos</h1>
        <p className="text-gray-600 mt-2">
          Define as vias/estradas sob responsabilidade de cada posto (administrador)
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Posto (Administrador)</label>
        <select
          value={adminSelecionado}
          onChange={(e) => setAdminSelecionado(e.target.value ? Number(e.target.value) : "")}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          {apiKey ? (
            <BuscaEMapaVias
              apiKey={apiKey}
              vias={vias}
              submitting={submitting}
              onAdicionarVia={handlePlaceSelecionado}
            />
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 p-4 text-sm text-gray-500 mb-6">
              <MapPinned size={16} />
              A carregar mapa...
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center gap-2">
              <MapPinned size={18} className="text-gray-500" />
              <h2 className="font-semibold text-gray-900">Vias atribuídas</h2>
            </div>

            {loadingVias ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : vias.length === 0 ? (
              <p className="p-6 text-center text-gray-500">Nenhuma via atribuída a este posto ainda.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {vias.map((v) => (
                  <li key={v.id} className="flex items-center justify-between px-6 py-3">
                    <span className="text-sm text-gray-900">{v.nome_via}</span>
                    <button
                      onClick={() => handleRemover(v.id)}
                      className="text-red-600 hover:text-red-800"
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
 * Só monta depois de haver uma chave real (ver `apiKey: string`, não
 * opcional) - useJsApiLoader não permite ser chamado com opções diferentes
 * ao longo do tempo (ex: chave vazia -> chave real) para o mesmo `id`,
 * rebenta o componente inteiro se isso acontecer.
 */
function BuscaEMapaVias({
  apiKey,
  vias,
  submitting,
  onAdicionarVia,
}: {
  apiKey: string;
  vias: ViaJurisdicao[];
  submitting: boolean;
  onAdicionarVia: (place: google.maps.places.PlaceResult) => void;
}) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "sgdit-google-maps",
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (place) onAdicionarVia(place);
  };

  if (loadError || !isLoaded) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 p-4 text-sm text-gray-500 mb-6">
        <MapPinned size={16} />
        {loadError ? "Erro ao carregar o mapa." : "A carregar mapa..."}
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Adicionar via/estrada à jurisdição
        </label>
        <Autocomplete
          onLoad={(a) => (autocompleteRef.current = a)}
          onPlaceChanged={handlePlaceChanged}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Ex: Avenida Vladimir Lenine, Hulene..."
              disabled={submitting}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </Autocomplete>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={vias.find((v) => v.geometria)?.geometria ?? CENTRO_PADRAO_MAPA}
          zoom={vias.some((v) => v.geometria) ? 12 : 11}
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
          A área a azul é aproximada (dada pelo Google para a via), não é o traçado exato da estrada.
        </p>
      </div>
    </>
  );
}
