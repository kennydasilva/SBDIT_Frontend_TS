import { CheckCircle2, Archive, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../../hooks/useAuth";
import { denunciaService, type DenunciaDetalhada } from "../../api/denunciaService";
import { CARD, BADGE, STATUS_TONES, TABLE_HEAD_CELL, TABLE_ROW_HOVER } from "../../utils/uiClasses";

const getStatusTone = (estado: string) => {
  switch (estado) {
    case "VALIDADA": return STATUS_TONES.blue;
    case "APROVADA": return STATUS_TONES.emerald;
    case "ARQUIVADA": return STATUS_TONES.gray;
    default: return STATUS_TONES.gray;
  }
};

export default function DashboardPt() {
  const { user, loading: authLoading } = useAuth();
  const [denuncias, setDenuncias] = useState<DenunciaDetalhada[]>([]);
  const [denunciasTemp, setDenunciasTemp] = useState<DenunciaDetalhada[]>([]);
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
      setDenuncias(validadas);

      const minhas = await denunciaService.listarPorPt(user.id);
      setDenunciasTemp(minhas);
    } catch (err) {
      console.error("Erro ao carregar denúncias:", err);
    } finally {
      setLoading(false);
    }
  };

  const denunciasAprovadas = denunciasTemp.filter((d) => d.estado === "APROVADA");
  const denunciasArquivadas = denunciasTemp.filter((d) => d.estado === "ARQUIVADA");

  const stats = [
    { label: "Denúncias Validadas", value: denuncias.length, icon: AlertTriangle, bg: "bg-blue-50", fg: "text-blue-600" },
    { label: "Aprovadas por mim", value: denunciasAprovadas.length, icon: CheckCircle2, bg: "bg-emerald-50", fg: "text-emerald-600" },
    { label: "Arquivadas por mim", value: denunciasArquivadas.length, icon: Archive, bg: "bg-gray-100", fg: "text-gray-600" },
  ];

  const chartData = [
    { tipo: "Contramão", quantidade: denunciasTemp.filter((d) => d.tipo_infracao === "CONTRAMAO").length },
    { tipo: "Veículo Parado", quantidade: denunciasTemp.filter((d) => d.tipo_infracao === "PARADO").length },
    { tipo: "Excesso Velocidade", quantidade: denunciasTemp.filter((d) => d.tipo_infracao === "VELOCIDADE").length },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50/50 min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-1">Bem-vindo ao painel de análise de denúncias</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`${CARD} p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-semibold text-gray-900 mt-1.5">{stat.value}</p>
                </div>
                <div className={`${stat.bg} ${stat.fg} p-3 rounded-xl`}>
                  <Icon size={22} strokeWidth={1.75} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className={`${CARD} p-6 mb-6`}>
        <h2 className="text-base font-semibold text-gray-900 mb-6">
          Infrações Analisadas por Tipo
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="tipo" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={{ stroke: "#f1f5f9" }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9" }} />
            <Bar dataKey="quantidade" fill="#2563EB" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Denuncias */}
      <div className={CARD}>
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-base font-semibold text-gray-900">
            Últimas Denúncias Validadas
          </h2>
          <Link
            to="/pt/denuncias"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Ver todas
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className={TABLE_HEAD_CELL}>Matrícula</th>
                <th className={TABLE_HEAD_CELL}>Tipo</th>
                <th className={TABLE_HEAD_CELL}>Data</th>
                <th className={TABLE_HEAD_CELL}>Confiança</th>
                <th className={TABLE_HEAD_CELL}>Estado</th>
                <th className={TABLE_HEAD_CELL}>Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {denuncias.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">
                    Não há denúncias validadas para analisar.
                  </td>
                </tr>
              ) : (
                denuncias.map((denuncia) => (
                  <tr key={denuncia.id} className={TABLE_ROW_HOVER}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {denuncia.matricula}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {denuncia.tipo_infracao}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {denuncia.data_captura}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {denuncia.confianca != null ? `${Math.round(denuncia.confianca * 100)}%` : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`${BADGE} ${getStatusTone(denuncia.estado)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                        {denuncia.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/pt/denuncias/${denuncia.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Analisar
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
