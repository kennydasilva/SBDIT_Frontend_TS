import { useState, useEffect, useCallback } from "react";
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { MapPin } from "lucide-react";
import { configService } from "../api/configService";

interface LocationPickerProps {
  onChange: (lat: number, lng: number) => void;
  initialLat?: number | null;
  initialLng?: number | null;
}

// Maputo, usado só como centro de partida se não houver GPS nem local inicial
const CENTRO_PADRAO = { lat: -25.9692, lng: 32.5732 };
const containerStyle = { width: "100%", height: "280px", borderRadius: "0.5rem" };

export default function LocationPicker({ onChange, initialLat, initialLng }: LocationPickerProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [erroConfig, setErroConfig] = useState<string | null>(null);
  const [center, setCenter] = useState(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : CENTRO_PADRAO
  );
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );

  useEffect(() => {
    configService
      .obterPublica()
      .then((config) => {
        if (config.GOOGLE_MAPS_API_KEY) {
          setApiKey(config.GOOGLE_MAPS_API_KEY);
        } else {
          setErroConfig("Mapa indisponível (chave do Google Maps não configurada pelo Super Admin).");
        }
      })
      .catch(() => setErroConfig("Não foi possível carregar as configurações do mapa."));
  }, []);

  useEffect(() => {
    // GPS atual serve só para centrar o mapa como ponto de partida - nunca
    // define o local da infração automaticamente (o cidadão pode estar a
    // submeter de outro sítio diferente de onde a infração aconteceu)
    if (marker || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { timeout: 5000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "sgdit-google-maps",
    googleMapsApiKey: apiKey ?? "",
  });

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarker({ lat, lng });
      onChange(lat, lng);
    },
    [onChange]
  );

  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarker({ lat, lng });
      onChange(lat, lng);
    },
    [onChange]
  );

  if (erroConfig) {
    return (
      <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
        {erroConfig}
      </div>
    );
  }

  if (!apiKey || loadError || !isLoaded) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
        <MapPin size={16} />
        {loadError ? "Erro ao carregar o mapa." : "A carregar mapa..."}
      </div>
    );
  }

  return (
    <div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={marker ?? center}
        zoom={marker ? 16 : 13}
        onClick={handleMapClick}
      >
        {marker && <MarkerF position={marker} draggable onDragEnd={handleMarkerDragEnd} />}
      </GoogleMap>
      <p className="mt-2 text-xs text-gray-500">
        {marker
          ? "Arraste o marcador ou clique noutro ponto do mapa para ajustar o local exato."
          : "Clique no mapa para marcar o local exato onde a infração aconteceu."}
      </p>
    </div>
  );
}
