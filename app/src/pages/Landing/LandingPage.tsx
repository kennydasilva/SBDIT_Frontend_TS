import { Link } from "react-router-dom";
import {
  CONTAINER, SECTION, BTN_PRIMARY, BTN_SECONDARY, TEXT_LINK, PANEL, SectionTitle, Linhas, Fecho,
} from "../../components/public/publicUi";
import { Portatil, Telemovel } from "../../components/public/DeviceMockups";
import { TIPOS_OCORRENCIA } from "./conteudo";

const PRECISA = [
  { titulo: "Um vídeo da infração", texto: "MP4, AVI ou MOV, até 100 MB." },
  { titulo: "A matrícula do veículo", texto: "No formato ABC 123 MC." },
  { titulo: "O local onde aconteceu", texto: "Marca-o no mapa ao criar a denúncia." },
];

const PASSOS = [
  {
    titulo: "Envia a denúncia",
    texto: "Escolhe o tipo de ocorrência, indica a matrícula, anexa o vídeo e marca o local no mapa.",
  },
  {
    titulo: "O vídeo é analisado",
    texto: "A análise automática confirma se a infração aparece no vídeo. Se não aparecer, a denúncia é rejeitada e é avisado.",
  },
  {
    titulo: "Um agente decide",
    texto: "A denúncia confirmada segue para o posto policial da zona. Um agente de trânsito aprova-a ou arquiva-a, com justificação.",
  },
];

// Página pública de entrada: apresenta o sistema e leva o cidadão ao
// registo, ou qualquer utilizador (cidadão, agente, Admin) ao login.
export default function LandingPage() {
  return (
    <>
      {/* Topo: o que é, e a aplicação à vista */}
      <section className="overflow-hidden bg-[#1E40AF]/[0.06]">
        <div className={`${CONTAINER} grid items-center gap-12 pb-28 pt-32 lg:grid-cols-[5fr_6fr] lg:gap-10 lg:pb-36 lg:pt-40`}>
          <div>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-[#1E40AF] sm:text-5xl">
              Denuncie infrações de trânsito a partir do telemóvel
            </h1>
            <p className="mt-5 max-w-xl text-lg text-[#1E40AF]/85">
              Grave o vídeo, marque o local no mapa e envie. A denúncia chega ao posto policial
              responsável por essa zona e é avisado de cada passo, até à decisão.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/cadastrar" className={BTN_PRIMARY}>Faça a sua primeira denúncia</Link>
              <Link to="/login" className={BTN_SECONDARY}>Entrar no sistema</Link>
            </div>
            <p className="mt-4 text-sm text-[#1E40AF]/85">
              O registo é para cidadãos. Agentes e administradores entram com a conta do posto.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-xl pb-6 pr-6 sm:pr-10 lg:max-w-none">
            <Portatil captura="passo1" prioridade />
            <Telemovel captura="telemovel" className="absolute -bottom-4 right-0 w-[26%]" />
          </div>
        </div>
      </section>

      {/* O essencial para começar, a sobrepor o fim do topo */}
      <div className={`${CONTAINER} relative -mt-16`}>
        <div className={`${PANEL} p-6 sm:p-8`}>
          <h2 className="text-lg font-bold text-[#1E40AF]">Para denunciar precisa de</h2>
          <ul className="mt-4 grid gap-x-8 gap-y-4 border-t border-[#1E40AF]/10 pt-4 sm:grid-cols-3">
            {PRECISA.map((p) => (
              <li key={p.titulo}>
                <p className="font-semibold text-[#1E40AF]">{p.titulo}</p>
                <p className="mt-0.5 text-sm text-[#1E40AF]/85">{p.texto}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-[#1E40AF]/10 pt-4 text-sm text-[#1E40AF]/85">
            Num acidente de viação basta o local. A matrícula e o ficheiro são opcionais.
          </p>
        </div>
      </div>

      {/* Como funciona */}
      <section className={SECTION}>
        <SectionTitle titulo="Como funciona" texto="Do telemóvel ao posto policial, em três passos." />
        <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-0">
          {PASSOS.map((p, i) => (
            <li key={p.titulo} className="relative md:pr-8">
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1E40AF] text-lg font-bold text-white">
                  {i + 1}
                </span>
                {/* Linha que liga ao passo seguinte */}
                {i < PASSOS.length - 1 && <span className="hidden h-px flex-1 bg-[#1E40AF]/25 md:block" aria-hidden />}
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#1E40AF]">{p.titulo}</h3>
              <p className="mt-2 text-[#1E40AF]/85">{p.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* A aplicação, em capturas reais */}
      <section className="bg-[#1E40AF]/[0.06]">
        <div className={`${SECTION} grid items-center gap-12 lg:grid-cols-2`}>
          <div className="mx-auto w-full max-w-xl lg:max-w-none">
            <Portatil captura="passo2" />
          </div>
          <div>
            <SectionTitle
              titulo="Uma denúncia em três ecrãs"
              texto="O formulário pede uma coisa de cada vez e diz o que cada tipo de ocorrência exige."
            />
            <dl className="mt-8 divide-y divide-[#1E40AF]/15 border-y border-[#1E40AF]/15">
              {[
                { t: "Tipo de ocorrência", d: "Escolhe o que aconteceu. Na contramão indica também o sentido permitido da via." },
                { t: "Veículo e prova", d: "Escreve a matrícula e escolhe o vídeo gravado no telemóvel." },
                { t: "Local e envio", d: "Marca o local no mapa, confirma o resumo e envia." },
              ].map((x) => (
                <div key={x.t} className="py-4">
                  <dt className="font-semibold text-[#1E40AF]">{x.t}</dt>
                  <dd className="mt-1 text-[#1E40AF]/85">{x.d}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* O que pode denunciar */}
      <section className={SECTION}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle titulo="O que pode denunciar" texto="Quatro tipos de ocorrência tratados pelo sistema." />
          <Link to="/guia" className={TEXT_LINK}>Ver o guia completo</Link>
        </div>
        <Linhas itens={TIPOS_OCORRENCIA.map((t) => ({ titulo: t.titulo, texto: t.detalhe }))} />
      </section>

      {/* Acidentes e acompanhamento */}
      <section className="bg-[#1E40AF]">
        <div className={`${SECTION} grid gap-10 md:grid-cols-2 md:gap-16`}>
          <div>
            <h2 className="text-2xl font-bold text-white">Um acidente não espera pela análise</h2>
            <p className="mt-3 text-white/90">
              É comunicado de imediato ao posto policial cuja jurisdição cobre o local, e é esse posto
              que designa um agente para lá ir. Se várias pessoas reportarem o mesmo acidente, os
              reportes são juntados num só.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Sabe sempre em que ponto está</h2>
            <p className="mt-3 text-white/90">
              Recebe uma notificação na aplicação sempre que a sua denúncia muda de estado: quando é
              recebida, quando o vídeo é analisado e quando o agente decide. O{" "}
              <Link to="/guia" className="font-semibold text-white underline underline-offset-4 hover:no-underline">guia</Link>{" "}
              explica o que significa cada estado.
            </p>
          </div>
        </div>
      </section>

      <div className="pt-14 lg:pt-20">
        <Fecho />
      </div>
    </>
  );
}
