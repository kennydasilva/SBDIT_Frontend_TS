import { ArrowRight, Calendar, FileText, MapPin, Route, Siren, Users } from "../../components/icons";
import MapaLocal, { ligacoesMapa } from "../../components/MapaLocal";
import PageHeader from "../../components/app/PageHeader";
import EstadoBadge from "../../components/app/EstadoBadge";
import type { DenunciaDetalhada } from "../../api/denunciaService";
import { formatarDataHora } from "../../utils/datas";
import { PAGE, PAINEL, ICONE_AZUL, BUTTON_SECONDARY, ALERT_WARNING } from "../../utils/uiClasses";

interface AcidenteDetalheProps {
  denuncia: DenunciaDetalhada;
  voltar: { para: string; texto: string };
  /** Endereço base dos ficheiros (foto ou vídeo do acidente). */
  baseUrl: string;
}

const EH_IMAGEM = /\.(jpe?g|png|webp)$/i;

// O que o agente designado (e o Admin, em consulta) vê de um acidente: onde
// é e como lá chegar. O acidente não passa por análise de vídeo nem por
// decisão do agente, por isso não há aqui formulário de decisão.
export default function AcidenteDetalhe({ denuncia, voltar, baseUrl }: AcidenteDetalheProps) {
  const temPonto = denuncia.latitude != null && denuncia.longitude != null;
  const links = temPonto ? ligacoesMapa(Number(denuncia.latitude), Number(denuncia.longitude)) : null;
  const reportes = (denuncia.total_relacionadas ?? 0) + 1;

  const dados = [
    { icon: MapPin, rotulo: "Local", valor: denuncia.localizacao || "Sem descrição do local" },
    { icon: Calendar, rotulo: "Reportado em", valor: formatarDataHora(denuncia.data_registo || denuncia.data_captura) },
    { icon: FileText, rotulo: "Matrícula", valor: denuncia.matricula || "Não indicada" },
    ...(reportes > 1 ? [{ icon: Users, rotulo: "Reportes deste acidente", valor: `${reportes} pessoas reportaram` }] : []),
  ];

  return (
    <div className={PAGE}>
      <PageHeader
        voltar={voltar}
        titulo={
          <span className="flex flex-wrap items-center gap-3">
            Acidente #{denuncia.id}
            <EstadoBadge estado={denuncia.estado} tipo={denuncia.tipo_infracao} />
          </span>
        }
        texto="O local do acidente e o caminho para lá chegar."
      />

      <div className="grid items-start gap-5 lg:grid-cols-[22rem_minmax(0,1fr)]">
        {/* O essencial e o botão para o caminho */}
        <div className="space-y-5">
          <section className="rounded-2xl bg-blue-600 p-6 text-white shadow-lg shadow-blue-600/25">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-blue-800">
                <Siren size={20} />
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-bold">Dirija-se ao local</h2>
                <p className="mt-1 break-words text-sm text-blue-100">{denuncia.localizacao || "Veja o ponto no mapa."}</p>
              </div>
            </div>
            {links ? (
              <a
                href={links.comoChegar}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-blue-800 transition-colors hover:bg-blue-50"
              >
                <Route size={16} />
                Como chegar
                <ArrowRight size={12} />
              </a>
            ) : (
              <p className="mt-5 rounded-xl bg-white/10 p-3 text-sm text-blue-100">
                Este reporte não tem o ponto marcado no mapa. Guie-se pela descrição do local.
              </p>
            )}
          </section>

          <section className={`${PAINEL} p-6`}>
            <h2 className="text-base font-bold text-blue-800">Dados do acidente</h2>
            <ul className="mt-4 space-y-3">
              {dados.map((d) => (
                <li key={d.rotulo} className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <d.icon size={16} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-gray-500">{d.rotulo}</span>
                    <span className="block break-words text-sm font-semibold text-gray-900">{d.valor}</span>
                  </span>
                </li>
              ))}
            </ul>
            {denuncia.descricao && (
              <div className="mt-4 border-t border-blue-100 pt-4">
                <p className="text-xs text-gray-500">O que foi descrito</p>
                <p className="mt-1 break-words text-sm text-gray-800">{denuncia.descricao}</p>
              </div>
            )}
          </section>
        </div>

        {/* O mapa e a prova */}
        <div className="space-y-5">
          <section className={`${PAINEL} p-4 sm:p-5`}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-3">
                <span className={ICONE_AZUL}>
                  <MapPin size={18} />
                </span>
                <h2 className="text-lg font-bold text-blue-800">Local no mapa</h2>
              </div>
              {links && (
                <a href={links.abrir} target="_blank" rel="noreferrer" className={BUTTON_SECONDARY}>
                  Abrir no Google Maps
                </a>
              )}
            </div>
            {temPonto ? (
              <MapaLocal
                lat={Number(denuncia.latitude)}
                lng={Number(denuncia.longitude)}
                endereco={denuncia.localizacao}
                className="h-[26rem]"
              />
            ) : (
              <p className={ALERT_WARNING}>
                Quem reportou não marcou o ponto no mapa. Local indicado: {denuncia.localizacao || "sem descrição"}.
              </p>
            )}
          </section>

          {denuncia.ficheiro_original && (
            <section className={`${PAINEL} p-6`}>
              <h2 className="text-lg font-bold text-blue-800">Fotografia ou vídeo do acidente</h2>
              <div className="mt-4 overflow-hidden rounded-xl bg-gray-950">
                {EH_IMAGEM.test(denuncia.ficheiro_original) ? (
                  <img
                    src={`${baseUrl}${denuncia.ficheiro_original}`}
                    alt="Fotografia do acidente enviada por quem reportou"
                    className="mx-auto max-h-[32rem] w-auto"
                  />
                ) : (
                  <video controls className="mx-auto max-h-[32rem] w-full">
                    <source src={`${baseUrl}${denuncia.ficheiro_original}`} />
                    O seu navegador não reproduz este vídeo.
                  </video>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
