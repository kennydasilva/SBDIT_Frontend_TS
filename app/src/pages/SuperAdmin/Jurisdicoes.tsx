import { useEffect, useRef, useState } from "react";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { AlertTriangle, Loader2, MapPinned, Search, Trash2 } from "lucide-react";
import { adminService } from "../../api/superAdminService";
import type { Admin } from "../../api/superAdminService";
import { jurisdicaoService, type ViaJurisdicao } from "../../api/jurisdicaoService";
import { configService } from "../../api/configService";
import { GOOGLE_MAPS_LIBRARIES } from "../../utils/maps";

export default function Jurisdicoes() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [adminSelecionado, setAdminSelecionado] = useState<number | "">("");
  const [vias, setVias] = useState<ViaJurisdicao[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [loadingVias, setLoadingVias] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "sgdit-google-maps",
    googleMapsApiKey: apiKey ?? "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

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

  const handlePlaceChanged = async () => {
    if (adminSelecionado === "") {
      alert("Escolhe primeiro um posto (administrador).");
      return;
    }

    const place = autocompleteRef.current?.getPlace();
    if (!place?.place_id || !place.name) return;

    try {
      setSubmitting(true);
      await jurisdicaoService.adicionarVia(adminSelecionado, {
        nome_via: place.formatted_address || place.name,
        place_id: place.place_id,
        geometria: place.geometry?.location
          ? { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }
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
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adicionar via/estrada à jurisdição
            </label>
            {isLoaded && apiKey ? (
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
            ) : (
              <p className="text-sm text-gray-500">A carregar mapa...</p>
            )}
          </div>

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
