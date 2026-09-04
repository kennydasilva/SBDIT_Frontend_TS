import { useEffect, useState } from "react";
import { Search, AlertTriangle, Loader2 } from "lucide-react";
import { superAdminService } from "../../api/superAdminService";
import type { PT } from "../../api/ptService";

export default function Policiais() {
  const [policiais, setPoliciais] = useState<PT[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAdmin, setFilterAdmin] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarPoliciais();
  }, []);

  const carregarPoliciais = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await superAdminService.listarPts();
      setPoliciais(data);
    } catch (err) {
      setError("Erro ao carregar policiais.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPoliciais = policiais.filter(policial => {
    const matchesSearch =
      policial.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policial.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterAdmin === "Todos" || String(policial.admin_id) === filterAdmin;
    return matchesSearch && matchesFilter;
  });

  const admins = ["Todos", ...Array.from(new Set(policiais.map(p => String(p.admin_id))))];

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
            onClick={carregarPoliciais}
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestão de Policiais (PT)</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
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
              <option key={admin} value={admin}>
                {admin === "Todos" ? "Todos os Admins" : `Admin #${admin}`}
              </option>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localização</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Responsável</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPoliciais.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Nenhum policial encontrado
                </td>
              </tr>
            ) : (
              filteredPoliciais.map((policial) => (
                <tr key={policial.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{policial.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{policial.numero_agente}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{policial.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{policial.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{policial.localizacao}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">#{policial.admin_id}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
