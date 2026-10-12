import { CONTAINER, SectionTitle, Linhas, PageHeader, Fecho } from "../../components/public/publicUi";

const PERFIS = [
  {
    titulo: "Cidadão",
    texto: "Regista-se, envia denúncias com vídeo e local, e acompanha o estado de cada uma até à decisão.",
  },
  {
    titulo: "Agente de trânsito",
    texto: "Revê as denúncias confirmadas da jurisdição do seu posto e aprova-as ou arquiva-as, com justificação.",
  },
  {
    titulo: "Administrador do posto",
    texto: "Gere os agentes do posto e designa um agente para cada acidente reportado na sua jurisdição.",
  },
  {
    titulo: "Administração do sistema",
    texto: "Define os postos e as suas jurisdições, e acompanha a actividade do sistema através de relatórios.",
  },
];

const PRINCIPIOS = [
  {
    titulo: "Cada denúncia no posto certo",
    texto: "O local marcado no mapa determina o posto policial responsável. Cada posto responde pela sua jurisdição.",
  },
  {
    titulo: "O cidadão é sempre informado",
    texto: "Quem denuncia é avisado em cada passo: recepção, análise, revisão e decisão final.",
  },
  {
    titulo: "A decisão é de um agente",
    texto: "A análise automática filtra e confirma. A aprovação de uma denúncia é sempre de um agente de trânsito.",
  },
  {
    titulo: "Respeito por quem denuncia",
    texto: "O nome dos cidadãos nunca aparece no ranking de participação: cada um é identificado por um código anónimo.",
  },
];

// Apresentação pública do sistema: o que é, quem o usa e os princípios.
export default function SobrePage() {
  return (
    <>
      <PageHeader
        titulo="Sobre o SGDIT"
        texto="O Sistema de Gestão de Denúncias de Infrações de Trânsito liga quem presencia uma infração a quem tem competência para a tratar."
      />

      <div className={`${CONTAINER} space-y-14 py-14`}>
        <section className="max-w-3xl">
          <SectionTitle titulo="O que é" />
          <div className="mt-4 space-y-4 text-gray-600">
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
        </section>

        <section>
          <SectionTitle
            titulo="Quem usa o sistema"
            texto="Quatro perfis, cada um com o seu papel. Todos entram pelo mesmo ecrã de login."
          />
          <Linhas itens={PERFIS} />
        </section>

        <section>
          <SectionTitle titulo="Princípios" />
          <Linhas itens={PRINCIPIOS} />
        </section>
      </div>

      <Fecho />
    </>
  );
}
