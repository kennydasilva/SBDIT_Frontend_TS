import { Link } from "react-router-dom";
import {
  ArrowRight, Video, MapPin, BellRing, ScanSearch, Building2, ShieldCheck, CheckCircle2, LogIn,
} from "lucide-react";
import {
  CONTAINER, SECTION, SOFT_CARD, BTN_PRIMARY, BTN_SOFT, Chip, Eyebrow, SectionHeading, CallToAction,
} from "../../components/public/publicUi";
import { TIPOS_OCORRENCIA } from "./conteudo";

const PASSOS = [
  {
    icon: Video,
    titulo: "Grave e envie o vídeo",
    texto: "Filme a infração com o telemóvel e indique a matrícula e o tipo de ocorrência.",
  },
  {
    icon: MapPin,
    titulo: "Marque o local no mapa",
    texto: "Pesquise a rua ou toque no mapa. É o local que decide qual o posto policial responsável.",
  },
  {
    icon: BellRing,
    titulo: "Acompanhe a decisão",
    texto: "Recebe uma notificação sempre que a sua denúncia muda de estado, até à decisão do agente.",
  },
];

const GARANTIAS = [
  {
    icon: ScanSearch,
    titulo: "Análise automática do vídeo",
    texto: "Cada vídeo é analisado automaticamente antes de chegar a um agente, para confirmar a infração.",
  },
  {
    icon: Building2,
    titulo: "Encaminhada ao posto certo",
    texto: "A denúncia segue para os agentes do posto cuja jurisdição cobre o local que marcou.",
  },
  {
    icon: ShieldCheck,
    titulo: "Decisão de um agente de trânsito",
    texto: "As denúncias confirmadas são revistas por um agente, que as aprova ou arquiva com justificação.",
  },
];

const PERCURSO = [
  { texto: "Denúncia recebida", feito: true },
  { texto: "Vídeo analisado automaticamente", feito: true },
  { texto: "Em revisão por um agente", feito: true },
  { texto: "Decisão comunicada", feito: false },
];

// Página pública de entrada: apresenta o sistema e leva o cidadão ao
// registo, ou qualquer utilizador (cidadão, agente, Admin) ao login.
export default function LandingPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-blue-50/80 via-gray-50 to-white">
        <div className={`${CONTAINER} grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24`}>
          <div>
            <Eyebrow>Denúncias de trânsito feitas pelo cidadão</Eyebrow>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl">
              Viu uma infração de trânsito?{" "}
              <span className="text-[#1E40AF]">Denuncie em poucos minutos.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-gray-600">
              Envie o vídeo, marque o local no mapa e o SGDIT encaminha a sua denúncia para o posto
              policial responsável pela zona. Acompanha tudo até à decisão.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/cadastrar" className={BTN_PRIMARY}>
                Faça a sua primeira denúncia
                <ArrowRight size={17} />
              </Link>
              <Link to="/login" className={BTN_SOFT}>
                <LogIn size={17} />
                Entrar no sistema
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              O registo é gratuito e só para cidadãos. Agentes e administradores entram com a conta do posto.
            </p>
          </div>

          {/* Ilustração: o percurso de uma denúncia */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-blue-100/40 blur-2xl" />
            <div className="relative rounded-3xl border border-gray-100 bg-white p-7 shadow-[0_24px_60px_-24px_rgba(30,64,175,0.35)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Exemplo de denúncia</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">Contramão</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-[#1E40AF]">
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                  Em revisão
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={16} className="shrink-0 text-gray-400" />
                Av. Julius Nyerere, Maputo
              </div>

              <ol className="mt-6 space-y-4">
                {PERCURSO.map((p, i) => (
                  <li key={p.texto} className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        p.feito ? "bg-[#1E40AF] text-white" : "border border-gray-200 bg-white text-gray-400"
                      }`}
                    >
                      {p.feito ? <CheckCircle2 size={15} /> : i + 1}
                    </span>
                    <span className={`text-sm ${p.feito ? "font-medium text-gray-900" : "text-gray-400"}`}>
                      {p.texto}
                    </span>
                  </li>
                ))}
              </ol>

              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-blue-50/60 p-4">
                <span className="rounded-xl bg-white p-2 text-[#1E40AF] shadow-sm">
                  <BellRing size={16} />
                </span>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">Notificação:</span> a análise automática confirmou
                  a infração. A denúncia está agora em revisão por um agente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={SECTION}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            titulo="O que pode denunciar"
            texto="Quatro tipos de ocorrência, cada um com o tratamento adequado."
          />
          <Link to="/guia" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1E40AF] hover:underline">
            Ver o guia completo
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TIPOS_OCORRENCIA.map((t) => (
            <div key={t.titulo} className={SOFT_CARD}>
              <Chip icon={t.icon} />
              <h3 className="mt-4 text-base font-semibold text-gray-900">{t.titulo}</h3>
              <p className="mt-1.5 text-sm text-gray-600">{t.resumo}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50/70">
        <div className={SECTION}>
          <SectionHeading titulo="Como funciona" texto="Três passos, do telemóvel ao posto policial." />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {PASSOS.map((p, i) => (
              <div key={p.titulo} className={SOFT_CARD}>
                <div className="flex items-center justify-between">
                  <Chip icon={p.icon} />
                  <span className="text-4xl font-bold text-blue-100">0{i + 1}</span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900">{p.titulo}</h3>
                <p className="mt-1.5 text-sm text-gray-600">{p.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={SECTION}>
        <SectionHeading titulo="O que acontece à sua denúncia" texto="Do envio à decisão, sabe sempre em que ponto está." />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {GARANTIAS.map((g) => (
            <div key={g.titulo} className={SOFT_CARD}>
              <Chip icon={g.icon} />
              <h3 className="mt-4 text-base font-semibold text-gray-900">{g.titulo}</h3>
              <p className="mt-1.5 text-sm text-gray-600">{g.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <CallToAction />
    </>
  );
}
