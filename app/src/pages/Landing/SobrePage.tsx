import { Users, ShieldCheck, Building2, Settings2, Target, Eye, Scale, Lock } from "lucide-react";
import {
  SECTION, SOFT_CARD, Chip, SectionHeading, PageHero, CallToAction,
} from "../../components/public/publicUi";

const PERFIS = [
  {
    icon: Users,
    titulo: "Cidadão",
    texto: "Regista-se, envia denúncias com vídeo e local, e acompanha o estado de cada uma até à decisão.",
  },
  {
    icon: ShieldCheck,
    titulo: "Agente de trânsito",
    texto: "Revê as denúncias confirmadas da jurisdição do seu posto e aprova-as ou arquiva-as com justificação.",
  },
  {
    icon: Building2,
    titulo: "Administrador do posto",
    texto: "Gere os agentes do posto e designa um agente para cada acidente reportado na sua jurisdição.",
  },
  {
    icon: Settings2,
    titulo: "Administração do sistema",
    texto: "Define os postos e as suas jurisdições, e acompanha a actividade de todo o sistema através de relatórios.",
  },
];

const PRINCIPIOS = [
  {
    icon: Target,
    titulo: "Cada denúncia no posto certo",
    texto: "O local marcado no mapa determina o posto policial responsável. Cada posto responde pela sua jurisdição.",
  },
  {
    icon: Eye,
    titulo: "Transparência para o cidadão",
    texto: "Quem denuncia é informado em cada passo: recepção, análise, revisão e decisão final.",
  },
  {
    icon: Scale,
    titulo: "A decisão é sempre humana",
    texto: "A análise automática filtra e confirma; a aprovação de uma denúncia é sempre de um agente de trânsito.",
  },
  {
    icon: Lock,
    titulo: "Respeito por quem denuncia",
    texto: "O nome dos cidadãos nunca aparece no ranking de participação: cada um é identificado por um código anónimo.",
  },
];

// Apresentação pública do sistema: o que é, quem o usa e os princípios.
export default function SobrePage() {
  return (
    <>
      <PageHero
        etiqueta="Sobre nós"
        titulo="Cidadãos e polícia de trânsito, no mesmo sistema"
        texto="O SGDIT — Sistema de Gestão de Denúncias de Infrações de Trânsito — liga quem presencia uma infração a quem tem competência para a tratar."
      />

      <section className={SECTION}>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <SectionHeading titulo="O que é o SGDIT" />
          <div className="space-y-4 text-gray-600">
            <p>
              É uma plataforma onde qualquer cidadão pode denunciar infrações de trânsito com um vídeo
              gravado no telemóvel e a indicação do local onde aconteceram.
            </p>
            <p>
              Cada vídeo é analisado automaticamente para confirmar a infração. As denúncias confirmadas
              são encaminhadas para o posto policial cuja jurisdição cobre o local, onde um agente de
              trânsito as revê e decide.
            </p>
            <p>
              Os acidentes de viação seguem um caminho mais curto: são comunicados de imediato ao posto
              da zona, que designa um agente para o local.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50/70">
        <div className={SECTION}>
          <SectionHeading titulo="Quem usa o sistema" texto="Quatro perfis, cada um com o seu papel. Todos entram pelo mesmo ecrã de login." />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PERFIS.map((p) => (
              <div key={p.titulo} className={SOFT_CARD}>
                <Chip icon={p.icon} />
                <h3 className="mt-4 text-base font-semibold text-gray-900">{p.titulo}</h3>
                <p className="mt-1.5 text-sm text-gray-600">{p.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={SECTION}>
        <SectionHeading titulo="Os nossos princípios" texto="O que orienta a forma como o sistema trata cada denúncia." />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {PRINCIPIOS.map((p) => (
            <div key={p.titulo} className={`${SOFT_CARD} flex gap-5`}>
              <Chip icon={p.icon} />
              <div>
                <h3 className="text-base font-semibold text-gray-900">{p.titulo}</h3>
                <p className="mt-1.5 text-sm text-gray-600">{p.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CallToAction />
    </>
  );
}
