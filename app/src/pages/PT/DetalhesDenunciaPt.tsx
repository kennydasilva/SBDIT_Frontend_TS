import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, CheckCircle, Archive, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { denunciaService, type DenunciaDetalhada, type DenunciaTestemunha } from "../../api/denunciaService";
import { labelEstado, labelTipo, toneEstado } from "../../utils/estadoDenuncia";
import { mensagemDeErro } from "../../utils/mensagens";
import {
  PAGE, PAGE_TITLE, CARD, SECTION_TITLE, INPUT, LABEL, BADGE,
  BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_DANGER, ALERT_ERROR,
} from "../../utils/uiClasses";
import { REGEX } from "../../utils/validationSchemas";

export default function DetalhesDenunciaPt() {
  const { id } = useParams();
  const navigate = useNavigate();


  
  const [denuncia, setDenuncia] = useState<DenunciaDetalhada | null>(null);
  // Outros cidadãos que denunciaram a mesma infração: o agente vê todos
  // os vídeos antes de decidir (aprovar estende-se ao grupo).
  const [testemunhas, setTestemunhas] = useState<DenunciaTestemunha[]>([]);
  const [loading, setLoading] = useState(true);
  const[error, setError]= useState<string | undefined>(undefined);

  const [isEditing, setIsEditing] = useState(false);
  const [codigoLegal, setCodigoLegal] = useState("");
  const [descricao, setDescricao] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const BASE_URL = "http://127.0.0.1:8000";

  useEffect(() => {
      if (!authLoading && user && id) {
        carregarDenuncia();
      }
  }, [authLoading, user, id]);

  useEffect(() => {
    if (denuncia) {
      setCodigoLegal(denuncia.codigo_legal || "");
      setDescricao("");
    }
  }, [denuncia]);

  useEffect(() => {
    if (!denuncia?.total_relacionadas) {
      setTestemunhas([]);
      return;
    }
    denunciaService
      .listarRelacionadas(denuncia.id)
      .then(setTestemunhas)
      .catch(() => setTestemunhas([]));
  }, [denuncia?.id, denuncia?.total_relacionadas]);

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

  const handleAprovar = async () => {
    if (!codigoLegal.trim()) {
      toast.error("Indique o código legal para aprovar");
      return;
    }

    if (!REGEX.codigoLegal.test(codigoLegal)) {
      toast.error("Código legal inválido (3-150 caracteres)");
      return;
    }

    setIsSubmitting(true);
    try {
      await denunciaService.actualizar({
        pt_id: user?.id || 0,
        descricao_pt: descricao,
        codigo_legal: codigoLegal,
        denuncia_id: denuncia?.id || 0,
        estado: "APROVADA"
      });
      toast.success("Denúncia aprovada.");
      navigate("/pt/denuncias");
    } catch (error) {
      toast.error(mensagemDeErro(error, "Erro ao aprovar a denúncia"));
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArquivar = async () => {
    if (!descricao.trim()) {
      toast.error("Indique o motivo do arquivamento nas observações");
      return;
    }

    setIsSubmitting(true);
    try {
      await denunciaService.actualizar({
        pt_id: user?.id || 0,
        descricao_pt: descricao,
        codigo_legal: codigoLegal,
        denuncia_id: denuncia?.id || 0,
        estado: "ARQUIVADA"
      });
      toast.success("Denúncia arquivada.");
      navigate("/pt/denuncias");
    } catch (error) {
      toast.error(mensagemDeErro(error, "Erro ao arquivar a denúncia"));
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAtualizar = async () => {
    if (codigoLegal.trim() && !REGEX.codigoLegal.test(codigoLegal)) {
      toast.error("Código legal inválido (3-150 caracteres)");
      return;
    }

    setIsSubmitting(true);
    try {
      await denunciaService.actualizar({
        pt_id: user?.id || 0,
        descricao_pt: descricao,
        codigo_legal: codigoLegal,
        denuncia_id: denuncia?.id || 0,
        estado: denuncia?.estado || "VALIDADA"
      });
      toast.success("Decisão atualizada.");
      setIsEditing(false);
    } catch (error) {
      toast.error(mensagemDeErro(error, "Erro ao atualizar a decisão"));
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const confiancaPercent = Math.round((Number(denuncia?.confianca) || 0) * 100);



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

  return (
    <div className={PAGE}>
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/pt/denuncias"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft size={18} className="mr-1.5" />
          Voltar às denúncias
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className={PAGE_TITLE}>Denúncia #{denuncia?.id}</h1>
          {denuncia && (
            <span className={`${BADGE} ${toneEstado(denuncia.estado)}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
              {labelEstado(denuncia.estado, denuncia.tipo_infracao)}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Info Cards */}
        <div className="space-y-6">
          {/* Informações Gerais */}
          <div className={`${CARD} p-6`}>
            <h2 className={`${SECTION_TITLE} mb-4`}>
              Informações Gerais
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Matrícula</p>
                <p className="font-medium text-gray-900">{denuncia?.matricula}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tipo de Infração</p>
                <p className="font-medium text-gray-900">{labelTipo(denuncia?.tipo_infracao ?? "")}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</p>
                <span className={`${BADGE} ${toneEstado(denuncia?.estado ?? "")} mt-1`}>
                  {labelEstado(denuncia?.estado ?? "", denuncia?.tipo_infracao)}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Localização</p>
                  <p className="font-medium text-gray-900">
                    {denuncia?.localizacao}
                  </p>
                </div>
              </div>
              {denuncia?.sentido_direccao && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sentido</p>
                  <p className="font-medium text-gray-900">{denuncia?.sentido_direccao}</p>
                </div>
              )}
              <div className="flex items-start gap-2">
                <Calendar size={16} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Data</p>
                  <p className="font-medium text-gray-900">
                    {denuncia?.data_captura}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Resultado Automático */}
          <div className={`${CARD} p-6`}>
            <h2 className={`${SECTION_TITLE} mb-4`}>
              Análise automática
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Infração Detectada</p>
                <p className="font-medium text-gray-900">
                  {denuncia?.infracao_detectada ? "Sim" : "Não"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Confiança</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                  
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${confiancaPercent}%` }}
                    ></div>
                  </div>
                  <span className="font-medium text-gray-900">
                    {confiancaPercent}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Código Legal Sugerido</p>
                <p className="font-medium text-gray-900">
                  {denuncia?.codigo_legal}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Data da Análise</p>
                <p className="font-medium text-gray-900">
                  {denuncia?.data_analise}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Videos and Decision */}
        <div className="lg:col-span-2 space-y-6">
          {/* Videos */}
          <div className={`${CARD} p-6`}>
            <h2 className={`${SECTION_TITLE} mb-4`}>
              Vídeos
            </h2>

            {denuncia?.ficheiro_processado ? (
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
                     
                    >
                      <source src={`${BASE_URL}${denuncia.ficheiro_original}`} type="video/mp4" />
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
                      
                    >
                      <source src={`${BASE_URL}${denuncia.ficheiro_processado}`} type="video/mp4" />
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

          {/* Mesmo vídeo declarado noutro local: provável denúncia falsa */}
          {denuncia?.localizacao_contraditoria && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
              <p className="font-semibold mb-1">⚠️ Possível denúncia falsa — localização contraditória</p>
              <p>
                O vídeo é igual ao da denúncia #{denuncia.video_semelhante_a_id}, mas os locais declarados não batem certo:
              </p>
              <ul className="list-disc ml-5 mt-1">
                <li>Esta denúncia: <strong>{denuncia.localizacao}</strong></li>
                <li>
                  Denúncia original #{denuncia.video_semelhante_a_id}: <strong>{denuncia.video_semelhante_a_localizacao}</strong>
                </li>
              </ul>
              {denuncia.distancia_video_semelhante_m != null && (
                <p className="mt-1">
                  Distância entre os dois locais:{" "}
                  {denuncia.distancia_video_semelhante_m >= 1000
                    ? `${(denuncia.distancia_video_semelhante_m / 1000).toFixed(1)} km`
                    : `${denuncia.distancia_video_semelhante_m} m`}
                </p>
              )}
              <p className="mt-2 text-rose-800">
                Ficou com o posto da denúncia original. Não é aprovada automaticamente com a original — decida-a à parte.
              </p>
            </div>
          )}

          {/* Ligação a outra denúncia (testemunha ou vídeo semelhante) */}
          {(denuncia?.denuncia_principal_id || denuncia?.video_semelhante_a_id) && (
            <div className="rounded-lg border border-violet-200 bg-violet-50 p-4 text-sm text-violet-900 space-y-1">
              {denuncia.video_semelhante_a_id && (
                <p>
                  ⚠️ O vídeo desta denúncia é <strong>visualmente igual</strong> ao da{" "}
                  <Link to={`/pt/denuncias/${denuncia.video_semelhante_a_id}`} className="underline font-medium">
                    denúncia #{denuncia.video_semelhante_a_id}
                  </Link>
                  {denuncia.video_semelhante_a_estado && ` (${labelEstado(denuncia.video_semelhante_a_estado)})`}
                  {" "}— pode ser o mesmo vídeo cortado ou recomprimido.
                </p>
              )}
              {denuncia.denuncia_principal_id && (
                <p>
                  Ligada à{" "}
                  <Link to={`/pt/denuncias/${denuncia.denuncia_principal_id}`} className="underline font-medium">
                    denúncia #{denuncia.denuncia_principal_id}
                  </Link>{" "}
                  (a principal do grupo). Aprovar a principal aprova também esta, se ainda estiver aberta.
                </p>
              )}
            </div>
          )}

          {/* Vídeos das testemunhas */}
          {testemunhas.length > 0 && (
            <div className={`${CARD} p-6`}>
              <h2 className={`${SECTION_TITLE} mb-1 flex items-center gap-2`}>
                <Users size={20} className="text-violet-600" />
                Vídeos das testemunhas ({testemunhas.length})
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Outros cidadãos denunciaram a mesma infração. Ao aprovar, as denúncias das testemunhas
                ainda abertas são aprovadas também; ao rejeitar, continuam na fila para decisão própria.
              </p>

              <div className="space-y-6">
                {testemunhas.map((t) => (
                  <div key={t.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-900">
                        Denúncia #{t.id} <span className="text-gray-400 font-normal">· {t.data_registo}</span>
                        {t.video_semelhante_a_id && (
                          <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                            vídeo semelhante ao da #{t.video_semelhante_a_id}
                          </span>
                        )}
                        {t.localizacao_contraditoria && (
                          <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700">
                            ⚠️ local contraditório: {t.localizacao}
                          </span>
                        )}
                      </p>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${toneEstado(t.estado)}`}>
                        {labelEstado(t.estado)}
                      </span>
                    </div>
                    {t.descricao && <p className="text-sm text-gray-600 mb-3">{t.descricao}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { titulo: "Vídeo Original", src: t.ficheiro_original },
                        { titulo: "Vídeo Processado (IA)", src: t.ficheiro_processado },
                      ].map((v) => (
                        <div key={v.titulo}>
                          <h3 className="text-xs font-medium text-gray-500 mb-2">{v.titulo}</h3>
                          {v.src ? (
                            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                              <video controls className="w-full h-full">
                                <source src={`${BASE_URL}${v.src}`} type="video/mp4" />
                              </video>
                            </div>
                          ) : (
                            <div className="aspect-video bg-gray-50 rounded-lg flex items-center justify-center text-sm text-gray-500">
                              {v.titulo.includes("IA") ? "Análise ainda em curso" : "Sem vídeo"}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {t.confianca != null && (
                      <p className="text-xs text-gray-500 mt-2">
                        Confiança da análise: {Math.round(t.confianca * 100)}%
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Decision Form */}
          <div className={`${CARD} p-6`}>
            <h2 className={`${SECTION_TITLE} mb-4`}>
              {denuncia?.estado === "VALIDADA" ? "A sua decisão" : "Decisão registada"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className={LABEL}>Código legal</label>
                <input
                  type="text"
                  value={codigoLegal}
                  onChange={(e) => setCodigoLegal(e.target.value)}
                  disabled={(denuncia?.estado !== "VALIDADA" && !isEditing) || isSubmitting}
                  className={`${INPUT} disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed`}
                  placeholder="Ex: Art. 24º - Circulação em Contramão"
                />
              </div>

              <div>
                <label className={LABEL}>Observações do agente</label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  disabled={(denuncia?.estado !== "VALIDADA" && !isEditing) || isSubmitting}
                  rows={4}
                  className={`${INPUT} disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed`}
                  placeholder="Motivo da decisão (obrigatório para arquivar)"
                />
              </div>

              {/* Buttons */}
              {denuncia?.estado === "VALIDADA" && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAprovar}
                    disabled={isSubmitting}
                    className={`${BUTTON_PRIMARY} flex-1 py-3`}
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                    Aprovar denúncia
                  </button>
                  <button
                    onClick={handleArquivar}
                    disabled={isSubmitting}
                    className={`${BUTTON_DANGER} flex-1 py-3`}
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Archive size={18} />}
                    Arquivar denúncia
                  </button>
                </div>
              )}

              {(denuncia?.estado === "APROVADA" || denuncia?.estado === "ARQUIVADA") && (
                <div className="pt-4">
                  {isEditing ? (
                    <div className="flex gap-3">
                      <button
                        onClick={handleAtualizar}
                        disabled={isSubmitting}
                        className={`${BUTTON_PRIMARY} flex-1`}
                      >
                        {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                        Guardar alterações
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        disabled={isSubmitting}
                        className={BUTTON_SECONDARY}
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className={`${BUTTON_SECONDARY} w-full`}
                    >
                      Alterar decisão
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
