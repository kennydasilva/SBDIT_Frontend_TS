import { useRef, useState } from "react";




import { useNavigate } from "react-router";




import {
  Upload, X, CheckCircle, Loader2, ArrowLeft, ArrowRight, ArrowLeftRight, Ban, Gauge, Siren, Video, MapPin, FileText,
} from "../../components/icons";




import { denunciaService } from "../../api/denunciaService";




import { useAuth } from "../../hooks/useAuth";




import { REGEX, MATRICULA_EXEMPLO, MATRICULA_INVALIDA, PROVINCIAS_MATRICULA } from "../../utils/validationSchemas";




import LocationPicker from "../../components/LocationPicker";
import PageHeader from "../../components/app/PageHeader";
import Campo from "../../components/app/Campo";
import { labelTipo } from "../../utils/estadoDenuncia";




import { PAGE, INPUT, TEXTAREA, BUTTON_PRIMARY, BUTTON_SECONDARY, ICON_BUTTON_DANGER } from "../../utils/uiClasses";

import { mostrarAviso, mostrarErro } from "../../utils/mensagens";





// O que o cidadão pode denunciar, com o que cada tipo exige dele.
const TIPOS = [
  { valor: "CONTRAMAO", icon: ArrowLeftRight, texto: "Veículo a circular no sentido contrário ao da via." },
  { valor: "PARADO", icon: Ban, texto: "Paragem ou estacionamento em local proibido. O vídeo deve mostrar o veículo parado pelo menos 10 segundos." },
  { valor: "VELOCIDADE", icon: Gauge, texto: "Condução acima do limite da via. Filme com o telemóvel o mais parado possível." },
  { valor: "ACIDENTE", icon: Siren, texto: "Segue de imediato para o posto policial da zona. A matrícula e o ficheiro são opcionais." },
];

// Quadrado azul com ícone branco, como nas páginas públicas.
const ICONE = "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white";
const BOTAO = "!h-11 !rounded-xl !px-6";
const CARTAO = "rounded-2xl bg-white shadow-lg shadow-blue-600/10 ring-1 ring-blue-600/10";

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

  // O que já foi preenchido: mostrado no painel lateral em todos os passos.
  const resumo = [
    {
      icon: TIPOS.find((t) => t.valor === formData.tipoInfracao)?.icon ?? FileText,
      rotulo: "Tipo de ocorrência",
      valor: formData.tipoInfracao
        ? labelTipo(formData.tipoInfracao) + (ehContramao && formData.sentidoPermitido ? `, sentido permitido: ${formData.sentidoPermitido.toLowerCase()}` : "")
        : null,
      vazio: "Por escolher",
    },
    {
      icon: FileText,
      rotulo: "Matrícula",
      valor: formData.matricula.trim().toUpperCase() || null,
      vazio: ehAcidente ? "Não indicada (opcional)" : "Por indicar",
    },
    {
      icon: Video,
      rotulo: ehAcidente ? "Fotografia ou vídeo" : "Vídeo",
      valor: videoFile?.name ?? null,
      vazio: ehAcidente ? "Sem ficheiro (opcional)" : "Por escolher",
    },
    { icon: MapPin, rotulo: "Local", valor: local?.endereco ?? null, vazio: "Por marcar no mapa" },
  ];

  return (
    <div className={PAGE}>
      <PageHeader
        titulo="Criar denúncia"
        texto="Três passos: o que aconteceu, o veículo e a prova, e o local."
      />

      <div>
        {/* Progresso */}
        <ol className={`${CARTAO} mb-5 flex items-center px-5 py-4 sm:px-8`} aria-label="Passos da denúncia">
          {PASSOS.map((nome, i) => {
            const feito = i < passo;
            const atual = i === passo;
            return (
              <li key={nome} aria-current={atual ? "step" : undefined} className="flex flex-1 items-center last:flex-none">
                <button
                  type="button"
                  onClick={() => feito && !isLoading && !showSuccess && setPasso(i)}
                  disabled={!feito || isLoading || showSuccess}
                  className={`flex items-center gap-3 text-left ${feito ? "" : "!cursor-default"}`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                      atual
                        ? "bg-blue-600 text-white ring-4 ring-blue-600/15"
                        : feito
                          ? "bg-blue-600 text-white"
                          : "bg-blue-50 text-blue-800"
                    }`}
                  >
                    {feito ? <CheckCircle size={16} /> : i + 1}
                  </span>
                  <span className="hidden sm:block">
                    <span className="block text-xs text-gray-500">Passo {i + 1}</span>
                    <span className={`block text-sm font-semibold ${atual || feito ? "text-blue-800" : "text-gray-500"}`}>
                      {nome}
                    </span>
                  </span>
                </button>
                {i < PASSOS.length - 1 && (
                  <span className={`mx-3 h-0.5 flex-1 rounded-full sm:mx-5 ${feito ? "bg-blue-600" : "bg-blue-100"}`} aria-hidden />
                )}
              </li>
            );
          })}
        </ol>
        <p className="mb-3 text-sm font-semibold text-blue-800 sm:hidden">
          Passo {passo + 1} de {PASSOS.length}: {PASSOS[passo]}
        </p>

        {showSuccess && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl bg-blue-600 p-5 text-sm text-white" role="status">
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

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <form onSubmit={handleSubmit} noValidate className={`${CARTAO} p-6 sm:p-8`}>
          {passo === 0 && (
            <div className="space-y-6">
              <fieldset>
                <legend className="text-lg font-bold text-blue-800">O que quer denunciar?</legend>
                <p className="mt-1 text-sm text-gray-600">Escolha o tipo de ocorrência. Cada um pede coisas diferentes.</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {TIPOS.map((t) => {
                    const escolhido = formData.tipoInfracao === t.valor;
                    return (
                      <label
                        key={t.valor}
                        className={`relative flex cursor-pointer gap-4 rounded-2xl p-4 transition-all ${
                          escolhido
                            ? "bg-blue-50 ring-2 ring-blue-600"
                            : "bg-white ring-1 ring-gray-200 hover:ring-blue-300 hover:shadow-md hover:shadow-blue-600/10"
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
                          className="peer sr-only"
                        />
                        <span className={ICONE}>
                          <t.icon size={20} />
                        </span>
                        <span className="min-w-0 pr-6">
                          <span className="block font-semibold text-gray-900">{labelTipo(t.valor)}</span>
                          <span className="mt-0.5 block text-sm text-gray-600">{t.texto}</span>
                        </span>
                        {escolhido && <CheckCircle size={20} className="absolute right-4 top-4 text-blue-600" />}
                        <span className="pointer-events-none absolute inset-0 rounded-2xl peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-600" />
                      </label>
                    );
                  })}
                </div>
                {fieldErrors.tipo && <p className="mt-1.5 text-xs font-medium text-rose-600">{fieldErrors.tipo}</p>}
              </fieldset>

              {ehContramao && (
                <fieldset className="rounded-2xl bg-blue-50 p-5">
                  <legend className="float-left w-full text-base font-bold text-blue-800">Sentido permitido da via</legend>
                  <p className="clear-both pt-1 text-sm text-gray-600">
                    Visto no vídeo: para que lado devem circular os veículos nessa via.
                  </p>
                  <div className="mt-4 grid max-w-sm grid-cols-2 gap-3">
                    {["Esquerda", "Direita"].map((sentido) => {
                      const escolhido = formData.sentidoPermitido === sentido;
                      return (
                        <label
                          key={sentido}
                          className={`flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue-600 ${
                            escolhido ? "bg-blue-600 text-white" : "bg-white text-blue-800 ring-1 ring-blue-200 hover:ring-blue-600"
                          }`}
                        >
                          <input
                            type="radio"
                            name="sentidoPermitido"
                            value={sentido}
                            checked={escolhido}
                            onChange={() => mudar("sentidoPermitido", sentido)}
                            className="sr-only"
                          />
                          {sentido === "Esquerda" ? <ArrowLeft size={14} /> : null}
                          {sentido}
                          {sentido === "Direita" ? <ArrowRight size={14} /> : null}
                        </label>
                      );
                    })}
                  </div>
                  {fieldErrors.sentido && <p className="mt-1.5 text-xs font-medium text-rose-600">{fieldErrors.sentido}</p>}
                </fieldset>
              )}

              {ehAcidente && (
                <p className="flex gap-4 rounded-2xl bg-blue-600 p-5 text-sm text-white">
                  <Siren size={22} className="mt-0.5 shrink-0" />
                  <span>O acidente é enviado directamente, por SMS, ao posto policial responsável pela zona
                  marcada no mapa, que designa um agente para o local. Não passa por análise de vídeo.</span>
                </p>
              )}
            </div>
          )}

          {passo === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-blue-800">O veículo e a prova</h2>
                <p className="mt-1 text-sm text-gray-600">
                  {ehAcidente ? "Num acidente, a matrícula e o ficheiro são opcionais." : "A matrícula e o vídeo são obrigatórios."}
                </p>
              </div>
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
                    className={`flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed bg-blue-50/60 px-6 py-10 text-center transition-colors hover:border-blue-600 hover:bg-blue-50 ${
                      fieldErrors.ficheiro ? "border-rose-400" : "border-blue-300"
                    }`}
                  >
                    <input
                      type="file"
                      id="video-upload"
                      accept={ehAcidente ? ".mp4,.avi,.mov,.jpg,.jpeg,.png" : ".mp4,.avi,.mov"}
                      onChange={handleVideoUpload}
                      className="sr-only"
                    />
                    <span className={`${ICONE} mb-4`}>
                      {ehAcidente ? <Upload size={20} /> : <Video size={20} />}
                    </span>
                    <span className="font-semibold text-blue-800">Escolher o ficheiro</span>
                    <span className="mt-1 text-xs text-gray-500">
                      MP4, AVI ou MOV{ehAcidente && ", JPG ou PNG"}, até {VIDEO_MAX_SIZE_MB} MB
                    </span>
                  </label>
                ) : (
                  <div className="rounded-2xl bg-blue-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className={ICONE}><Video size={20} /></span>
                      <div className="min-w-0 flex-1">
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
                      <img src={videoPreview} alt="Pré-visualização" className="mt-4 max-h-80 w-full rounded-xl bg-gray-900 object-contain" />
                    ) : (
                      <video src={videoPreview} controls className="mt-4 max-h-80 w-full rounded-xl bg-gray-900" />
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
                <h2 className="text-lg font-bold text-blue-800">Onde aconteceu</h2>
                <p className="mb-4 mt-1 text-sm text-gray-600">
                  Pesquise a rua ou clique no mapa. É pelo local que se encontra o posto policial responsável.
                </p>
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

              {/* No telemóvel o resumo fica aqui; em ecrãs largos está sempre no painel lateral. */}
              <div className="rounded-2xl bg-blue-50 p-5 lg:hidden">
                <h2 className="text-base font-bold text-blue-800">Confirme antes de enviar</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {resumo.map((r) => (
                    <li key={r.rotulo} className="flex min-w-0 items-start gap-3 rounded-xl bg-white p-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                        <r.icon size={15} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs text-gray-500">{r.rotulo}</span>
                        <span className="block break-words text-sm font-semibold text-gray-900">{r.valor ?? r.vazio}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-blue-100 pt-6">
            {passo === 0 ? (
              <button type="button" onClick={() => navigate("/cidadao/dashboard")} disabled={isLoading} className={`${BUTTON_SECONDARY} ${BOTAO}`}>
                Cancelar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setFieldErrors({}); setPasso((p) => p - 1); }}
                disabled={isLoading || showSuccess}
                className={`${BUTTON_SECONDARY} ${BOTAO}`}
              >
                <ArrowLeft size={12} />
                Voltar
              </button>
            )}

            {passo < PASSOS.length - 1 ? (
              <button type="submit" className={`${BUTTON_PRIMARY} ${BOTAO}`}>
                Continuar
                <ArrowRight size={12} />
              </button>
            ) : (
              <button type="submit" disabled={isLoading || showSuccess} className={`${BUTTON_PRIMARY} ${BOTAO}`}>
                {isLoading && <Loader2 size={14} className="animate-spin" />}
                {isLoading ? "A enviar…" : "Enviar denúncia"}
              </button>
            )}
          </div>
        </form>

        {/* Painel lateral: o resumo a preencher-se e o que é preciso */}
        <aside className="hidden space-y-5 lg:sticky lg:top-6 lg:block">
          <section className="rounded-2xl bg-blue-600 p-6 text-white shadow-lg shadow-blue-600/25">
            <h2 className="text-lg font-bold">A sua denúncia</h2>
            <p className="mt-1 text-sm text-blue-100">Vai-se preenchendo à medida que avança.</p>
            <ul className="mt-5 space-y-3">
              {resumo.map((r) => (
                <li key={r.rotulo} className="flex min-w-0 items-start gap-3 rounded-xl bg-white/10 p-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      r.valor ? "bg-white text-blue-800" : "bg-white/15 text-white"
                    }`}
                  >
                    <r.icon size={15} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-blue-100">{r.rotulo}</span>
                    <span className={`block break-words text-sm ${r.valor ? "font-semibold text-white" : "text-blue-100"}`}>
                      {r.valor ?? r.vazio}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className={`${CARTAO} p-6`}>
            <h2 className="text-base font-bold text-blue-800">Para denunciar precisa de</h2>
            <ul className="mt-3 divide-y divide-blue-100">
              {[
                { t: "Um vídeo da infração", d: `MP4, AVI ou MOV, até ${VIDEO_MAX_SIZE_MB} MB.` },
                { t: "A matrícula do veículo", d: `No formato ${MATRICULA_EXEMPLO.replace(/^Ex:\s*/, "")}.` },
                { t: "O local onde aconteceu", d: "Marca-o no mapa, no último passo." },
              ].map((x) => (
                <li key={x.t} className="py-3">
                  <p className="text-sm font-semibold text-gray-900">{x.t}</p>
                  <p className="text-sm text-gray-600">{x.d}</p>
                </li>
              ))}
            </ul>
            <p className="border-t border-blue-100 pt-3 text-sm text-gray-600">
              Num acidente de viação basta o local.
            </p>
          </section>
        </aside>
        </div>
      </div>
    </div>
  );
}
