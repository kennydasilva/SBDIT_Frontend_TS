import { ArrowLeftRight, Ban, Gauge, Siren } from "lucide-react";

// Tipos de ocorrência tratados pelo sistema (usado no Início e no Guia).
export const TIPOS_OCORRENCIA = [
  {
    icon: ArrowLeftRight,
    titulo: "Contramão",
    resumo: "Veículos a circular no sentido contrário ao da via.",
    detalhe:
      "Indique o sentido correcto da via ao criar a denúncia. O vídeo é analisado automaticamente para confirmar o veículo em sentido contrário.",
  },
  {
    icon: Ban,
    titulo: "Veículo parado",
    resumo: "Paragem ou estacionamento em local proibido.",
    detalhe:
      "O vídeo deve mostrar o veículo imobilizado durante alguns segundos, para a análise automática confirmar que está mesmo parado.",
  },
  {
    icon: Gauge,
    titulo: "Excesso de velocidade",
    resumo: "Condução acima do limite permitido na via.",
    detalhe:
      "Filme com o telemóvel o mais estável possível: a velocidade é estimada a partir do movimento do veículo no vídeo.",
  },
  {
    icon: Siren,
    titulo: "Acidente de viação",
    resumo: "Reporte directo ao posto policial da zona, sem esperar por análise.",
    detalhe:
      "Não passa pela análise de vídeo: segue de imediato para o posto da zona, que designa um agente para o local. A matrícula e o ficheiro são opcionais, e pode enviar uma fotografia.",
  },
];
