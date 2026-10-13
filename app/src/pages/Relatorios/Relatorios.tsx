import { useEffect, useState } from "react";





import { FileDown, FileSpreadsheet, BarChart3, PieChart as PieChartIcon, Loader2, Building2, Users, Siren, ShieldCheck, RotateCcw, CheckCircle2, Clock, FileText } from "../../components/icons";




import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";





import PageHeader from "../../components/app/PageHeader";
import StatStrip from "../../components/app/StatStrip";
import { ErroBloco } from "../../components/app/Lista";





import { useAuth } from "../../hooks/useAuth";





import { relatorioService, type FiltrosRelatorio, type RelatorioResumo } from "../../api/relatorioService";





import { ESTADO_LABEL, TIPO_LABEL } from "../../utils/estadoDenuncia";





import { mostrarErro } from "../../utils/mensagens";





import { PAGE, CARD, SECTION_TITLE, INPUT, LABEL, BUTTON_PRIMARY, BUTTON_SECONDARY, TABLE_HEAD_CELL, TABLE_ROW_HOVER } from "../../utils/uiClasses";



// As mesmas cores de estado das etiquetas (utils/estadoDenuncia.ts).
const ESTADO_COR: Record<string, string> = {
  PENDENTE: "#F59E0B",
  DUVIDOSA: "#FCD34D",
  ENCAMINHADA: "#38BDF8",
  VALIDADA: "#0284C7",
  APROVADA: "#059669",
  EM_ATENDIMENTO: "#34D399",
  REJEITADA: "#E11D48",
  ARQUIVADA: "#8EA0D7",
};

const MESES_ABREV = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const formatarMes = (mesIso: string) => {
  const [ano, mes] = mesIso.split("-");
  return `${MESES_ABREV[Number(mes) - 1]}/${ano.slice(2)}`;
};

const formatarHoras = (horas: number | null) => {
  if (horas === null) return "—";
  if (horas < 24) return `${horas.toFixed(1)} h`;
  return `${(horas / 24).toFixed(1)} dias`;
};

const formatarMinutos = (min: number | null) => {
  if (min === null) return "—";
  return min < 60 ? `${Math.round(min)} min` : formatarHoras(min / 60);
};

function Seccao({ titulo, children }: { icon: typeof BarChart3; titulo: string; children: React.ReactNode }) {
  return (
    <div className={`${CARD} p-6`}>
      <h2 className={`${SECTION_TITLE} mb-4`}>{titulo}</h2>
      {children}
    </div>
  );
}

// Partilhada: o Super Admin vê tudo e pode filtrar por posto; o Admin vê
// sempre só o seu posto (o backend impõe isso, aqui só se esconde o filtro).
export default function Relatorios() {
  const { user } = useAuth();
  const ehSuperAdmin = user?.role === "SUPER_ADMIN";

  const [filtros, setFiltros] = useState<FiltrosRelatorio>({});
  const [postos, setPostos] = useState<{ id: number; posto: string }[]>([]);
  const [resumo, setResumo] = useState<RelatorioResumo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aExportar, setAExportar] = useState<"excel" | "pdf" | null>(null);

  useEffect(() => {
    if (ehSuperAdmin) {
      relatorioService.listarPostos().then(setPostos).catch(() => setPostos([]));
    }
  }, [ehSuperAdmin]);

  useEffect(() => {
    if (!user) return;
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filtros]);

  const carregar = async () => {
    try {
      setLoading(true);
      setError(null);
      setResumo(await relatorioService.obterResumo(filtros));
    } catch {
      setError("Erro ao carregar os relatórios.");
    } finally {
      setLoading(false);
    }
  };

  const mudarFiltro = (campo: keyof FiltrosRelatorio, valor: string) =>
    setFiltros((f) => ({ ...f, [campo]: valor || undefined }));

  const exportar = async (formato: "excel" | "pdf") => {
    try {
      setAExportar(formato);
      await relatorioService.exportar(formato, filtros);
    } catch (err) {
      mostrarErro(err, "Erro ao gerar o ficheiro");
    } finally {
      setAExportar(null);
    }
  };

  const temFiltros = Object.values(filtros).some(Boolean);

  const porMes = resumo?.por_mes.map((m) => ({ mes: formatarMes(m.mes), total: m.total })) ?? [];
  const porEstado = Object.entries(resumo?.por_estado ?? {})
    .filter(([, total]) => total > 0)
    .map(([estado, total]) => ({ name: ESTADO_LABEL[estado] ?? estado, value: total, color: ESTADO_COR[estado] ?? "#8EA0D7" }));
  const porTipo = Object.entries(resumo?.por_tipo_infracao ?? {})
    .filter(([, total]) => total > 0)
    .map(([tipo, total]) => ({ tipo: TIPO_LABEL[tipo] ?? tipo, total }));

  return (
    <div className={PAGE}>
      <PageHeader
        titulo="Relatórios"
        texto={ehSuperAdmin ? "As denúncias de todos os postos. Os filtros aplicam-se ao ecrã e aos ficheiros exportados." : "As denúncias da jurisdição do seu posto. Os filtros aplicam-se ao ecrã e aos ficheiros exportados."}
        acoes={
          <>
          <button className={BUTTON_SECONDARY} onClick={() => exportar("pdf")} disabled={!!aExportar}>
            {aExportar === "pdf" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown size={14} />}
            Exportar PDF
          </button>
          <button className={BUTTON_PRIMARY} onClick={() => exportar("excel")} disabled={!!aExportar}>
            {aExportar === "excel" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet size={14} />}
            Exportar Excel
          </button>
          </>
        }
      />

      {/* Filtros: aplicam-se ao ecrã e às exportações */}
      <div className={`${CARD} p-4 mb-6`}>
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${ehSuperAdmin ? "lg:grid-cols-5" : "lg:grid-cols-4"} gap-4`}>
          <div>
            <label className={LABEL}>De</label>
            <input type="date" className={INPUT} value={filtros.data_inicio ?? ""} max={filtros.data_fim}
              onChange={(e) => mudarFiltro("data_inicio", e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Até</label>
            <input type="date" className={INPUT} value={filtros.data_fim ?? ""} min={filtros.data_inicio}
              onChange={(e) => mudarFiltro("data_fim", e.target.value)} />
          </div>
          {ehSuperAdmin && (
            <div>
              <label className={LABEL}>Posto</label>
              <select className={INPUT} value={filtros.admin_id ?? ""} onChange={(e) => mudarFiltro("admin_id", e.target.value)}>
                <option value="">Todos os postos</option>
                {postos.map((p) => <option key={p.id} value={String(p.id)}>{p.posto}</option>)}
                <option value="sem_posto">Sem posto (fora das jurisdições)</option>
              </select>
            </div>
          )}
          <div>
            <label className={LABEL}>Tipo de infração</label>
            <select className={INPUT} value={filtros.tipo ?? ""} onChange={(e) => mudarFiltro("tipo", e.target.value)}>
              <option value="">Todos</option>
              {Object.entries(TIPO_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL}>Estado</label>
            <select className={INPUT} value={filtros.estado ?? ""} onChange={(e) => mudarFiltro("estado", e.target.value)}>
              <option value="">Todos</option>
              {Object.entries(ESTADO_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>
        {temFiltros && (
          <button onClick={() => setFiltros({})} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline">
            <RotateCcw size={14} /> Limpar filtros
          </button>
        )}
      </div>

      {loading && !resumo ? (
        <div className="space-y-6" role="status" aria-label="A carregar">
          <div className="h-20 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-72 animate-pulse rounded-lg bg-gray-200" />
        </div>
      ) : error || !resumo ? (
        <div className={CARD}>
          <ErroBloco mensagem={error ?? "Erro ao carregar o relatório"} onTentar={carregar} />
        </div>
      ) : (
        <div className={`space-y-6 transition-opacity ${loading ? "opacity-50" : ""}`}>
          <StatStrip
            itens={[
              { icon: FileText, rotulo: "Total de denúncias", valor: resumo.total_denuncias },
              { icon: CheckCircle2, rotulo: "Taxa de resolução",
                valor: `${resumo.taxa_resolucao}%`,
                nota: "Denúncias que já tiveram resposta",
              },
              { icon: Clock, rotulo: "Tempo médio de resposta",
                valor: formatarHoras(resumo.tempo_medio_resposta_horas),
                nota: "Da criação até à última decisão",
              },
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Seccao icon={BarChart3} titulo="Denúncias por mês">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={porMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DAE0F2" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#1E40AF" name="Denúncias" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Seccao>

            <Seccao icon={PieChartIcon} titulo="Denúncias por estado">
              {porEstado.length === 0 ? (
                <p className="text-center text-gray-500 py-16">Sem denúncias para estes filtros</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={porEstado} cx="50%" cy="50%" outerRadius={90} dataKey="value" stroke="#fff">
                      {porEstado.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip />
                    {/* Legenda em vez de rótulos sobre o gráfico: os rótulos
                        saíam cortados e, nos tons claros, ilegíveis. */}
                    <Legend
                      formatter={(nome, entrada) => (
                        <span className="text-sm text-gray-700">
                          {nome}: {(entrada.payload as { value?: number } | undefined)?.value ?? 0}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Seccao>
          </div>

          <Seccao icon={BarChart3} titulo="Denúncias por tipo de infração">
            {porTipo.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Sem denúncias para estes filtros</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={porTipo} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#DAE0F2" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <YAxis dataKey="tipo" type="category" width={150} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#1E40AF" name="Denúncias" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Seccao>

          {ehSuperAdmin && (
            <Seccao icon={Building2} titulo="Por posto">
              <Tabela
                cabecalho={["Posto", "Denúncias", "Aprovadas", "Acidentes", "Taxa de resolução", "Tempo médio de resposta"]}
                linhas={resumo.por_posto.map((p) => [
                  p.posto, p.total, p.aprovadas, p.acidentes, `${p.taxa_resolucao}%`, formatarHoras(p.tempo_medio_resposta_horas),
                ])}
              />
            </Seccao>
          )}

          <Seccao icon={Users} titulo="Desempenho dos agentes">
            <Tabela
              cabecalho={["Agente", "N.º", ...(ehSuperAdmin ? ["Posto"] : []), "Decisões", "Aprovadas", "Arquivadas", "Tempo médio até decidir"]}
              linhas={resumo.agentes.map((g) => [
                g.nome, g.numero_agente, ...(ehSuperAdmin ? [g.posto ?? "—"] : []),
                g.decisoes, g.aprovadas, g.arquivadas, formatarHoras(g.tempo_medio_decisao_horas),
              ])}
              vazio="Nenhum agente decidiu denúncias com estes filtros"
            />
            <p className="text-xs text-gray-500 mt-3">
              O tempo até decidir só é medido nas decisões registadas a partir desta versão.
            </p>
          </Seccao>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Seccao icon={Siren} titulo="Acidentes">
              <dl className="grid gap-x-8 sm:grid-cols-2">
                <MiniIndicador titulo="Acidentes" valor={resumo.acidentes.total} />
                <MiniIndicador titulo="Tempo médio até designar" valor={formatarMinutos(resumo.acidentes.tempo_medio_ate_designar_min)} />
                <MiniIndicador titulo="À espera de agente" valor={resumo.acidentes.a_aguardar_agente} destaque={resumo.acidentes.a_aguardar_agente > 0} />
                <MiniIndicador titulo="Com agente designado" valor={resumo.acidentes.com_agente} />
                <MiniIndicador titulo="Fora das jurisdições" valor={resumo.acidentes.sem_posto} />
                <MiniIndicador titulo="Reportes repetidos juntados" valor={resumo.acidentes.reportes_juntados} />
              </dl>
            </Seccao>

            <Seccao icon={ShieldCheck} titulo="Qualidade das denúncias">
              <dl className="grid gap-x-8 sm:grid-cols-2">
                <MiniIndicador titulo="Rejeitadas pela análise" valor={resumo.qualidade.rejeitadas_ia} />
                <MiniIndicador titulo="Taxa de rejeição automática" valor={`${resumo.qualidade.taxa_rejeicao_ia}%`} />
                <MiniIndicador titulo="Vídeo ilegível" valor={resumo.qualidade.video_ilegivel} />
                <MiniIndicador titulo="Testemunhas (mesma infração)" valor={resumo.qualidade.testemunhas} />
                <MiniIndicador titulo="Vídeos semelhantes" valor={resumo.qualidade.videos_semelhantes} />
                <MiniIndicador titulo="Possíveis falsas" valor={resumo.qualidade.possiveis_falsas} destaque={resumo.qualidade.possiveis_falsas > 0} />
              </dl>
            </Seccao>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniIndicador({ titulo, valor, destaque }: { titulo: string; valor: string | number; destaque?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-gray-200 py-2.5">
      <dt className="text-sm text-gray-600">{titulo}</dt>
      <dd className={`text-sm font-semibold tabular-nums ${destaque ? "rounded bg-blue-600 px-1.5 text-white" : "text-gray-900"}`}>{valor}</dd>
    </div>
  );
}

function Tabela({ cabecalho, linhas, vazio = "Sem dados para estes filtros" }: {
  cabecalho: string[];
  linhas: (string | number)[][];
  vazio?: string;
}) {
  return (
    <div className="overflow-x-auto -mx-6">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {cabecalho.map((c) => <th key={c} className={TABLE_HEAD_CELL}>{c}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {linhas.length === 0 ? (
            <tr><td colSpan={cabecalho.length} className="px-6 py-8 text-center text-sm text-gray-500">{vazio}</td></tr>
          ) : (
            linhas.map((linha, i) => (
              <tr key={i} className={TABLE_ROW_HOVER}>
                {linha.map((v, j) => (
                  <td key={j} className={`px-6 py-3 text-sm ${j === 0 ? "font-medium text-gray-900" : "text-gray-600"}`}>{v}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
