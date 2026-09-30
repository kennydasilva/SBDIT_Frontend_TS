import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, CheckCircle, Archive, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { denunciaService, type DenunciaDetalhada, type DenunciaTestemunha } from "../../api/denunciaService";
import { labelEstado, toneEstado } from "../../utils/estadoDenuncia";
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
      toast.error("Por favor, preencha o código legal");
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
      toast.success("Denúncia aprovada com sucesso!");
      navigate("/pt/denuncias");
    } catch (error) {
      toast.error("Erro ao aprovar denúncia");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArquivar = async () => {
    if (!descricao.trim()) {
      toast.error("Por favor, adicione uma descrição para arquivamento");
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
      toast.success("Denúncia arquivada com sucesso!");
      navigate("/pt/denuncias");
    } catch (error) {
      toast.error("Erro ao arquivar denúncia");
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
      toast.success("Decisão atualizada com sucesso!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Erro ao atualizar decisão");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const confiancaPercent = Math.round((Number(denuncia?.confianca) || 0) * 100);

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "VALIDADA":
        return "bg-blue-100 text-blue-800";
      case "APROVADA":
        return "bg-green-100 text-green-800";
      case "ARQUIVADA":
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
          Análise da Denúncia #{denuncia?.id}
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
                <p className="font-medium text-gray-900">{denuncia?.matricula}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tipo de Infração</p>
                <p className="font-medium text-gray-900">{denuncia?.tipo_infracao}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    denuncia?.estado || " "
                  )}`}
                >
                  {denuncia?.estado}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-blue-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Localização</p>
                  <p className="font-medium text-gray-900">
                    {denuncia?.localizacao}
                  </p>
                </div>
              </div>
              {denuncia?.sentido_direccao && (
                <div>
                  <p className="text-sm text-gray-600">Sentido</p>
                  <p className="font-medium text-gray-900">{denuncia?.sentido_direccao}</p>
                </div>
              )}
              <div className="flex items-start gap-2">
                <Calendar size={16} className="text-green-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Data</p>
                  <p className="font-medium text-gray-900">
                    {denuncia?.data_captura}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Resultado Automático */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Resultado Automático 
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Infração Detectada</p>
                <p className="font-medium text-gray-900">
                  {denuncia?.infracao_detectada ? "Sim" : "Não"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Confiança</p>
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
                <p className="text-sm text-gray-600">Código Legal Sugerido</p>
                <p className="font-medium text-gray-900">
                  {denuncia?.codigo_legal}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Data da Análise</p>
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Análise de Vídeo
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {denuncia?.estado === "VALIDADA" ? "Decisão do PT" : "Decisão Registrada"}
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
                  disabled={(denuncia?.estado !== "VALIDADA" && !isEditing) || isSubmitting}
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
                  disabled={(denuncia?.estado !== "VALIDADA" && !isEditing) || isSubmitting}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Adicione observações sobre a denúncia..."
                />
              </div>

              {/* Buttons */}
              {denuncia?.estado === "VALIDADA" && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAprovar}
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin text-white" size={20} />
                    ) : (
                      <CheckCircle className="text-white" size={20} />
                    )}
                    Aprovar Denúncia
                  </button>
                  <button
                    onClick={handleArquivar}
                    disabled={isSubmitting}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin text-white" size={20} />
                    ) : (
                      <Archive className="text-white" size={20} />
                    )}
                    Arquivar Denúncia
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
