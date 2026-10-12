import {
  UserPlus, ListChecks, CreditCard, Video, MapPin, Send, Clock, ScanSearch, ShieldCheck, Archive,
  XCircle, Building2, UserCheck, SearchCheck, Camera, Navigation, Copy, FileWarning,
} from "lucide-react";
import {
  SECTION, SOFT_CARD, Chip, SectionHeading, PageHero, CallToAction,
} from "../../components/public/publicUi";
import { TIPOS_OCORRENCIA } from "./conteudo";

const PASSOS = [
  {
    icon: UserPlus,
    titulo: "Crie a sua conta de cidadão",
    texto: "Registe-se com o nome, email, telemóvel e uma senha. Depois entre no sistema com o email e a senha.",
  },
  {
    icon: ListChecks,
    titulo: "Escolha o tipo de ocorrência",
    texto: "Contramão, veículo parado, excesso de velocidade ou acidente de viação. Na contramão, indique também o sentido permitido da via.",
  },
  {
    icon: CreditCard,
    titulo: "Indique a matrícula",
    texto: "No formato AB-12-CD. É obrigatória em todas as denúncias, excepto no acidente de viação, em que pode não a saber.",
  },
  {
    icon: Video,
    titulo: "Anexe o vídeo",
    texto: "Formatos MP4, AVI ou MOV, até 100 MB. Num acidente o ficheiro é opcional e pode ser uma fotografia (JPG ou PNG).",
  },
  {
    icon: MapPin,
    titulo: "Marque o local no mapa",
    texto: "Pesquise a rua ou toque no mapa, e arraste o marcador para o ponto exacto. A sua posição actual só serve para centrar o mapa.",
  },
  {
    icon: Send,
    titulo: "Descreva e envie",
    texto: "Acrescente uma breve descrição do que aconteceu e envie. Recebe logo a confirmação de que a denúncia foi registada.",
  },
];

const ESTADOS = [
  { icon: Clock, titulo: "Pendente", texto: "A denúncia foi recebida e o vídeo está à espera da análise automática." },
  { icon: ScanSearch, titulo: "Validada", texto: "A análise automática confirmou a infração. A denúncia está em revisão por um agente." },
  { icon: SearchCheck, titulo: "Em verificação", texto: "A denúncia precisa de uma verificação adicional por um agente antes de avançar." },
  { icon: ShieldCheck, titulo: "Aprovada", texto: "Um agente de trânsito reviu e aprovou a denúncia, indicando o código legal aplicado." },
  { icon: Archive, titulo: "Arquivada", texto: "Um agente reviu a denúncia e arquivou-a sem seguimento, com a justificação." },
  { icon: XCircle, titulo: "Rejeitada", texto: "A análise automática não detectou a infração no vídeo, ou o vídeo não pôde ser analisado." },
  { icon: Building2, titulo: "Enviada ao posto", texto: "Só para acidentes: o posto policial responsável pela zona foi avisado." },
  { icon: UserCheck, titulo: "Agente designado", texto: "Só para acidentes: o posto designou um agente para o local." },
];

const CONSELHOS = [
  {
    icon: Camera,
    titulo: "Vídeo nítido e estável",
    texto: "Filme com boa luz, com a matrícula legível e o veículo visível durante toda a infração.",
  },
  {
    icon: Navigation,
    titulo: "O local onde aconteceu",
    texto: "Marque no mapa o sítio da infração, não o sítio onde está quando envia a denúncia.",
  },
  {
    icon: Copy,
    titulo: "Uma denúncia por ocorrência",
    texto: "Enquanto a sua denúncia estiver aberta, não precisa de a repetir. Denúncias da mesma infração são ligadas entre si.",
  },
  {
    icon: FileWarning,
    titulo: "Vídeos verdadeiros",
    texto: "O mesmo vídeo usado noutra denúncia é reconhecido, e é verificado por um agente se for declarado noutro local.",
  },
];

// Guia público: como se faz uma denúncia, que ocorrências o sistema
// trata e o que significa cada estado.
export default function GuiaPage() {
  return (
    <>
      <PageHero
        etiqueta="Guia"
        titulo="Como fazer uma denúncia"
        texto="Tudo o que precisa de saber antes de enviar: os passos, os tipos de ocorrência que o sistema trata e o que acontece depois."
      />

      <section className={SECTION}>
        <SectionHeading titulo="Passo a passo" texto="Do registo ao envio, em seis passos." />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
      </section>

      <section className="bg-gray-50/70">
        <div className={SECTION}>
          <SectionHeading
            titulo="Tipos de ocorrência tratados"
            texto="O sistema trata quatro tipos. Três são confirmados por análise automática do vídeo; o acidente segue directamente para o posto."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {TIPOS_OCORRENCIA.map((t) => (
              <div key={t.titulo} className={`${SOFT_CARD} flex gap-5`}>
                <Chip icon={t.icon} />
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{t.titulo}</h3>
                  <p className="mt-1 text-sm font-medium text-gray-700">{t.resumo}</p>
                  <p className="mt-2 text-sm text-gray-600">{t.detalhe}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={SECTION}>
        <SectionHeading
          titulo="Depois de enviar: os estados da denúncia"
          texto="Recebe uma notificação sempre que o estado muda. Pode também consultar tudo em «Minhas Denúncias»."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ESTADOS.map((e) => (
            <div key={e.titulo} className={SOFT_CARD}>
              <Chip icon={e.icon} />
              <h3 className="mt-4 text-base font-semibold text-gray-900">{e.titulo}</h3>
              <p className="mt-1.5 text-sm text-gray-600">{e.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50/70">
        <div className={SECTION}>
          <SectionHeading titulo="Para a sua denúncia ser aceite" texto="Quatro cuidados que fazem a diferença." />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CONSELHOS.map((c) => (
              <div key={c.titulo} className={SOFT_CARD}>
                <Chip icon={c.icon} />
                <h3 className="mt-4 text-base font-semibold text-gray-900">{c.titulo}</h3>
                <p className="mt-1.5 text-sm text-gray-600">{c.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="pt-16 lg:pt-20">
        <CallToAction />
      </div>
    </>
  );
}
