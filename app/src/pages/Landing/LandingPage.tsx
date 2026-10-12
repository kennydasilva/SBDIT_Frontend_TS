import { Link } from "react-router-dom";
import { Video, MapPin, BellRing, Gavel, Send, ScanSearch } from "lucide-react";
import {
  CONTAINER, SECTION, BTN_ON_BLUE, BTN_ON_BLUE_OUTLINE, TEXT_LINK, PANEL, IconTile, SectionTitle, Fecho,
} from "../../components/public/publicUi";
import DeviceMockups from "../../components/public/DeviceMockups";
import { TIPOS_OCORRENCIA } from "./conteudo";

const PRECISA = [
  { titulo: "Um vídeo da infração", texto: "MP4, AVI ou MOV, até 100 MB." },
  { titulo: "A matrícula do veículo", texto: "No formato AB-12-CD." },
  { titulo: "O local onde aconteceu", texto: "Marca-o no mapa ao criar a denúncia." },
];

const DESTAQUES = [
  { icon: Video, titulo: "Vídeo do telemóvel", texto: "MP4, AVI ou MOV" },
  { icon: MapPin, titulo: "Local no mapa", texto: "Defina o local da ocorrência" },
  { icon: BellRing, titulo: "Notificações", texto: "A cada mudança de estado" },
  { icon: Gavel, titulo: "Decisão de um agente", texto: "Aprova ou arquiva" },
];

const NUMEROS = [
  { valor: "04", texto: "Tipos de ocorrência" },
  { valor: "03", texto: "Passos para denunciar" },
  { valor: "01", texto: "Posto responsável por zona" },
];

const PASSOS = [
  {
    icon: Send,
    titulo: "Envia a denúncia",
    texto: "Escolhe o tipo de ocorrência, indica a matrícula, anexa o vídeo e marca o local no mapa.",
  },
  {
    icon: ScanSearch,
    titulo: "O vídeo é analisado",
    texto: "A análise automática confirma se a infração aparece no vídeo. Se não aparecer, a denúncia é rejeitada e é avisado.",
  },
  {
    icon: Gavel,
    titulo: "Um agente decide",
    texto: "A denúncia confirmada segue para o posto policial da zona. Um agente de trânsito aprova-a ou arquiva-a, com justificação.",
  },
];

// Página pública de entrada: apresenta o sistema e leva o cidadão ao
// registo, ou qualquer utilizador (cidadão, agente, Admin) ao login.
export default function LandingPage() {
  return (
    <>
      {/* Topo: o essencial para começar */}
      <section className="relative bg-[#1E40AF]">
        <div className={`${CONTAINER} relative grid gap-10 pb-24 pt-32 lg:grid-cols-[3fr_2fr] lg:items-center lg:pb-28 lg:pt-40`}>
          <div>
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
              Denuncie infrações de trânsito a partir do telemóvel
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/85">
              Grave o vídeo, marque o local no mapa e envie. A denúncia chega ao posto policial
              responsável por essa zona e é avisado de cada passo, até à decisão.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/cadastrar" className={BTN_ON_BLUE}>Faça a sua primeira denúncia</Link>
              <Link to="/login" className={BTN_ON_BLUE_OUTLINE}>Entrar no sistema</Link>
            </div>
            <p className="mt-4 text-sm text-white/85">
              O registo é para cidadãos. Agentes e administradores entram com a conta do posto.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-7 shadow-2xl shadow-black/20">
            <h2 className="text-base font-bold text-[#1E40AF]">Para denunciar precisa de</h2>
            <ul className="mt-3 divide-y divide-[#1E40AF]/10">
              {PRECISA.map((p) => (
                <li key={p.titulo} className="py-3">
                  <p className="font-semibold text-[#1E40AF]">{p.titulo}</p>
                  <p className="text-sm text-[#1E40AF]/80">{p.texto}</p>
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-[#1E40AF]/10 pt-3 text-sm text-[#1E40AF]/80">
              Num acidente de viação basta o local. A matrícula e o ficheiro são opcionais.
            </p>
          </div>
        </div>
      </section>

      <div className={`${CONTAINER} relative -mt-12`}>
        <div className={`${PANEL} grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4`}>
          {DESTAQUES.map((d) => (
            <div key={d.titulo} className="flex items-center gap-4">
              <IconTile icon={d.icon} />
              <div>
                <p className="font-semibold text-[#1E40AF]">{d.titulo}</p>
                <p className="text-sm text-[#1E40AF]/80">{d.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* A aplicação */}
      <section className={SECTION}>
        <div className="grid items-center gap-14 lg:grid-cols-[6fr_5fr]">
          <DeviceMockups />
          <div>
            <SectionTitle
              titulo="Tudo num só lugar"
              texto="Cria denúncias, consulta as que já enviou e recebe as notificações na mesma conta."
            />
            <div className="mt-8 grid max-w-md grid-cols-3 overflow-hidden rounded-2xl bg-[#1E40AF] text-white">
              {NUMEROS.map((n) => (
                <div key={n.texto} className="border-l border-white/15 px-4 py-4 first:border-0">
                  <p className="text-2xl font-bold">{n.valor}</p>
                  <p className="mt-1 text-xs text-white/85">{n.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className={`${CONTAINER} pb-14 lg:pb-20`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle titulo="O que pode denunciar" texto="Quatro tipos de ocorrência tratados pelo sistema." />
          <Link to="/guia" className={TEXT_LINK}>Ver o guia completo</Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TIPOS_OCORRENCIA.map((t) => (
            <div key={t.titulo} className={`${PANEL} p-6`}>
              <IconTile icon={t.icon} />
              <h3 className="mt-4 text-lg font-bold text-[#1E40AF]">{t.titulo}</h3>
              <p className="mt-1.5 text-[#1E40AF]/80">{t.resumo}</p>
            </div>
          ))}
        </div>
        </div>
      </section>

      <section className="bg-[#1E40AF]">
        <div className={SECTION}>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white">Como funciona</h2>
            <p className="mt-3 text-white/85">Do telemóvel ao posto policial, em três passos.</p>
          </div>
          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            {PASSOS.map((p, i) => (
              <li key={p.titulo} className="text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#1E40AF]">
                  <p.icon size={26} />
                </span>
                <p className="mt-5 text-sm font-semibold text-white/85">Passo {i + 1}</p>
                <h3 className="mt-1 text-lg font-bold text-white">{p.titulo}</h3>
                <p className="mx-auto mt-2 max-w-xs text-white/85">{p.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={SECTION}>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className={`${PANEL} p-8`}>
            <h2 className="text-2xl font-bold text-[#1E40AF]">Acidentes de viação</h2>
            <p className="mt-3 text-[#1E40AF]/80">
              Um acidente não espera pela análise do vídeo. É comunicado de imediato ao posto policial
              cuja jurisdição cobre o local, e é esse posto que designa um agente para lá ir.
            </p>
            <p className="mt-3 text-[#1E40AF]/80">
              Se várias pessoas reportarem o mesmo acidente, os reportes são juntados num só.
            </p>
          </div>
          <div className={`${PANEL} p-8`}>
            <h2 className="text-2xl font-bold text-[#1E40AF]">Sabe sempre em que ponto está</h2>
            <p className="mt-3 text-[#1E40AF]/80">
              Recebe uma notificação na aplicação sempre que a sua denúncia muda de estado: quando é
              recebida, quando o vídeo é analisado e quando o agente decide.
            </p>
            <p className="mt-3 text-[#1E40AF]/80">
              O <Link to="/guia" className={TEXT_LINK}>guia</Link> explica o que significa cada estado.
            </p>
          </div>
        </div>
      </section>

      <Fecho />
    </>
  );
}
