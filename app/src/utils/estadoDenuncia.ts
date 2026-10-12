// Rótulos e cores dos estados de denúncia. Acidente
// tem estados próprios (não passa por análise de vídeo nem pelo PT): vai
// directo ao Admin do posto da zona, que designa um agente.

export const ESTADO_LABEL: Record<string, string> = {
  PENDENTE: "Pendente",
  VALIDADA: "Validada",
  APROVADA: "Aprovada",
  REJEITADA: "Rejeitada",
  ARQUIVADA: "Arquivada",
  ENCAMINHADA: "Enviada ao posto",
  EM_ATENDIMENTO: "Agente designado",
  DUVIDOSA: "Duvidosa",
};

// Um só azul, distinguido pelo preenchimento (não pela cor):
//  - contorno: ainda à espera;      - fundo claro: em curso;
//  - cheio: concluída com seguimento; - cinzento: fechada sem seguimento.
const A_ESPERA = "bg-white text-blue-800 border-blue-200";
const EM_CURSO = "bg-blue-50 text-blue-800 border-blue-100";
const CONCLUIDA = "bg-blue-600 text-white border-blue-600";
const FECHADA = "bg-gray-100 text-gray-600 border-gray-200";

export const ESTADO_TONE: Record<string, string> = {
  PENDENTE: A_ESPERA,
  VALIDADA: EM_CURSO,
  APROVADA: CONCLUIDA,
  REJEITADA: FECHADA,
  ARQUIVADA: FECHADA,
  ENCAMINHADA: EM_CURSO,
  EM_ATENDIMENTO: CONCLUIDA,
  DUVIDOSA: EM_CURSO,
};

export const TIPO_LABEL: Record<string, string> = {
  CONTRAMAO: "Contramão",
  PARADO: "Veículo Parado",
  VELOCIDADE: "Excesso de Velocidade",
  ACIDENTE: "Acidente de Viação",
};

export const labelEstado = (estado: string, tipo?: string) => {
  // Acidente ainda PENDENTE = o ponto não caiu em nenhuma jurisdição
  // registada, nenhum posto foi avisado.
  if (tipo === "ACIDENTE" && estado === "PENDENTE") return "Sem posto na zona";
  return ESTADO_LABEL[estado] ?? estado;
};

// O cidadão não é informado da suspeita (mesmo vídeo declarado noutra
// jurisdição): para ele a denúncia está só "em verificação".
export const labelEstadoCidadao = (estado: string, tipo?: string) =>
  estado === "DUVIDOSA" ? "Em verificação" : labelEstado(estado, tipo);

export const toneEstado = (estado: string) =>
  ESTADO_TONE[estado] ?? "bg-gray-100 text-gray-600 border-gray-200";

export const labelTipo = (tipo: string) => TIPO_LABEL[tipo] ?? tipo;
