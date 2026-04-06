import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  FileText,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Shield,
} from "lucide-react";

const denunciaDetalhes = {
  id: 1,
  matricula: "AB-12-CD",
  tipo: "Contramão",
  estado: "Aprovada",
  descricao:
    "Veículo trafegando em sentido contrário na Rua Principal, próximo ao mercado central.",
  codigoLegal: "Art. 184 - CTB",
  dataRegistro: "2026-04-05 14:30",
  localizacao: "Rua Principal, próximo ao mercado",
  sentidoPermitido: "Esquerda",
  videoOriginal: true,
  videoProcessado: true,
  processamentoCompleto: true,
  analiseAutomatica: {
    infracaoDetectada: true,
    confianca: 87,
    descricao:
      "Sistema detectou veículo trafegando em sentido contrário ao permitido. Análise de movimento confirma infração.",
    timestamp: "2026-04-05 14:35",
  },
  timeline: [
    {
      status: "Denúncia enviada",
      data: "2026-04-05 14:30",
      concluido: true,
      icon: FileText,
    },
    {
      status: "Análise automática",
      data: "2026-04-05 14:35",
      concluido: true,
      icon: AlertTriangle,
      resultado: "Validada",
    },
    {
      status: "Análise do PT",
      data: "2026-04-05 16:20",
      concluido: true,
      icon: Shield,
      resultado: "Aprovada",
    },
  ],
};

const getStatusColor = (estado: string) => {
  switch (estado) {
    case "Pendente":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Validada":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Aprovada":
      return "bg-green-100 text-green-800 border-green-200";
    case "Rejeitada":
      return "bg-red-100 text-red-800 border-red-200";
    case "Arquivada":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function DetalhesDenuncia() {
  const { id } = useParams();

  return (
    <div className="p-8">
      {/* Back Button */}
      <Link
        to="/cidadao/minhas-denuncias"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Voltar para Minhas Denúncias</span>
      </Link>

      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Denúncia #{id}
          </h1>
          <p className="text-gray-600 mt-2">
            Detalhes completos da denúncia
          </p>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
            denunciaDetalhes.estado
          )}`}
        >
          {denunciaDetalhes.estado}
        </span>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="text-blue-600" size={20} />
            <p className="text-sm text-gray-600">Matrícula</p>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {denunciaDetalhes.matricula}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-orange-600" size={20} />
            <p className="text-sm text-gray-600">Tipo</p>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {denunciaDetalhes.tipo}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="text-red-600" size={20} />
            <p className="text-sm text-gray-600">Localização</p>
          </div>
          <p className="text-sm font-medium text-gray-900">
            {denunciaDetalhes.localizacao}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-purple-600" size={20} />
            <p className="text-sm text-gray-600">Data</p>
          </div>
          <p className="text-sm font-medium text-gray-900">
            {denunciaDetalhes.dataRegistro}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Informações */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Informações da Denúncia
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Descrição</p>
                <p className="text-gray-900">{denunciaDetalhes.descricao}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Código Legal</p>
                <p className="font-medium text-gray-900">
                  {denunciaDetalhes.codigoLegal}
                </p>
              </div>
              {denunciaDetalhes.sentidoPermitido && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Sentido Permitido
                  </p>
                  <p className="font-medium text-gray-900">
                    {denunciaDetalhes.sentidoPermitido}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Vídeos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Vídeos da Denúncia
            </h2>

            {denunciaDetalhes.processamentoCompleto ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vídeo Original */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Vídeo enviado pelo cidadão
                  </h3>
                  <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
                    <video
                      controls
                      className="w-full h-full rounded-lg"
                      poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' fill='white' text-anchor='middle' dy='.3em' font-family='sans-serif'%3EVídeo Original%3C/text%3E%3C/svg%3E"
                    >
                      <source src="#" type="video/mp4" />
                    </video>
                  </div>
                </div>

                {/* Vídeo Processado */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Vídeo processado pelo sistema
                  </h3>
                  <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
                    <video
                      controls
                      className="w-full h-full rounded-lg"
                      poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' fill='white' text-anchor='middle' dy='.3em' font-family='sans-serif'%3EVídeo Processado%3C/text%3E%3C/svg%3E"
                    >
                      <source src="#" type="video/mp4" />
                    </video>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                <Clock className="mx-auto text-blue-600 mb-4" size={48} />
                <p className="text-blue-900 font-medium mb-2">
                  Processando análise automática...
                </p>
                <p className="text-blue-700 text-sm">
                  O sistema está analisando o vídeo enviado. Isso pode levar
                  alguns minutos.
                </p>
              </div>
            )}
          </div>

          {/* Resultado da Análise Automática */}
          {denunciaDetalhes.processamentoCompleto && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Resultado da Análise Automática
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {denunciaDetalhes.analiseAutomatica.infracaoDetectada ? (
                    <>
                      <CheckCircle className="text-green-600" size={24} />
                      <div>
                        <p className="font-medium text-gray-900">
                          Infração Detectada
                        </p>
                        <p className="text-sm text-gray-600">
                          O sistema identificou a infração no vídeo
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="text-red-600" size={24} />
                      <div>
                        <p className="font-medium text-gray-900">
                          Infração Não Detectada
                        </p>
                        <p className="text-sm text-gray-600">
                          O sistema não identificou a infração no vídeo
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-600">Nível de Confiança</p>
                    <p className="text-lg font-bold text-gray-900">
                      {denunciaDetalhes.analiseAutomatica.confianca}%
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${denunciaDetalhes.analiseAutomatica.confianca}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Descrição da Análise
                  </p>
                  <p className="text-gray-900">
                    {denunciaDetalhes.analiseAutomatica.descricao}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Código Legal Aplicado</p>
                  <p className="font-medium text-gray-900">
                    {denunciaDetalhes.codigoLegal}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Timeline */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Estado do Processo
            </h2>

            <div className="space-y-6">
              {denunciaDetalhes.timeline.map((item, index) => {
                const Icon = item.icon;
                const isLast = index === denunciaDetalhes.timeline.length - 1;

                return (
                  <div key={index} className="relative">
                    {/* Line */}
                    {!isLast && (
                      <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-200" />
                    )}

                    {/* Item */}
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          item.concluido
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {item.concluido ? (
                          <CheckCircle size={20} />
                        ) : (
                          <Icon size={20} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <p
                          className={`font-medium ${
                            item.concluido
                              ? "text-gray-900"
                              : "text-gray-500"
                          }`}
                        >
                          {item.status}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.data}
                        </p>
                        {item.resultado && (
                          <span
                            className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              item.resultado
                            )}`}
                          >
                            {item.resultado}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
