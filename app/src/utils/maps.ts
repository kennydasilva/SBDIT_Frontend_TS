// Constantes partilhadas entre componentes de mapa - a lib do Google Maps
// exige que o array de "libraries" seja uma referência estável (não recriada
// a cada render), daí viver aqui em vez de inline nos componentes.
export const GOOGLE_MAPS_LIBRARIES: "places"[] = ["places"];

// Maputo, usado como centro de partida quando não há GPS nem local inicial
export const CENTRO_PADRAO_MAPA = { lat: -25.9692, lng: 32.5732 };
