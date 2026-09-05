import { useEffect, useState } from "react";
import { Shield, AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { ptService } from "../../api/ptService";
import { denunciaService, type DenunciaDetalhada } from "../../api/denunciaService";
import { CARD, BADGE, STATUS_TONES, TABLE_HEAD_CELL, TABLE_ROW_HOVER } from "../../utils/uiClasses";

const getStatusTone = (estado: string) => {
  switch (estado) {
    case "PENDENTE": return STATUS_TONES.amber;
    case "VALIDADA": return STATUS_TONES.blue;
    case "APROVADA": return STATUS_TONES.emerald;
    case "REJEITADA": return STATUS_TONES.rose;
    default: return STATUS_TONES.gray;
  }
};

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalPoliciais, setTotalPoliciais] = useState(0);
  const [recentes, setRecentes] = useState<DenunciaDetalhada[]>([]);

  useEffect(() => {
    if (!authLoading && user) {
      carregar();
    }
  }, [authLoading, user]);

  const carregar = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const pts = await ptService.listarPT(user.id);
      setTotalPoliciais(pts.length);

      const denunciasPorPt = await Promise.all(
        pts.map((pt) => denunciaService.listarPorPt(pt.id).catch(() => []))
      );

      const todas = denunciasPorPt.flat().sort((a, b) => b.id - a.id).slice(0, 5);
      setRecentes(todas);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
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

  return (
    <div className="p-8 bg-gray-50/50 min-h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral do teu posto</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className={`${CARD} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Policiais do Posto</p>
              <p className="text-3xl font-semibold text-gray-900 mt-1.5">{totalPoliciais}</p>
            </div>
            <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
              <Shield size={22} strokeWidth={1.75} />
            </div>
          </div>
        </div>

        <div className={`${CARD} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Denúncias Recentes</p>
              <p className="text-3xl font-semibold text-gray-900 mt-1.5">{recentes.length}</p>
            </div>
            <div className="bg-orange-50 text-orange-600 p-3 rounded-xl">
              <AlertTriangle size={22} strokeWidth={1.75} />
            </div>
          </div>
        </div>
      </div>

      {/* Denuncias Recentes */}
      <div className={CARD}>
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Denúncias Recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className={TABLE_HEAD_CELL}>Matrícula</th>
                <th className={TABLE_HEAD_CELL}>Tipo</th>
                <th className={TABLE_HEAD_CELL}>Localização</th>
                <th className={TABLE_HEAD_CELL}>Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-400">
                    Ainda não há denúncias registadas para os policiais do teu posto.
                  </td>
                </tr>
              ) : (
                recentes.map((d) => (
                  <tr key={d.id} className={TABLE_ROW_HOVER}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{d.matricula}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{d.tipo_infracao}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{d.localizacao}</td>
                    <td className="px-6 py-4">
                      <span className={`${BADGE} ${getStatusTone(d.estado)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                        {d.estado}
                      </span>
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
