import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { ArrowLeft, MapPin, Calendar, CheckCircle, Archive, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DetalhesDenunciaPt() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - in real app, fetch from backend
  const [denuncia] = useState({
    id: id,
    matricula: "AB-12-CD",
    tipo: "Contramão",
    localizacao: "Avenida da Liberdade, Lisboa",
    sentido: "Norte-Sul (sentido contrário)",
    estado: "Validada",
    dataCaptura: "2026-04-10 09:15:30",
    confianca: 95,
    infracaoDetectada: true,
    codigoLegalSugerido: "Art. 24º - Circulação em Contramão",
    dataAnalise: "2026-04-10 09:16:05",
    ficheiroOriginal: "/videos/original_145.mp4",
    ficheiroProcessado: "/videos/processed_145.mp4",
    processamentoCompleto: true,
  });

  const [isEditing, setIsEditing] = useState(denuncia.estado === "Validada");
  const [codigoLegal, setCodigoLegal] = useState(denuncia.codigoLegalSugerido);
  const [descricao, setDescricao] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAprovar = async () => {
    if (!codigoLegal.trim()) {
      toast.error("Por favor, preencha o código legal");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast.success("Denúncia aprovada com sucesso!");
      setIsSubmitting(false);
      navigate("/pt/denuncias");
    }, 1000);
  };

  const handleArquivar = async () => {
    if (!descricao.trim()) {
      toast.error("Por favor, adicione uma descrição para arquivamento");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast.success("Denúncia arquivada com sucesso!");
      setIsSubmitting(false);
      navigate("/pt/denuncias");
    }, 1000);
  };

  const handleAtualizar = async () => {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast.success("Decisão atualizada com sucesso!");
      setIsSubmitting(false);
      setIsEditing(false);
    }, 1000);
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Validada":
        return "bg-blue-100 text-blue-800";
      case "Aprovada":
        return "bg-green-100 text-green-800";
      case "Arquivada":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/pt/denuncias"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Voltar às Denúncias
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Análise da Denúncia #{denuncia.id}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Info Cards */}
        <div className="space-y-6">
          {/* Informações Gerais */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Informações Gerais
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Matrícula</p>
                <p className="font-medium text-gray-900">{denuncia.matricula}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tipo de Infração</p>
                <p className="font-medium text-gray-900">{denuncia.tipo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    denuncia.estado
                  )}`}
                >
                  {denuncia.estado}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Localização</p>
                  <p className="font-medium text-gray-900">
                    {denuncia.localizacao}
                  </p>
                </div>
              </div>
              {denuncia.sentido && (
                <div>
                  <p className="text-sm text-gray-600">Sentido</p>
                  <p className="font-medium text-gray-900">{denuncia.sentido}</p>
                </div>
              )}
              <div className="flex items-start gap-2">
                <Calendar size={16} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Data de Captura</p>
                  <p className="font-medium text-gray-900">
                    {denuncia.dataCaptura}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Resultado Automático */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Resultado Automático (IA)
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Infração Detectada</p>
                <p className="font-medium text-gray-900">
                  {denuncia.infracaoDetectada ? "Sim" : "Não"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Confiança</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${denuncia.confianca}%` }}
                    ></div>
                  </div>
                  <span className="font-medium text-gray-900">
                    {denuncia.confianca}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Código Legal Sugerido</p>
                <p className="font-medium text-gray-900">
                  {denuncia.codigoLegalSugerido}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Data da Análise</p>
                <p className="font-medium text-gray-900">
                  {denuncia.dataAnalise}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Videos and Decision */}
        <div className="lg:col-span-2 space-y-6">
          {/* Videos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Análise de Vídeo
            </h2>

            {denuncia.processamentoCompleto ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Video Original */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Vídeo Original
                  </h3>
                  <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                    <video
                      controls
                      className="w-full h-full"
                      src={denuncia.ficheiroOriginal}
                    >
                      Seu navegador não suporta vídeo.
                    </video>
                  </div>
                </div>

                {/* Video Processado */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Vídeo Processado (IA)
                  </h3>
                  <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                    <video
                      controls
                      className="w-full h-full"
                      src={denuncia.ficheiroProcessado}
                    >
                      Seu navegador não suporta vídeo.
                    </video>
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="animate-spin text-blue-600 mx-auto mb-3" size={40} />
                  <p className="text-gray-600">
                    Aguardando processamento automático...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Decision Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {denuncia.estado === "Validada" ? "Decisão do PT" : "Decisão Registrada"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código Legal
                </label>
                <input
                  type="text"
                  value={codigoLegal}
                  onChange={(e) => setCodigoLegal(e.target.value)}
                  disabled={!isEditing || isSubmitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Ex: Art. 24º - Circulação em Contramão"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição do PT
                </label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  disabled={!isEditing || isSubmitting}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Adicione observações sobre a denúncia..."
                />
              </div>

              {/* Buttons */}
              {denuncia.estado === "Validada" && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAprovar}
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <CheckCircle size={20} />
                    )}
                    Aprovar Denúncia
                  </button>
                  <button
                    onClick={handleArquivar}
                    disabled={isSubmitting}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Archive size={20} />
                    )}
                    Arquivar Denúncia
                  </button>
                </div>
              )}

              {(denuncia.estado === "Aprovada" || denuncia.estado === "Arquivada") && (
                <div className="pt-4">
                  {isEditing ? (
                    <div className="flex gap-3">
                      <button
                        onClick={handleAtualizar}
                        disabled={isSubmitting}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <Loader2 className="animate-spin" size={20} />
                        ) : null}
                        Salvar Alterações
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        disabled={isSubmitting}
                        className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Atualizar Decisão
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
