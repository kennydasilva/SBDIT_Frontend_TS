import { useState } from "react";
import { Search, Plus, UserPlus } from "lucide-react";

interface Policial {
  id: number;
  numeroAgente: string;
  nome: string;
  localizacao: string;
  adminResponsavel: string;
  status: "Ativo" | "Inativo";
}

const mockPoliciais: Policial[] = [
  { id: 1, numeroAgente: "PT-001", nome: "Pedro Almeida", localizacao: "Zona Norte", adminResponsavel: "Carlos Santos", status: "Ativo" },
  { id: 2, numeroAgente: "PT-002", nome: "Juliana Rocha", localizacao: "Zona Sul", adminResponsavel: "Maria Oliveira", status: "Ativo" },
  { id: 3, numeroAgente: "PT-003", nome: "Ricardo Lima", localizacao: "Centro", adminResponsavel: "Carlos Santos", status: "Ativo" },
  { id: 4, numeroAgente: "PT-004", nome: "Fernanda Costa", localizacao: "Zona Oeste", adminResponsavel: "João Pedro", status: "Inativo" },
];

export default function Policiais() {
  const [policiais] = useState<Policial[]>(mockPoliciais);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAdmin, setFilterAdmin] = useState("Todos");

  const filteredPoliciais = policiais.filter(policial => {
    const matchesSearch = policial.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policial.numeroAgente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterAdmin === "Todos" || policial.adminResponsavel === filterAdmin;
    return matchesSearch && matchesFilter;
  });

  const admins = ["Todos", ...Array.from(new Set(policiais.map(p => p.adminResponsavel)))];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestão de Policiais (PT)</h1>
        <button className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg hover:bg-[#1E40AF] transition-colors">
          <Plus size={20} />
          Novo Policial
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome ou número..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterAdmin}
            onChange={(e) => setFilterAdmin(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {admins.map(admin => (
              <option key={admin} value={admin}>{admin}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número do Agente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localização</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Responsável</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPoliciais.map((policial) => (
              <tr key={policial.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{policial.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{policial.numeroAgente}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{policial.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{policial.localizacao}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{policial.adminResponsavel}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    policial.status === "Ativo"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {policial.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="flex items-center gap-1 text-[#2563EB] hover:text-[#1E40AF]">
                    <UserPlus size={18} />
                    Atribuir Admin
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
