import { useState } from "react";
import { Search, MapPin, Calendar } from "lucide-react";

interface Denuncia {
  id: number;
  titulo: string;
  descricao: string;
  cidadao: string;
  localizacao: string;
  data: string;
  status: "Pendente" | "Em Análise" | "Resolvida" | "Rejeitada";
}

const mockDenuncias: Denuncia[] = [
  { id: 1, titulo: "Veículo estacionado irregularmente", descricao: "Carro bloqueando entrada de garagem", cidadao: "Lucas Ferreira", localizacao: "Rua das Flores, 123", data: "2024-03-25", status: "Pendente" },
  { id: 2, titulo: "Semáforo com defeito", descricao: "Semáforo piscando amarelo constantemente", cidadao: "Beatriz Souza", localizacao: "Av. Principal, esquina com Rua B", data: "2024-03-24", status: "Em Análise" },
  { id: 3, titulo: "Buraco na via", descricao: "Buraco grande causando acidentes", cidadao: "Rafael Santos", localizacao: "Rua do Comércio, 456", data: "2024-03-23", status: "Resolvida" },
  { id: 4, titulo: "Placa de trânsito danificada", descricao: "Placa caída no chão", cidadao: "Lucas Ferreira", localizacao: "Av. Central, 789", data: "2024-03-22", status: "Rejeitada" },
];

export default function Denuncias() {
  const [denuncias] = useState<Denuncia[]>(mockDenuncias);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");

  const filteredDenuncias = denuncias.filter(denuncia => {
    const matchesSearch = denuncia.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         denuncia.cidadao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "Todos" || denuncia.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendente": return "bg-yellow-100 text-yellow-800";
      case "Em Análise": return "bg-blue-100 text-blue-800";
      case "Resolvida": return "bg-green-100 text-green-800";
      case "Rejeitada": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const statusCount = {
    Pendente: denuncias.filter(d => d.status === "Pendente").length,
    "Em Análise": denuncias.filter(d => d.status === "Em Análise").length,
    Resolvida: denuncias.filter(d => d.status === "Resolvida").length,
    Rejeitada: denuncias.filter(d => d.status === "Rejeitada").length,
  };

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
              placeholder="Buscar por título ou cidadão..."
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
            <option value="Todos">Todos os Status</option>
            <option value="Pendente">Pendente</option>
            <option value="Em Análise">Em Análise</option>
            <option value="Resolvida">Resolvida</option>
            <option value="Rejeitada">Rejeitada</option>
          </select>
        </div>
      </div>

      {/* Denuncias List */}
      <div className="space-y-4">
        {filteredDenuncias.map((denuncia) => (
          <div key={denuncia.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{denuncia.titulo}</h3>
                <p className="text-gray-600 mb-3">{denuncia.descricao}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(denuncia.status)}`}>
                {denuncia.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                <span>{denuncia.localizacao}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>{denuncia.data}</span>
              </div>
              <div>
                Cidadão: <span className="font-medium">{denuncia.cidadao}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="text-[#2563EB] hover:text-[#1E40AF] font-medium text-sm">
                Ver Detalhes →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
