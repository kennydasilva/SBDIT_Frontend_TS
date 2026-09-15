import { useEffect, useState } from "react";
import { FileDown, BarChart3, PieChart as PieChartIcon, AlertTriangle, Loader2 } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { superAdminService, type RelatorioResumo } from "../../api/superAdminService";
import { CARD, BUTTON_SECONDARY, BUTTON_PRIMARY } from "../../utils/uiClasses";

const ESTADO_LABEL: Record<string, string> = {
  PENDENTE: "Pendente",
  VALIDADA: "Validada",
  APROVADA: "Aprovada",
  REJEITADA: "Rejeitada",
  ARQUIVADA: "Arquivada",
};

const ESTADO_COR: Record<string, string> = {
  PENDENTE: "#F59E0B",
  VALIDADA: "#3B82F6",
  APROVADA: "#10B981",
  REJEITADA: "#EF4444",
  ARQUIVADA: "#9CA3AF",
};

const TIPO_LABEL: Record<string, string> = {
  CONTRAMAO: "Contramão",
  PARADO: "Veículo Parado",
  VELOCIDADE: "Excesso de Velocidade",
  ACIDENTE: "Acidente de Viação",
};

const MESES_ABREV = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function formatarMes(mesIso: string) {
  const [ano, mes] = mesIso.split("-");
  return `${MESES_ABREV[Number(mes) - 1]}/${ano.slice(2)}`;
}

function formatarTempoResposta(horas: number | null) {
  if (horas === null) return "—";
  if (horas < 24) return `${horas.toFixed(1)} h`;
  return `${(horas / 24).toFixed(1)} dias`;
}

export default function Relatorios() {
  const [resumo, setResumo] = useState<RelatorioResumo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarResumo();
  }, []);

  const carregarResumo = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await superAdminService.obterResumoRelatorios();
      setResumo(data);
    } catch (err) {
      setError("Erro ao carregar relatórios.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !resumo) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <p className="text-rose-600">{error}</p>
          <button onClick={carregarResumo} className={`${BUTTON_PRIMARY} mt-4`}>
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const denunciasPorMes = resumo.por_mes.map((m) => ({ mes: formatarMes(m.mes), total: m.total }));

  const denunciasPorStatus = Object.entries(resumo.por_estado)
    .filter(([, total]) => total > 0)
    .map(([estado, total]) => ({
      name: ESTADO_LABEL[estado] ?? estado,
      value: total,
      color: ESTADO_COR[estado] ?? "#9CA3AF",
    }));

  const denunciasPorTipo = Object.entries(resumo.por_tipo_infracao)
    .filter(([, total]) => total > 0)
    .map(([tipo, total]) => ({ tipo: TIPO_LABEL[tipo] ?? tipo, total }));

  return (
    <div className="p-8 bg-gray-50/50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Relatórios</h1>
          <p className="text-gray-500 mt-1">Visão agregada de todas as denúncias do sistema</p>
        </div>
        <div className="flex gap-3">
          <button className={BUTTON_SECONDARY} disabled title="Em breve">
            <FileDown size={18} />
            Exportar PDF
          </button>
          <button className={BUTTON_PRIMARY} disabled title="Em breve">
            <FileDown size={18} />
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`${CARD} p-6`}>
          <h3 className="text-sm text-gray-500 mb-1">Total de Denúncias</h3>
          <p className="text-3xl font-semibold text-gray-900">{resumo.total_denuncias}</p>
        </div>
        <div className={`${CARD} p-6`}>
          <h3 className="text-sm text-gray-500 mb-1">Taxa de Resolução</h3>
          <p className="text-3xl font-semibold text-gray-900">{resumo.taxa_resolucao}%</p>
          <p className="text-xs text-gray-400 mt-2">Denúncias que já saíram do estado Pendente</p>
        </div>
        <div className={`${CARD} p-6`}>
          <h3 className="text-sm text-gray-500 mb-1">Tempo Médio de Resposta</h3>
          <p className="text-3xl font-semibold text-gray-900">{formatarTempoResposta(resumo.tempo_medio_resposta_horas)}</p>
          <p className="text-xs text-gray-400 mt-2">Da criação até à última decisão</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className={`${CARD} p-6`}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="text-blue-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Denúncias por Mês</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={denunciasPorMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#2563EB" name="Total de Denúncias" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className={`${CARD} p-6`}>
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="text-blue-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Denúncias por Estado</h2>
          </div>
          {denunciasPorStatus.length === 0 ? (
            <p className="text-center text-gray-500 py-16">Sem denúncias ainda</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={denunciasPorStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {denunciasPorStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Por Tipo de Infração */}
      <div className={`${CARD} p-6 mt-6`}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Denúncias por Tipo de Infração</h2>
        {denunciasPorTipo.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Sem denúncias ainda</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={denunciasPorTipo} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis dataKey="tipo" type="category" width={140} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#2563EB" name="Total" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
