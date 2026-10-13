import { useEffect, useState } from "react";
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { MapPin } from "./icons";
import { configService } from "../api/configService";
import { GOOGLE_MAPS_LIBRARIES } from "../utils/maps";

interface MapaLocalProps {
  lat: number;
  lng: number;
  /** Texto do local, para o nome acessível do mapa. */
  endereco?: string | null;
  className?: string;
}

const AVISO = "flex h-full min-h-48 items-center justify-center gap-2 rounded-xl bg-blue-50 p-6 text-center text-sm text-gray-600";

// Mapa só de leitura com um marcador no local (ex.: onde aconteceu um
// acidente). Mesmo "portão" do LocationPicker: o mapa só monta depois de
// haver chave, porque o carregador do Google não aceita que ela mude.
export default function MapaLocal(props: MapaLocalProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    configService
      .obterPublica()
      .then((config) => (config.GOOGLE_MAPS_API_KEY ? setApiKey(config.GOOGLE_MAPS_API_KEY) : setErro(true)))
      .catch(() => setErro(true));
  }, []);

  if (erro) {
    return <div className={`${AVISO} ${props.className ?? ""}`}>O mapa não está disponível. Use o botão para abrir o local no Google Maps.</div>;
  }
  if (!apiKey) {
    return (
      <div className={`${AVISO} ${props.className ?? ""}`}>
        <MapPin size={14} /> A carregar o mapa…
      </div>
    );
  }
  return <Mapa {...props} apiKey={apiKey} />;
}

function Mapa({ lat, lng, endereco, className = "", apiKey }: MapaLocalProps & { apiKey: string }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "sgdit-google-maps",
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  if (loadError) {
    return <div className={`${AVISO} ${className}`}>O mapa não carregou. Use o botão para abrir o local no Google Maps.</div>;
  }
  if (!isLoaded) {
    return (
      <div className={`${AVISO} ${className}`}>
        <MapPin size={14} /> A carregar o mapa…
      </div>
    );
  }

  const centro = { lat, lng };
  return (
    <div
      className={`overflow-hidden rounded-xl ring-1 ring-blue-600/15 ${className}`}
      role="region"
      aria-label={endereco ? `Mapa do local: ${endereco}` : "Mapa do local"}
    >
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%", minHeight: "20rem" }}
        center={centro}
        zoom={16}
        options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: true }}
      >
        <MarkerF position={centro} />
      </GoogleMap>
    </div>
  );
}

/** Ligações do Google Maps para um ponto (abrem a aplicação no telemóvel). */
export const ligacoesMapa = (lat: number, lng: number) => ({
  comoChegar: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`,
  abrir: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
});
