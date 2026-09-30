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
  Siren,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { denunciaService, type DenunciaDetalhada } from "../../api/denunciaService";
import { useAuth } from "../../hooks/useAuth";
import { labelEstado, labelTipo, toneEstado } from "../../utils/estadoDenuncia";
import { ALERT_ERROR, CARD, PAGE, PAGE_SUBTITLE, PAGE_TITLE, SECTION_TITLE } from "../../utils/uiClasses";

export default function DetalhesDenuncia() {
  const { user, loading: authLoading } = useAuth();
  const { id } = useParams();
  const [denuncia, setDenuncia] = useState<DenunciaDetalhada | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      if (!authLoading && user && id) {
        carregarDenuncia();
      }
  }, [authLoading, user, id]);

  const carregarDenuncia = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data=await denunciaService.obterPorId(Number(id));
      setDenuncia(data);
    }
    catch(error) {
      setError("Erro ao carregar detalhes da denúncia.");
    }
    finally {
      setLoading(false);
    }
  };

  const BASE_URL = "http://127.0.0.1:8000";

  

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }
  if (error || !denuncia) {
    return (
      <div className={PAGE}>
        <div className={ALERT_ERROR}>{error ?? "Denúncia não encontrada."}</div>
      </div>
    );
  }

  // Acidente não passa por análise de vídeo nem pelo PT: vai directo ao
  // Admin do posto da zona (SMS), que designa um agente para o local.
  const ehAcidente = denuncia.tipo_infracao === "ACIDENTE";
  const ficheiroEhImagem = /\.(jpe?g|png)$/i.test(denuncia.ficheiro_original ?? "");

  const timelineAcidente = [
    {
      status: "Denúncia enviada",
      data: denuncia.data_registo,
      concluido: true,
      icon: FileText,
      resultado: undefined as string | undefined,
    },
    {
      status: "Enviada ao posto responsável",
      data: null,
      concluido: ["ENCAMINHADA", "EM_ATENDIMENTO"].includes(denuncia.estado),
      icon: Siren,
      resultado: denuncia.estado === "PENDENTE" ? "PENDENTE" : undefined,
    },
    {
      status: "Agente designado para o local",
      data: null,
      concluido: denuncia.estado === "EM_ATENDIMENTO",
      icon: Shield,
      resultado: undefined,
    },
  ];

  const timeline = ehAcidente ? timelineAcidente : [
  {
    status: "Denúncia enviada",
    data: denuncia.data_captura,
    concluido: true,
    icon: FileText,
  },
  {
    status: "Análise automática",
    data: denuncia.data_analise,
    concluido: !!denuncia.data_analise,
    icon: AlertTriangle,
    resultado: denuncia.estado === "VALIDADA" ? "VALIDADA" : undefined,
  },
  {
    status: "Análise do PT",
    data: denuncia.data_analise,
    concluido: ["APROVADA", "REJEITADA"].includes(denuncia.estado),
    icon: Shield,
    resultado: denuncia.estado,
  },
];

  return (
    <div className={PAGE}>
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
          <h1 className={PAGE_TITLE}>
            Denúncia #{id}
          </h1>
          <p className={PAGE_SUBTITLE}>
            Detalhes completos da denúncia
          </p>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-medium border ${toneEstado(
            denuncia.estado
          )}`}
        >
          {labelEstado(denuncia.estado, denuncia.tipo_infracao)}
        </span>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`${CARD} p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <FileText className="text-blue-600" size={20} />
            <p className="text-sm text-gray-600">Matrícula</p>
          </div>
          <p className={SECTION_TITLE}>
            {denuncia.matricula}
          </p>
        </div>

        <div className={`${CARD} p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-orange-600" size={20} />
            <p className="text-sm text-gray-600">Tipo</p>
          </div>
          <p className={SECTION_TITLE}>
            {labelTipo(denuncia.tipo_infracao)}
          </p>
        </div>

        <div className={`${CARD} p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="text-rose-600" size={20} />
            <p className="text-sm text-gray-600">Localização</p>
          </div>
          <p className="text-sm font-medium text-gray-900">
            {denuncia.localizacao}
          </p>
        </div>

        <div className={`${CARD} p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-purple-600" size={20} />
            <p className="text-sm text-gray-600">Data</p>
          </div>
          <p className="text-sm font-medium text-gray-900">
            {denuncia.data_captura || denuncia.data_registo}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Informações */}
          <div className={`${CARD} p-6`}>
            <h2 className={`${SECTION_TITLE} mb-4`}>
              Informações da Denúncia
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Descrição</p>
                <p className="text-gray-900">{denuncia.descricao}</p>
              </div>
              {denuncia.denuncia_principal_id && (
                <p className="text-sm text-violet-800 bg-violet-50 border border-violet-100 rounded-lg p-3">
                  {ehAcidente
                    ? "Este acidente já tinha sido reportado por outra pessoa. O seu reporte foi juntado ao existente."
                    : "Outro cidadão já tinha denunciado esta infração. A sua denúncia foi ligada à dele como testemunha e reforça o processo."}
                </p>
              )}
              {!ehAcidente && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Código Legal</p>
                  <p className="font-medium text-gray-900">
                    {denuncia.codigo_legal}
                  </p>
                </div>
              )}
              {ehAcidente && (
                <p className="text-sm text-violet-800 bg-violet-50 border border-violet-100 rounded-lg p-3">
                  {denuncia.estado === "PENDENTE"
                    ? "O local marcado não pertence a nenhuma jurisdição registada, por isso nenhum posto foi avisado automaticamente."
                    : "Esta denúncia foi enviada directamente, por SMS, ao posto policial responsável pela zona, que designa um agente para o local."}
                </p>
              )}
              {denuncia.sentido_direccao&& (
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Sentido Permitido
                  </p>
                  <p className="font-medium text-gray-900">
                    {denuncia.sentido_direccao}
                  </p>
                </div>
              )}
            </div>
          </div>

          {ehAcidente ? (
            <div className={`${CARD} p-6`}>
              <h2 className={`${SECTION_TITLE} mb-6`}>
                Foto/vídeo do acidente
              </h2>
              {denuncia.ficheiro_original ? (
                ficheiroEhImagem ? (
                  <img
                    src={`${BASE_URL}${denuncia.ficheiro_original}`}
                    alt="Foto do acidente"
                    className="w-full max-w-xl rounded-lg"
                  />
                ) : (
                  <video controls className="w-full max-w-xl rounded-lg">
                    <source src={`${BASE_URL}${denuncia.ficheiro_original}`} type="video/mp4" />
                  </video>
                )
              ) : (
                <p className="text-gray-500 text-sm">Nenhuma foto ou vídeo enviado.</p>
              )}
            </div>
          ) : (
          <div className={`${CARD} p-6`}>
              <h2 className={`${SECTION_TITLE} mb-6`}>
                Vídeos da Denúncia
              </h2>

              {denuncia.ficheiro_original ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Vídeo Original */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Vídeo enviado pelo cidadão
                    </h3>
                    <video controls className="w-full rounded-lg">
                      <source src={`${BASE_URL}${denuncia.ficheiro_original}`} type="video/mp4" />
                    </video>
                  </div>

                  {/* Vídeo Processado */}
                  {denuncia.ficheiro_processado ? (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Vídeo processado pelo sistema
                      </h3>
                      <video controls className="w-full rounded-lg">
                        <source src={`${BASE_URL}${denuncia.ficheiro_processado}`} type="video/mp4" />
                      </video>
                    </div>
                  ) : (
                    denuncia.estado === "PENDENTE" ? (
                      <div className="flex items-center justify-center bg-amber-50 rounded-lg">
                        <div className="text-center p-6">
                          <Clock className="mx-auto text-amber-600 mb-2" size={32} />
                          <p>Processando vídeo...</p>
                        </div>
                      </div>
                    ) : (
                      // Esgotadas as tentativas de análise: rejeitada sem
                      // vídeo processado.
                      <div className="flex items-center justify-center bg-rose-50 rounded-lg">
                        <div className="text-center p-6">
                          <XCircle className="mx-auto text-rose-600 mb-2" size={32} />
                          <p className="text-rose-800">Não foi possível analisar o vídeo</p>
                        </div>
                      </div>
                    )
                  )}

                </div>
              ) : (
                <div className="text-center p-6">
                  <Clock className="mx-auto text-blue-600 mb-2" size={32} />
                  <p>Sem vídeo disponível</p>
                </div>
              )}
            </div>
          )}

          {/* Resultado da Análise Automática */}
          {denuncia.ficheiro_processado && (
            <div className={`${CARD} p-6`}>
              <h2 className={`${SECTION_TITLE} mb-4`}>
                Resultado da Análise Automática
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {denuncia.infracao_detectada ? (
                    <>
                      <CheckCircle className="text-emerald-600" size={24} />
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
                      <XCircle className="text-rose-600" size={24} />
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
                    <p className={SECTION_TITLE}>
                      {denuncia.confianca}%
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${denuncia.confianca}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Descrição da Análise
                  </p>
                  <p className="text-gray-900">
                    {denuncia.descricao}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Código Legal Aplicado</p>
                  <p className="font-medium text-gray-900">
                    {denuncia.codigo_legal}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Timeline */}
        <div>
          <div className={`${CARD} p-6 sticky top-8`}>
            <h2 className={`${SECTION_TITLE} mb-6`}>
              Estado do Processo
            </h2>

            <div className="space-y-6">
              {timeline.map((item, index) => {
                const Icon = item.icon;
                const isLast = index === timeline.length - 1;

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
                            ? "bg-emerald-100 text-emerald-600"
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
                            className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium border ${toneEstado(
                              item.resultado
                            )}`}
                          >
                            {labelEstado(item.resultado, denuncia.tipo_infracao)}
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
