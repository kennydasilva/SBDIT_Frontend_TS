import { useEffect, useState } from "react";
import { Search, MapPin, Calendar, AlertTriangle, Loader2 } from "lucide-react";
import { superAdminService } from "../../api/superAdminService";
import type { DenunciaDetalhada } from "../../api/denunciaService";

const ESTADOS = ["Todos", "PENDENTE", "VALIDADA", "APROVADA", "REJEITADA", "ARQUIVADA"] as const;

const ESTADO_LABEL: Record<string, string> = {
  PENDENTE: "Pendente",
  VALIDADA: "Validada",
  APROVADA: "Aprovada",
  REJEITADA: "Rejeitada",
  ARQUIVADA: "Arquivada",
};

export default function Denuncias() {
  const [denuncias, setDenuncias] = useState<DenunciaDetalhada[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("Todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarDenuncias();
  }, []);

  const carregarDenuncias = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await superAdminService.listarDenuncias();
      setDenuncias(data);
    } catch (err) {
      setError("Erro ao carregar denúncias.");
    } finally {
      setLoading(false);
    }
  };

  const filteredDenuncias = denuncias.filter(denuncia => {
    const matchesSearch =
      denuncia.matricula?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      denuncia.localizacao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "Todos" || denuncia.estado === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "PENDENTE": return "bg-yellow-100 text-yellow-800";
      case "VALIDADA": return "bg-blue-100 text-blue-800";
      case "APROVADA": return "bg-green-100 text-green-800";
      case "REJEITADA": return "bg-red-100 text-red-800";
      case "ARQUIVADA": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const statusCount = {
    Pendente: denuncias.filter(d => d.estado === "PENDENTE").length,
    Validada: denuncias.filter(d => d.estado === "VALIDADA").length,
    Aprovada: denuncias.filter(d => d.estado === "APROVADA").length,
    Rejeitada: denuncias.filter(d => d.estado === "REJEITADA").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={carregarDenuncias}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Denúncias</h1>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(statusCount).map(([status, count]) => (
          <div key={status} className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">{status}</p>
            <p className="text-2xl font-bold text-gray-900">{count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por matrícula ou localização..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ESTADOS.map(estado => (
              <option key={estado} value={estado}>
                {estado === "Todos" ? "Todos os Status" : ESTADO_LABEL[estado]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Denuncias List */}
      <div className="space-y-4">
        {filteredDenuncias.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Nenhuma denúncia encontrada
          </div>
        ) : (
          filteredDenuncias.map((denuncia) => (
            <div key={denuncia.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {denuncia.matricula} — {denuncia.tipo_infracao}
                  </h3>
                  <p className="text-gray-600 mb-3">{denuncia.descricao}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(denuncia.estado)}`}>
                  {ESTADO_LABEL[denuncia.estado] || denuncia.estado}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  <span>{denuncia.localizacao}</span>
                </div>
                {denuncia.data_captura && (
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>{denuncia.data_captura}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
