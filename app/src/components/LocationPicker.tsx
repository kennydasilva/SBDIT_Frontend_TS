import { useState, useEffect, useCallback, useRef } from "react";
import { GoogleMap, MarkerF, Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { MapPin, Search } from "lucide-react";
import { configService } from "../api/configService";
import { GOOGLE_MAPS_LIBRARIES, CENTRO_PADRAO_MAPA } from "../utils/maps";

interface LocationPickerProps {
  // `endereco` chega depois das coordenadas (pesquisa ou geocodificação
  // inversa do ponto) - é o texto de localização da denúncia, para o
  // cidadão não ter de escrever à mão o mesmo local que marcou no mapa.
  onChange: (lat: number, lng: number, endereco?: string) => void;
  initialLat?: number | null;
  initialLng?: number | null;
}

const containerStyle = { width: "100%", height: "280px", borderRadius: "0.5rem" };

/**
 * Componente "portão": só monta <LocationPickerMapa> depois de já ter uma
 * chave real. useJsApiLoader não permite ser chamado com opções diferentes
 * ao longo do tempo (ex: chave vazia -> chave real) para o mesmo `id` -
 * rebenta o componente inteiro se isso acontecer. Por isso a chave nunca
 * pode "chegar depois" a um componente que já montou o hook.
 */
export default function LocationPicker(props: LocationPickerProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [erroConfig, setErroConfig] = useState<string | null>(null);

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

  if (erroConfig) {
    return (
      <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
        {erroConfig}
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
        <MapPin size={16} />
        A carregar mapa...
      </div>
    );
  }

  return <LocationPickerMapa {...props} apiKey={apiKey} />;
}

function LocationPickerMapa({
  onChange,
  initialLat,
  initialLng,
  apiKey,
}: LocationPickerProps & { apiKey: string }) {
  const [center, setCenter] = useState(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : CENTRO_PADRAO_MAPA
  );
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [endereco, setEndereco] = useState<string | null>(null);

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
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // Ponto marcado à mão: pede ao Google o endereço desse ponto. Se a
  // Geocoding API não estiver activa na chave (ou falhar), fica com as
  // coordenadas - a denúncia nunca fica sem localização.
  const marcarPonto = useCallback(
    (lat: number, lng: number) => {
      setMarker({ lat, lng });
      const coordenadas = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setEndereco(coordenadas);
      onChange(lat, lng, coordenadas);

      new google.maps.Geocoder()
        .geocode({ location: { lat, lng } })
        .then(({ results }) => {
          const texto = results[0]?.formatted_address;
          if (!texto) return;
          setEndereco(texto);
          onChange(lat, lng, texto);
        })
        .catch(() => {});
    },
    [onChange]
  );

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) marcarPonto(e.latLng.lat(), e.latLng.lng());
    },
    [marcarPonto]
  );

  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) marcarPonto(e.latLng.lat(), e.latLng.lng());
    },
    [marcarPonto]
  );

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    const location = place?.geometry?.location;
    if (!location) return;

    const lat = location.lat();
    const lng = location.lng();
    const texto = [place?.name, place?.formatted_address]
      .filter((t, i, lista) => t && lista.indexOf(t) === i)
      .join(", ") || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

    setCenter({ lat, lng });
    setMarker({ lat, lng });
    setEndereco(texto);
    onChange(lat, lng, texto);
  };

  if (loadError || !isLoaded) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
        <MapPin size={16} />
        {loadError ? "Erro ao carregar o mapa." : "A carregar mapa..."}
      </div>
    );
  }

  return (
    <div>
      <Autocomplete
        onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
        onPlaceChanged={handlePlaceChanged}
      >
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Pesquisar rua, avenida ou local..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </Autocomplete>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={marker ?? center}
        zoom={marker ? 16 : 13}
        onClick={handleMapClick}
      >
        {marker && <MarkerF position={marker} draggable onDragEnd={handleMarkerDragEnd} />}
      </GoogleMap>
      {endereco && (
        <p className="mt-2 flex items-start gap-1.5 text-sm text-gray-800">
          <MapPin size={16} className="mt-0.5 shrink-0 text-rose-600" />
          {endereco}
        </p>
      )}
      <p className="mt-1 text-xs text-gray-500">
        {marker
          ? "Arraste o marcador ou clique noutro ponto do mapa para ajustar o local exato."
          : "Pesquise um local ou clique no mapa para marcar onde a infração aconteceu."}
      </p>
    </div>
  );
}
