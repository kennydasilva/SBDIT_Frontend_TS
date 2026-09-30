// Rótulos e cores dos estados de denúncia vistos pelo cidadão. Acidente
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
};

export const ESTADO_TONE: Record<string, string> = {
  PENDENTE: "bg-amber-50 text-amber-700 border-amber-100",
  VALIDADA: "bg-blue-50 text-blue-700 border-blue-100",
  APROVADA: "bg-emerald-50 text-emerald-700 border-emerald-100",
  REJEITADA: "bg-rose-50 text-rose-700 border-rose-100",
  ARQUIVADA: "bg-gray-100 text-gray-600 border-gray-200",
  ENCAMINHADA: "bg-violet-50 text-violet-700 border-violet-100",
  EM_ATENDIMENTO: "bg-emerald-50 text-emerald-700 border-emerald-100",
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

export const toneEstado = (estado: string) =>
  ESTADO_TONE[estado] ?? "bg-gray-100 text-gray-600 border-gray-200";

export const labelTipo = (tipo: string) => TIPO_LABEL[tipo] ?? tipo;
