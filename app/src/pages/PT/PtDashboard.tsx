import { useEffect, useState } from "react";
import { Link } from "react-router";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowRight, AlertTriangle, CheckCircle2, Archive, Clock, Gavel, Siren, MapPin } from "../../components/icons";
import { useAuth } from "../../hooks/useAuth";
import { denunciaService, type DenunciaDetalhada } from "../../api/denunciaService";
import PageHeader from "../../components/app/PageHeader";
import StatStrip from "../../components/app/StatStrip";
import Destaque, { BOTAO_SOBRE_AZUL } from "../../components/app/Destaque";
import EstadoBadge from "../../components/app/EstadoBadge";
import EmptyState from "../../components/app/EmptyState";
import { PaginaEsqueleto } from "../../components/app/Carregando";
import { labelTipo } from "../../utils/estadoDenuncia";
import { formatarDataHora } from "../../utils/datas";
import {
  PAGE, CARD, CARD_HEADER, CARD_TITLE, BADGE, LINK,
  TABLE_HEAD_CELL, TABLE_CELL, TABLE_CELL_STRONG, TABLE_ROW_HOVER,
} from "../../utils/uiClasses";

// Quantas denúncias da fila mostrar aqui (as restantes estão em "Denúncias").
const NA_FILA = 3;

export default function DashboardPt() {
  const { user, loading: authLoading } = useAuth();
  const [fila, setFila] = useState<DenunciaDetalhada[]>([]);
  const [totalFila, setTotalFila] = useState(0);
  const [decididas, setDecididas] = useState<DenunciaDetalhada[]>([]);
  const [totalDecididas, setTotalDecididas] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      carregarDenuncias();
    }
  }, [authLoading, user]);

  const carregarDenuncias = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const validadas = await denunciaService.listarValidadas();
      setFila(validadas.results);
      setTotalFila(validadas.count);

      const minhas = await denunciaService.listarPorPt(user.id, 1, 100);
      setDecididas(minhas.results);
      setTotalDecididas(minhas.count);
    } catch (err) {
      console.error("Erro ao carregar denúncias:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PaginaEsqueleto />;

  // Acidentes para que o Admin do posto designou este agente: não são
  // decisões, por isso ficam fora das contagens e têm lugar próprio.
  const acidentes = decididas.filter((d) => d.tipo_infracao === "ACIDENTE");
  const acidentesAbertos = acidentes.filter((d) => d.estado === "EM_ATENDIMENTO");

  const aprovadas = decididas.filter((d) => d.estado === "APROVADA").length;
  const arquivadas = decididas.filter((d) => d.estado === "ARQUIVADA").length;

  const porTipo = ["CONTRAMAO", "PARADO", "VELOCIDADE"].map((tipo) => ({
    tipo: labelTipo(tipo),
    quantidade: decididas.filter((d) => d.tipo_infracao === tipo).length,
  }));

  const proxima = fila[0];

  return (
    <div className={PAGE}>
      <PageHeader titulo="Painel do agente" texto="As denúncias da jurisdição do seu posto que aguardam a sua decisão." />

      {acidentesAbertos.length > 0 && (
        <section className="mb-6 rounded-2xl bg-blue-600 p-6 text-white shadow-lg shadow-blue-600/25 sm:px-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-blue-800">
              <Siren size={20} />
            </span>
            <div className="min-w-0">
              <h2 className="text-xl font-bold leading-snug">
                {acidentesAbertos.length === 1
                  ? "Foi designado para 1 acidente"
                  : `Foi designado para ${acidentesAbertos.length} acidentes`}
              </h2>
              <p className="mt-1 text-sm text-blue-100">Abra o acidente para ver o local no mapa e o caminho para lá.</p>
            </div>
          </div>
          <ul className="mt-5 space-y-3">
            {acidentesAbertos.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/10 p-4">
                <span className="flex min-w-0 items-start gap-3">
                  <MapPin size={16} className="mt-0.5 shrink-0" />
                  <span className="min-w-0">
                    <span className="block break-words text-sm font-semibold">{a.localizacao || "Local por descrever"}</span>
                    <span className="block text-xs text-blue-100">
                      Acidente #{a.id} · reportado em {formatarDataHora(a.data_registo || a.data_captura)}
                    </span>
                  </span>
                </span>
                <Link to={`/pt/denuncias/${a.id}`} className={BOTAO_SOBRE_AZUL}>
                  Ver o local
                  <ArrowRight size={14} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {proxima ? (
        <Destaque
          titulo={totalFila === 1 ? "1 denúncia à espera da sua decisão" : `${totalFila} denúncias à espera da sua decisão`}
          texto="Foram confirmadas pela análise automática do vídeo. Veja o vídeo e aprove ou arquive, com justificação."
          acao={
            <Link to={`/pt/denuncias/${proxima.id}`} className={BOTAO_SOBRE_AZUL}>
              Analisar a próxima
              <ArrowRight size={14} />
            </Link>
          }
        />
      ) : (
        <div className={`${CARD} mb-6`}>
          <EmptyState
            icon={CheckCircle2}
            titulo="Não há denúncias à espera"
            texto="Quando uma denúncia da sua jurisdição for confirmada pela análise do vídeo, aparece aqui e recebe uma notificação."
          />
        </div>
      )}

      <StatStrip
        className="mb-6"
        itens={[
          { icon: Clock, rotulo: "À espera de decisão", valor: totalFila, para: "/pt/denuncias" },
          { icon: Gavel, rotulo: "Decididas por mim", valor: Math.max(0, totalDecididas - acidentes.length), para: "/pt/minhas-decisoes" },
          { icon: CheckCircle2, rotulo: "Aprovadas", valor: aprovadas },
          { icon: Archive, rotulo: "Arquivadas", valor: arquivadas },
        ]}
      />

      {proxima && (
        <section className={`${CARD} mb-6 overflow-hidden`}>
          <div className={CARD_HEADER}>
            <h2 className={CARD_TITLE}>Próximas na fila</h2>
            <Link to="/pt/denuncias" className={`${LINK} inline-flex items-center gap-1.5 text-sm`}>
              Ver toda a fila
              <ArrowRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className={TABLE_HEAD_CELL}>Matrícula</th>
                  <th className={TABLE_HEAD_CELL}>Tipo</th>
                  <th className={TABLE_HEAD_CELL}>Data</th>
                  <th className={TABLE_HEAD_CELL}>Confiança</th>
                  <th className={TABLE_HEAD_CELL}>Estado</th>
                  <th className={TABLE_HEAD_CELL}><span className="sr-only">Abrir</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {fila.slice(0, NA_FILA).map((d) => (
                  <tr key={d.id} className={TABLE_ROW_HOVER}>
                    <td className={TABLE_CELL_STRONG}>
                      <span className="flex flex-wrap items-center gap-2">
                        {d.matricula || "—"}
                        {d.localizacao_contraditoria && (
                          <span className={`${BADGE} bg-blue-600 text-white`}>
                            <AlertTriangle size={10} /> possível falsa
                          </span>
                        )}
                      </span>
                    </td>
                    <td className={TABLE_CELL}>{labelTipo(d.tipo_infracao)}</td>
                    <td className={`${TABLE_CELL} whitespace-nowrap`}>{formatarDataHora(d.data_captura || d.data_registo)}</td>
                    <td className={TABLE_CELL}>{d.confianca != null ? `${Math.round(d.confianca * 100)}%` : "—"}</td>
                    <td className={TABLE_CELL}><EstadoBadge estado={d.estado} tipo={d.tipo_infracao} /></td>
                    <td className={`${TABLE_CELL} text-right`}>
                      <Link to={`/pt/denuncias/${d.id}`} className={LINK}>Analisar</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* O gráfico só aparece quando há decisões para mostrar. */}
      {decididas.length > 0 && (
        <section className={`${CARD} p-6`}>
          <h2 className={CARD_TITLE}>As minhas decisões por tipo de infração</h2>
          <div className="mt-5">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={porTipo}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DAE0F2" vertical={false} />
                <XAxis dataKey="tipo" tick={{ fontSize: 12, fill: "#405DBB" }} axisLine={{ stroke: "#DAE0F2" }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#405DBB" }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
                <Tooltip cursor={{ fill: "#F6F7FC" }} contentStyle={{ borderRadius: 6, border: "1px solid #DAE0F2", fontSize: 13 }} />
                <Bar dataKey="quantidade" name="Decisões" fill="#1E40AF" radius={[3, 3, 0, 0]} maxBarSize={72} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </div>
  );
}
