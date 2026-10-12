import { Link } from "react-router-dom";
import {
  CONTAINER, TEXT_LINK, PANEL, SectionTitle, Linhas, PageHeader, Fecho,
} from "../../components/public/publicUi";
import { TIPOS_OCORRENCIA } from "./conteudo";

const SECCOES = [
  { id: "passos", texto: "Passo a passo" },
  { id: "tipos", texto: "Tipos de ocorrência" },
  { id: "estados", texto: "Estados da denúncia" },
  { id: "cuidados", texto: "Para a denúncia ser aceite" },
];

const PASSOS = [
  {
    titulo: "Crie a sua conta de cidadão",
    texto: "Regista-se com o nome, o email, o telemóvel e uma senha. Depois entra no sistema com o email e a senha.",
  },
  {
    titulo: "Escolha o tipo de ocorrência",
    texto: "Contramão, veículo parado, excesso de velocidade ou acidente de viação. Na contramão indica também o sentido permitido da via.",
  },
  {
    titulo: "Indique a matrícula",
    texto: "No formato ABC 123 MC: três letras, três algarismos e a sigla da província (MC, MP, GZ, IB, SF, MN, TT, ZB, NP, NS ou CA). É obrigatória em todas as denúncias, excepto no acidente de viação.",
  },
  {
    titulo: "Anexe o vídeo",
    texto: "MP4, AVI ou MOV, até 100 MB. Num acidente o ficheiro é opcional e pode ser uma fotografia (JPG ou PNG).",
  },
  {
    titulo: "Marque o local no mapa",
    texto: "Pesquisa a rua ou toca no mapa, e arrasta o marcador para o ponto exacto. A sua posição actual só serve para centrar o mapa.",
  },
  {
    titulo: "Descreva e envie",
    texto: "Acrescenta uma breve descrição do que aconteceu e envia. Recebe logo a confirmação de que a denúncia foi registada.",
  },
];

const ESTADOS = [
  { titulo: "Pendente", texto: "A denúncia foi recebida e o vídeo está à espera da análise automática." },
  { titulo: "Validada", texto: "A análise automática confirmou a infração. A denúncia está em revisão por um agente." },
  { titulo: "Em verificação", texto: "A denúncia precisa de uma verificação adicional por um agente antes de avançar." },
  { titulo: "Aprovada", texto: "Um agente de trânsito reviu e aprovou a denúncia, e indicou o código legal aplicado." },
  { titulo: "Arquivada", texto: "Um agente reviu a denúncia e arquivou-a sem seguimento, com a justificação." },
  { titulo: "Rejeitada", texto: "A análise automática não detectou a infração no vídeo, ou o vídeo não pôde ser analisado." },
  { titulo: "Enviada ao posto", texto: "Só em acidentes: o posto policial responsável pela zona foi avisado." },
  { titulo: "Agente designado", texto: "Só em acidentes: o posto designou um agente para o local." },
];

const CUIDADOS = [
  {
    titulo: "Vídeo nítido e estável",
    texto: "Filme com boa luz, com a matrícula legível e o veículo visível durante toda a infração.",
  },
  {
    titulo: "O local onde aconteceu",
    texto: "Marque no mapa o sítio da infração, e não o sítio onde está quando envia a denúncia.",
  },
  {
    titulo: "Uma denúncia por ocorrência",
    texto: "Enquanto a sua denúncia estiver aberta não precisa de a repetir. Denúncias da mesma infração são ligadas entre si.",
  },
  {
    titulo: "Vídeos verdadeiros",
    texto: "Um vídeo já usado noutra denúncia é reconhecido, e é verificado por um agente se for declarado noutro local.",
  },
];

// Guia público: como se faz uma denúncia, que ocorrências o sistema
// trata e o que significa cada estado.
export default function GuiaPage() {
  return (
    <>
      <PageHeader
        titulo="Guia: como fazer uma denúncia"
        texto="Os passos, os tipos de ocorrência que o sistema trata e o que acontece depois de enviar."
      />

      <div className={`${CONTAINER} grid gap-10 py-14 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12`}>
        <nav className={`${PANEL} h-fit p-5 lg:sticky lg:top-28`}>
          <p className="text-sm font-bold text-[#1E40AF]">Nesta página</p>
          <ul className="mt-3 space-y-2 text-sm">
            {SECCOES.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-[#1E40AF] hover:underline">{s.texto}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-14">
          <section>
            <SectionTitle id="passos" titulo="Passo a passo" texto="Do registo ao envio." />
            <ol className={`${PANEL} mt-6 divide-y divide-[#1E40AF]/10 px-6`}>
              {PASSOS.map((p, i) => (
                <li key={p.titulo} className="flex gap-5 py-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1E40AF] text-sm font-bold text-white">{i + 1}</span>
                  <div>
                    <h3 className="font-semibold text-[#1E40AF]">{p.titulo}</h3>
                    <p className="mt-1 text-[#1E40AF]/80">{p.texto}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <SectionTitle
              id="tipos"
              titulo="Tipos de ocorrência"
              texto="O sistema trata quatro tipos. Três são confirmados por análise automática do vídeo; o acidente segue directamente para o posto."
            />
            <Linhas
              itens={TIPOS_OCORRENCIA.map((t) => ({
                titulo: t.titulo,
                texto: (
                  <>
                    <span className="block text-[#1E40AF]">{t.resumo}</span>
                    <span className="mt-1 block">{t.detalhe}</span>
                  </>
                ),
              }))}
            />
          </section>

          <section>
            <SectionTitle
              id="estados"
              titulo="Estados da denúncia"
              texto="Recebe uma notificação sempre que o estado muda. Pode consultar tudo em «Minhas Denúncias»."
            />
            <Linhas itens={ESTADOS} />
          </section>

          <section>
            <SectionTitle id="cuidados" titulo="Para a denúncia ser aceite" />
            <Linhas itens={CUIDADOS} />
            <p className="mt-6 text-[#1E40AF]/80">
              Tem dúvidas sobre o sistema? Veja a página{" "}
              <Link to="/sobre" className={TEXT_LINK}>Sobre nós</Link>.
            </p>
          </section>
        </div>
      </div>

      <Fecho />
    </>
  );
}
