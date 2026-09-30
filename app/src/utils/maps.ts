// Constantes partilhadas entre componentes de mapa - a lib do Google Maps
// exige que o array de "libraries" seja uma referência estável (não recriada
// a cada render), daí viver aqui em vez de inline nos componentes.
export const GOOGLE_MAPS_LIBRARIES: "places"[] = ["places"];

// Maputo, usado como centro de partida quando não há GPS nem local inicial
export const CENTRO_PADRAO_MAPA = { lat: -25.9692, lng: 32.5732 };

// GeoJSON Polygon/MultiPolygon ([lng, lat]) -> anéis para o <Polygon> do
// Google Maps ({lat, lng}). Só o anel exterior de cada polígono (sem
// buracos) - suficiente para mostrar a forma.
export function geoJsonParaAneis(geojson: {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
}): { lat: number; lng: number }[][] {
  const paraLatLng = (anel: number[][]) => anel.map(([lng, lat]) => ({ lat, lng }));
  if (geojson.type === "Polygon") {
    return [paraLatLng((geojson.coordinates as number[][][])[0])];
  }
  return (geojson.coordinates as number[][][][]).map((poligono) => paraLatLng(poligono[0]));
}
