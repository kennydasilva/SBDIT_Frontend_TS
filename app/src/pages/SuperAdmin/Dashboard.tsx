import { useEffect, useState } from "react";
import { Users, Shield, UserCircle, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router";
import api from "../../api/axios";
import type { PaginatedResponse } from "../../api/types";
import type { DenunciaDetalhada } from "../../api/denunciaService";
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
  const [loading, setLoading] = useState(true);
  const [contagens, setContagens] = useState({ admins: 0, policiais: 0, cidadaos: 0, denuncias: 0 });
  const [recentes, setRecentes] = useState<DenunciaDetalhada[]>([]);

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    try {
      setLoading(true);

      const [admins, pts, cidadaos, denuncias] = await Promise.all([
        api.get<PaginatedResponse<unknown>>("/admins/?page_size=1"),
        api.get<PaginatedResponse<unknown>>("/pts/?page_size=1"),
        api.get<PaginatedResponse<unknown>>("/cidadao/lista/?page_size=1"),
        api.get<PaginatedResponse<unknown>>("/denuncias/?page_size=5&ordering=-data_registo"),
      ]);

      setContagens({
        admins: admins.data.count,
        policiais: pts.data.count,
        cidadaos: cidadaos.data.count,
        denuncias: denuncias.data.count,
      });
      setRecentes(denuncias.data.results as DenunciaDetalhada[]);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Administradores", value: contagens.admins, icon: Users, bg: "bg-blue-50", fg: "text-blue-600" },
    { label: "Policiais", value: contagens.policiais, icon: Shield, bg: "bg-indigo-50", fg: "text-indigo-600" },
    { label: "Cidadãos", value: contagens.cidadaos, icon: UserCircle, bg: "bg-purple-50", fg: "text-purple-600" },
    { label: "Denúncias", value: contagens.denuncias, icon: AlertTriangle, bg: "bg-orange-50", fg: "text-orange-600" },
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
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral do sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`${CARD} p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-semibold text-gray-900 mt-1.5">{stat.value.toLocaleString()}</p>
                </div>
                <div className={`${stat.bg} ${stat.fg} p-3 rounded-xl`}>
                  <Icon size={22} strokeWidth={1.75} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Denuncias Recentes */}
      <div className={CARD}>
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-base font-semibold text-gray-900">Denúncias Recentes</h2>
          <Link
            to="/super-admin/denuncias"
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
                <th className={TABLE_HEAD_CELL}>Localização</th>
                <th className={TABLE_HEAD_CELL}>Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-400">
                    Ainda não há denúncias registadas.
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
