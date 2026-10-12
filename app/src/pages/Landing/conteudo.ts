import { ArrowLeftRight, Ban, Gauge, Siren } from "../../components/icons";

// Tipos de ocorrência tratados pelo sistema (usado no Início e no Guia).
export const TIPOS_OCORRENCIA = [
  {
    icon: ArrowLeftRight,
    titulo: "Contramão",
    resumo: "Veículo a circular no sentido contrário ao da via.",
    detalhe:
      "Ao criar a denúncia indica o sentido permitido da via. O vídeo é analisado automaticamente para confirmar o veículo em sentido contrário.",
  },
  {
    icon: Ban,
    titulo: "Veículo parado",
    resumo: "Paragem ou estacionamento em local proibido.",
    detalhe:
      "O vídeo tem de mostrar o veículo imobilizado durante pelo menos 10 segundos, para a análise automática confirmar que está mesmo parado.",
  },
  {
    icon: Gauge,
    titulo: "Excesso de velocidade",
    resumo: "Condução acima do limite permitido na via.",
    detalhe:
      "A velocidade é estimada a partir do movimento do veículo no vídeo. Filme com o telemóvel o mais parado possível.",
  },
  {
    icon: Siren,
    titulo: "Acidente de viação",
    resumo: "Comunicado de imediato ao posto policial da zona.",
    detalhe:
      "Não passa pela análise de vídeo: segue logo para o posto da zona, que designa um agente para o local. A matrícula e o ficheiro são opcionais, e pode enviar uma fotografia em vez de vídeo.",
  },
];
