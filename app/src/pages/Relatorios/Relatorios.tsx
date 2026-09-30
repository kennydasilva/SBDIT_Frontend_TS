import { useEffect, useState } from "react";
import {
  FileDown, FileSpreadsheet, BarChart3, PieChart as PieChartIcon, AlertTriangle, Loader2,
  Building2, Users, Siren, ShieldCheck, RotateCcw,
} from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useAuth } from "../../hooks/useAuth";
import { relatorioService, type FiltrosRelatorio, type RelatorioResumo } from "../../api/relatorioService";
import { ESTADO_LABEL, TIPO_LABEL } from "../../utils/estadoDenuncia";
import { mostrarErro } from "../../utils/mensagens";
import {
  PAGE, PAGE_TITLE, PAGE_SUBTITLE, CARD, SECTION_TITLE, INPUT, LABEL,
  BUTTON_PRIMARY, BUTTON_SECONDARY, TABLE_HEAD_CELL, TABLE_ROW_HOVER,
} from "../../utils/uiClasses";

const ESTADO_COR: Record<string, string> = {
  PENDENTE: "#F59E0B",
  VALIDADA: "#3B82F6",
  APROVADA: "#10B981",
  REJEITADA: "#EF4444",
  ARQUIVADA: "#9CA3AF",
  ENCAMINHADA: "#8B5CF6",
  EM_ATENDIMENTO: "#14B8A6",
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

function Indicador({ titulo, valor, nota }: { titulo: string; valor: string | number; nota?: string }) {
  return (
    <div className={`${CARD} p-5`}>
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-1">{valor}</p>
      {nota && <p className="text-xs text-gray-400 mt-1.5">{nota}</p>}
    </div>
  );
}

function Seccao({ icon: Icon, titulo, children }: { icon: typeof BarChart3; titulo: string; children: React.ReactNode }) {
  return (
    <div className={`${CARD} p-6`}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="text-blue-600" size={20} />
        <h2 className={SECTION_TITLE}>{titulo}</h2>
      </div>
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
    .map(([estado, total]) => ({ name: ESTADO_LABEL[estado] ?? estado, value: total, color: ESTADO_COR[estado] ?? "#9CA3AF" }));
  const porTipo = Object.entries(resumo?.por_tipo_infracao ?? {})
    .filter(([, total]) => total > 0)
    .map(([tipo, total]) => ({ tipo: TIPO_LABEL[tipo] ?? tipo, total }));

  return (
    <div className={PAGE}>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className={PAGE_TITLE}>Relatórios</h1>
          <p className={PAGE_SUBTITLE}>
            {ehSuperAdmin ? "Visão agregada das denúncias de todos os postos" : "Denúncias da jurisdição do seu posto"}
          </p>
        </div>
        <div className="flex gap-3">
          <button className={BUTTON_SECONDARY} onClick={() => exportar("pdf")} disabled={!!aExportar}>
            {aExportar === "pdf" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown size={18} />}
            Exportar PDF
          </button>
          <button className={BUTTON_PRIMARY} onClick={() => exportar("excel")} disabled={!!aExportar}>
            {aExportar === "excel" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet size={18} />}
            Exportar Excel
          </button>
        </div>
      </div>

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
          <button onClick={() => setFiltros({})} className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
            <RotateCcw size={14} /> Limpar filtros
          </button>
        )}
      </div>

      {loading && !resumo ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : error || !resumo ? (
        <div className="text-center py-20">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <p className="text-rose-600">{error}</p>
          <button onClick={carregar} className={`${BUTTON_PRIMARY} mt-4`}>Tentar novamente</button>
        </div>
      ) : (
        <div className={`space-y-6 transition-opacity ${loading ? "opacity-50" : ""}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Indicador titulo="Total de denúncias" valor={resumo.total_denuncias} />
            <Indicador titulo="Taxa de resolução" valor={`${resumo.taxa_resolucao}%`}
              nota="Denúncias que já tiveram resposta (não pendentes nem só enviadas ao posto)" />
            <Indicador titulo="Tempo médio de resposta" valor={formatarHoras(resumo.tempo_medio_resposta_horas)}
              nota="Da criação até à última decisão" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Seccao icon={BarChart3} titulo="Denúncias por mês">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={porMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#2563EB" name="Denúncias" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Seccao>

            <Seccao icon={PieChartIcon} titulo="Denúncias por estado">
              {porEstado.length === 0 ? (
                <p className="text-center text-gray-500 py-16">Sem denúncias para estes filtros</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={porEstado} cx="50%" cy="50%" labelLine={false} outerRadius={95} dataKey="value"
                      label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}>
                      {porEstado.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip />
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <YAxis dataKey="tipo" type="category" width={150} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#2563EB" name="Denúncias" radius={[0, 4, 4, 0]} />
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
            <p className="text-xs text-gray-400 mt-3">
              O tempo até decidir só é medido nas decisões registadas a partir desta versão.
            </p>
          </Seccao>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Seccao icon={Siren} titulo="Acidentes">
              <div className="grid grid-cols-2 gap-3">
                <MiniIndicador titulo="Acidentes" valor={resumo.acidentes.total} />
                <MiniIndicador titulo="Tempo médio até designar" valor={formatarMinutos(resumo.acidentes.tempo_medio_ate_designar_min)} />
                <MiniIndicador titulo="À espera de agente" valor={resumo.acidentes.a_aguardar_agente} destaque={resumo.acidentes.a_aguardar_agente > 0} />
                <MiniIndicador titulo="Com agente designado" valor={resumo.acidentes.com_agente} />
                <MiniIndicador titulo="Fora das jurisdições" valor={resumo.acidentes.sem_posto} />
                <MiniIndicador titulo="Reportes repetidos juntados" valor={resumo.acidentes.reportes_juntados} />
              </div>
            </Seccao>

            <Seccao icon={ShieldCheck} titulo="Qualidade das denúncias">
              <div className="grid grid-cols-2 gap-3">
                <MiniIndicador titulo="Rejeitadas pela análise" valor={resumo.qualidade.rejeitadas_ia} />
                <MiniIndicador titulo="Taxa de rejeição automática" valor={`${resumo.qualidade.taxa_rejeicao_ia}%`} />
                <MiniIndicador titulo="Vídeo ilegível" valor={resumo.qualidade.video_ilegivel} />
                <MiniIndicador titulo="Testemunhas (mesma infração)" valor={resumo.qualidade.testemunhas} />
                <MiniIndicador titulo="Vídeos semelhantes" valor={resumo.qualidade.videos_semelhantes} />
                <MiniIndicador titulo="Possíveis falsas" valor={resumo.qualidade.possiveis_falsas} destaque={resumo.qualidade.possiveis_falsas > 0} />
              </div>
            </Seccao>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniIndicador({ titulo, valor, destaque }: { titulo: string; valor: string | number; destaque?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${destaque ? "border-amber-100 bg-amber-50" : "border-gray-100 bg-gray-50/60"}`}>
      <p className="text-xs text-gray-500">{titulo}</p>
      <p className={`text-lg font-semibold mt-0.5 ${destaque ? "text-amber-700" : "text-gray-900"}`}>{valor}</p>
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
          <tr className="border-b border-gray-100">
            {cabecalho.map((c) => <th key={c} className={TABLE_HEAD_CELL}>{c}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
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
