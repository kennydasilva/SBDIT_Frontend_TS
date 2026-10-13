import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Upload, X, CheckCircle, Loader2, ArrowLeft, ArrowRight } from "../../components/icons";
import { denunciaService } from "../../api/denunciaService";
import { useAuth } from "../../hooks/useAuth";
import { REGEX, MATRICULA_EXEMPLO, MATRICULA_INVALIDA, PROVINCIAS_MATRICULA } from "../../utils/validationSchemas";
import LocationPicker from "../../components/LocationPicker";
import PageHeader from "../../components/app/PageHeader";
import Campo, { Dados } from "../../components/app/Campo";
import { labelTipo } from "../../utils/estadoDenuncia";
import {
  PAGE, CARD, INPUT, TEXTAREA, BUTTON_PRIMARY, BUTTON_SECONDARY, ALERT_INFO, ALERT_SUCCESS, ICON_BUTTON_DANGER,
} from "../../utils/uiClasses";
import { mostrarAviso, mostrarErro } from "../../utils/mensagens";

// O que o cidadão pode denunciar, com o que cada tipo exige dele.
const TIPOS = [
  { valor: "CONTRAMAO", texto: "Veículo a circular no sentido contrário ao da via." },
  { valor: "PARADO", texto: "Paragem ou estacionamento em local proibido. O vídeo deve mostrar o veículo parado pelo menos 10 segundos." },
  { valor: "VELOCIDADE", texto: "Condução acima do limite da via. Filme com o telemóvel o mais parado possível." },
  { valor: "ACIDENTE", texto: "Segue de imediato para o posto policial da zona. A matrícula e o ficheiro são opcionais." },
];

const PASSOS = ["Tipo de ocorrência", "Veículo e prova", "Local e envio"];

const VIDEO_MAX_SIZE_MB = 100;

type Erros = { tipo?: string; sentido?: string; matricula?: string; ficheiro?: string; descricao?: string; mapa?: string };

export default function CriarDenuncia() {
  const navigate = useNavigate();
  const [passo, setPasso] = useState(0);
  const [formData, setFormData] = useState({
    matricula: "",
    tipoInfracao: "",
    sentidoPermitido: "",
    descricao: "",
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  // Protecção contra duplo clique: o estado `isLoading` só desactiva o
  // botão no próximo render, e dois cliques rápidos passam os dois antes
  // disso. O ref bloqueia de forma síncrona; o `pedidoId` (um por
  // formulário) faz o backend recusar um envio repetido que ainda chegue.
  const enviandoRef = useRef(false);
  const pedidoIdRef = useRef(
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  const { user } = useAuth();
  const [fieldErrors, setFieldErrors] = useState<Erros>({});
  // Local vem só do mapa (pesquisa ou clique) - sem campo de texto à
  // parte a repetir a mesma informação.
  const [local, setLocal] = useState<{ lat: number; lng: number; endereco: string } | null>(null);

  // Acidente é reporte directo ao posto responsável pela zona (SMS ao
  // Admin), sem análise de vídeo por IA: o ficheiro é opcional.
  const ehAcidente = formData.tipoInfracao === "ACIDENTE";
  const ehContramao = formData.tipoInfracao === "CONTRAMAO";
  const ehImagem = videoFile?.type.startsWith("image/") ?? false;

  const mudar = (campo: keyof typeof formData, valor: string) =>
    setFormData((prev) => ({ ...prev, [campo]: valor }));

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > VIDEO_MAX_SIZE_MB * 1024 * 1024) {
      mostrarAviso(`Ficheiro demasiado grande (máximo ${VIDEO_MAX_SIZE_MB} MB). Reduza a duração ou a qualidade do vídeo.`);
      e.target.value = "";
      return;
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setFieldErrors((prev) => ({ ...prev, ficheiro: undefined }));
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview(null);
  };

  // Cada passo valida só o que pede; o envio valida os três.
  const errosDoPasso = (n: number): Erros => {
    const errors: Erros = {};

    if (n === 0) {
      if (!formData.tipoInfracao) errors.tipo = "Escolha o tipo de ocorrência";
      if (ehContramao && !formData.sentidoPermitido) errors.sentido = "Indique o sentido permitido da via";
    }

    if (n === 1) {
      // Opcional só em acidente (quem reporta pode não saber a matrícula);
      // se for preenchida, tem sempre de ser válida.
      const matricula = formData.matricula.trim();
      if ((matricula || !ehAcidente) && !REGEX.matricula.test(matricula)) {
        errors.matricula = MATRICULA_INVALIDA;
      }
      if (!videoFile && !ehAcidente) {
        errors.ficheiro = "Adicione o vídeo da infração";
      } else if (!ehAcidente && ehImagem) {
        errors.ficheiro = "Para este tipo de infração é necessário um vídeo (fotografias só são aceites em acidentes)";
      }
      if (formData.descricao && !REGEX.descricao.test(formData.descricao)) {
        errors.descricao = "A descrição deve ter entre 5 e 1000 caracteres";
      }
    }

    // Obrigatório em todos os tipos: é a localização da denúncia e é por
    // ele que se encontra o posto responsável pela zona.
    if (n === 2 && !local) {
      errors.mapa = "Pesquise ou marque no mapa o local exato onde aconteceu";
    }

    return errors;
  };

  const avancar = () => {
    const errors = errosDoPasso(passo);
    setFieldErrors(errors);
    if (Object.keys(errors).length === 0) setPasso((p) => p + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passo < PASSOS.length - 1) {
      avancar();
      return;
    }

    if (enviandoRef.current || showSuccess) return;

    // Volta ao primeiro passo que tiver erros.
    for (let n = 0; n < PASSOS.length; n++) {
      const errors = errosDoPasso(n);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setPasso(n);
        return;
      }
    }

    if (!user) {
      mostrarAviso("A sua sessão terminou. Entre de novo.");
      return;
    }

    enviandoRef.current = true;
    let enviada = false;

    try {
      setIsLoading(true);

      await denunciaService.criar({
        pedido_id: pedidoIdRef.current,
        cidadao_id: user.id,
        matricula: formData.matricula.trim().toUpperCase(),
        descricao: formData.descricao,
        tipo_infracao: formData.tipoInfracao,
        localizacao: (local?.endereco ?? "").slice(0, 255),
        sentido_direccao: ehContramao ? formData.sentidoPermitido : "",
        caminho_ficheiro: videoFile ?? null,
        latitude: local?.lat ?? null,
        longitude: local?.lng ?? null,
      });

      enviada = true;
    } catch (error: any) {
      if (error?.response?.data?.codigo === "PEDIDO_REPETIDO") {
        // Este formulário já tinha sido enviado (pedido repetido) - a
        // denúncia existe, não é um erro para o cidadão. Outros 409
        // (ficheiro já usado, denúncia aberta repetida) são recusas reais.
        enviada = true;
      } else {
        console.error(error);
        mostrarErro(error, "Erro ao enviar a denúncia");
      }
    } finally {
      setIsLoading(false);
      // Depois de enviada, o formulário fica bloqueado até sair da página.
      if (!enviada) enviandoRef.current = false;
    }

    if (enviada) {
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/cidadao/minhas-denuncias");
      }, 2000);
    }
  };

  return (
    <div className={PAGE}>
      <PageHeader
        titulo="Criar denúncia"
        texto="Três passos: o que aconteceu, o veículo e a prova, e o local."
      />

      <div className="max-w-3xl">
        {/* Progresso */}
        <ol className="mb-4 grid grid-cols-3 gap-2" aria-label="Passos da denúncia">
          {PASSOS.map((nome, i) => {
            const feito = i < passo;
            const atual = i === passo;
            return (
              <li key={nome} aria-current={atual ? "step" : undefined}>
                <button
                  type="button"
                  onClick={() => feito && !isLoading && !showSuccess && setPasso(i)}
                  disabled={!feito || isLoading || showSuccess}
                  className={`block w-full border-t-2 pt-2 text-left ${
                    atual || feito ? "border-blue-600" : "border-gray-300"
                  } ${feito ? "" : "!cursor-default"}`}
                >
                  <span className={`block text-xs ${atual || feito ? "text-blue-800" : "text-gray-500"}`}>
                    Passo {i + 1} de {PASSOS.length}
                  </span>
                  <span className={`block text-sm font-medium ${atual ? "text-gray-900" : feito ? "text-blue-800" : "text-gray-500"}`}>
                    {nome}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {showSuccess && (
          <div className={`${ALERT_SUCCESS} mb-4 flex items-start gap-3`} role="status">
            <CheckCircle className="mt-0.5 shrink-0" size={16} />
            <div>
              <p className="font-semibold">Denúncia enviada.</p>
              <p>
                {ehAcidente && "O posto responsável pela zona foi avisado por SMS. "}
                A abrir as suas denúncias…
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className={`${CARD} p-6`}>
          {passo === 0 && (
            <div className="space-y-6">
              <fieldset>
                <legend className="text-base font-semibold text-gray-900">O que quer denunciar?</legend>
                <div className="mt-3 divide-y divide-gray-200 overflow-hidden rounded-md border border-gray-300">
                  {TIPOS.map((t) => {
                    const escolhido = formData.tipoInfracao === t.valor;
                    return (
                      <label
                        key={t.valor}
                        className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors ${
                          escolhido ? "bg-blue-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="tipoInfracao"
                          value={t.valor}
                          checked={escolhido}
                          onChange={() => {
                            mudar("tipoInfracao", t.valor);
                            setFieldErrors({});
                          }}
                          className="mt-1 h-4 w-4 shrink-0"
                        />
                        <span>
                          <span className="block text-sm font-medium text-gray-900">{labelTipo(t.valor)}</span>
                          <span className="block text-sm text-gray-600">{t.texto}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
                {fieldErrors.tipo && <p className="mt-1.5 text-xs font-medium text-rose-600">{fieldErrors.tipo}</p>}
              </fieldset>

              {ehContramao && (
                <fieldset>
                  <legend className="text-sm font-medium text-gray-800">Sentido permitido da via</legend>
                  <p className="mt-1 text-xs text-gray-500">
                    Visto no vídeo: para que lado devem circular os veículos nessa via.
                  </p>
                  <div className="mt-2 flex gap-6">
                    {["Esquerda", "Direita"].map((sentido) => (
                      <label key={sentido} className="flex cursor-pointer items-center gap-2 text-sm text-gray-800">
                        <input
                          type="radio"
                          name="sentidoPermitido"
                          value={sentido}
                          checked={formData.sentidoPermitido === sentido}
                          onChange={() => mudar("sentidoPermitido", sentido)}
                          className="h-4 w-4"
                        />
                        {sentido}
                      </label>
                    ))}
                  </div>
                  {fieldErrors.sentido && <p className="mt-1.5 text-xs font-medium text-rose-600">{fieldErrors.sentido}</p>}
                </fieldset>
              )}

              {ehAcidente && (
                <p className={ALERT_INFO}>
                  O acidente é enviado directamente, por SMS, ao posto policial responsável pela zona
                  marcada no mapa, que designa um agente para o local. Não passa por análise de vídeo.
                </p>
              )}
            </div>
          )}

          {passo === 1 && (
            <div className="space-y-5">
              <Campo
                rotulo="Matrícula do veículo"
                opcional={ehAcidente}
                erro={fieldErrors.matricula}
                ajuda={`Três letras, três algarismos e a sigla da província (${Object.keys(PROVINCIAS_MATRICULA).join(", ")}).`}
              >
                <input
                  type="text"
                  name="matricula"
                  value={formData.matricula}
                  onChange={(e) => mudar("matricula", e.target.value)}
                  placeholder={MATRICULA_EXEMPLO}
                  autoCapitalize="characters"
                  className={`${INPUT} max-w-xs uppercase placeholder:normal-case`}
                />
              </Campo>

              <div>
                <p className="mb-1.5 text-sm font-medium text-gray-800">
                  {ehAcidente ? "Fotografia ou vídeo do acidente" : "Vídeo da infração"}
                  {ehAcidente && <span className="ml-1.5 font-normal text-gray-500">(opcional)</span>}
                </p>

                {!videoFile ? (
                  <label
                    htmlFor="video-upload"
                    className={`flex cursor-pointer flex-col items-center rounded-md border border-dashed px-6 py-8 text-center transition-colors hover:border-blue-600 hover:bg-blue-50 ${
                      fieldErrors.ficheiro ? "border-rose-400" : "border-gray-400"
                    }`}
                  >
                    <input
                      type="file"
                      id="video-upload"
                      accept={ehAcidente ? ".mp4,.avi,.mov,.jpg,.jpeg,.png" : ".mp4,.avi,.mov"}
                      onChange={handleVideoUpload}
                      className="sr-only"
                    />
                    <Upload className="mb-3 text-blue-600" size={22} />
                    <span className="text-sm font-medium text-gray-900">Escolher o ficheiro</span>
                    <span className="mt-1 text-xs text-gray-500">
                      MP4, AVI ou MOV{ehAcidente && ", JPG ou PNG"}, até {VIDEO_MAX_SIZE_MB} MB
                    </span>
                  </label>
                ) : (
                  <div className="rounded-md border border-gray-300 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">{videoFile.name}</p>
                        <p className="text-xs text-gray-500">{(videoFile.size / 1024 / 1024).toFixed(1)} MB</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveVideo}
                        className={ICON_BUTTON_DANGER}
                        aria-label="Remover o ficheiro"
                        title="Remover o ficheiro"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {videoPreview && (ehImagem ? (
                      <img src={videoPreview} alt="Pré-visualização" className="mt-3 max-h-80 w-full rounded bg-gray-900 object-contain" />
                    ) : (
                      <video src={videoPreview} controls className="mt-3 max-h-80 w-full rounded bg-gray-900" />
                    ))}
                  </div>
                )}
                {fieldErrors.ficheiro && <p className="mt-1.5 text-xs font-medium text-rose-600">{fieldErrors.ficheiro}</p>}
              </div>

              <Campo rotulo="Descrição" opcional erro={fieldErrors.descricao} ajuda="O que se vê no vídeo e que ajude o agente a decidir.">
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={(e) => mudar("descricao", e.target.value)}
                  rows={4}
                  className={TEXTAREA}
                />
              </Campo>
            </div>
          )}

          {passo === 2 && (
            <div className="space-y-6">
              <div>
                <p className="mb-1.5 text-sm font-medium text-gray-800">Onde aconteceu</p>
                <LocationPicker
                  initialLat={local?.lat}
                  initialLng={local?.lng}
                  onChange={(lat, lng, endereco) => {
                    setLocal({ lat, lng, endereco: endereco || `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
                    setFieldErrors((prev) => ({ ...prev, mapa: undefined }));
                  }}
                />
                {fieldErrors.mapa && <p className="mt-1.5 text-xs font-medium text-rose-600">{fieldErrors.mapa}</p>}
              </div>

              <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                <h2 className="mb-3 text-sm font-semibold text-gray-900">Confirme antes de enviar</h2>
                <Dados
                  itens={[
                    { rotulo: "Tipo", valor: labelTipo(formData.tipoInfracao) + (ehContramao ? ` (sentido permitido: ${formData.sentidoPermitido.toLowerCase()})` : "") },
                    { rotulo: "Matrícula", valor: formData.matricula.trim().toUpperCase() || "Não indicada" },
                    { rotulo: ehAcidente ? "Fotografia ou vídeo" : "Vídeo", valor: videoFile?.name ?? "Sem ficheiro" },
                    { rotulo: "Local", valor: local?.endereco ?? "Por marcar no mapa" },
                  ]}
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-5">
            {passo === 0 ? (
              <button type="button" onClick={() => navigate("/cidadao/dashboard")} disabled={isLoading} className={BUTTON_SECONDARY}>
                Cancelar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setFieldErrors({}); setPasso((p) => p - 1); }}
                disabled={isLoading || showSuccess}
                className={BUTTON_SECONDARY}
              >
                <ArrowLeft size={12} />
                Voltar
              </button>
            )}

            {passo < PASSOS.length - 1 ? (
              <button type="submit" className={BUTTON_PRIMARY}>
                Continuar
                <ArrowRight size={12} />
              </button>
            ) : (
              <button type="submit" disabled={isLoading || showSuccess} className={BUTTON_PRIMARY}>
                {isLoading && <Loader2 size={14} className="animate-spin" />}
                {isLoading ? "A enviar…" : "Enviar denúncia"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
