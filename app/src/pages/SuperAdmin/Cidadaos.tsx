import { useEffect, useState } from "react";
import { Search, Ban, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { superAdminService, type cidadao } from "../../api/superAdminService";

export default function Cidadaos() {
  const [cidadaos, setCidadaos] = useState<cidadao[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [atualizandoId, setAtualizandoId] = useState<number | null>(null);

  useEffect(() => {
    carregarCidadaos();
  }, []);

  const carregarCidadaos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await superAdminService.listarCidadao();
      setCidadaos(data);
    } catch (err) {
      setError("Erro ao carregar cidadãos.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCidadaos = cidadaos.filter(cidadao =>
    cidadao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cidadao.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStatus = async (cidadao: cidadao) => {
    try {
      setAtualizandoId(cidadao.id);
      await superAdminService.alterarStatusCidadao(cidadao.id, !cidadao.ativo);
      setCidadaos(prev =>
        prev.map(c => (c.id === cidadao.id ? { ...c, ativo: !c.ativo } : c))
      );
    } catch (err) {
      alert("Erro ao alterar estado do cidadão");
    } finally {
      setAtualizandoId(null);
    }
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
            onClick={carregarCidadaos}
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
        <h1 className="text-3xl font-bold text-gray-900">Gestão de Cidadãos</h1>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
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
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Registo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCidadaos.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Nenhum cidadão encontrado
                </td>
              </tr>
            ) : (
              filteredCidadaos.map((cidadao) => (
                <tr key={cidadao.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cidadao.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cidadao.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cidadao.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cidadao.numero || "—"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {cidadao.data_registo ? new Date(cidadao.data_registo).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      cidadao.ativo !== false
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {cidadao.ativo !== false ? "Ativo" : "Banido"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => toggleStatus(cidadao)}
                      disabled={atualizandoId === cidadao.id}
                      className={`flex items-center gap-1 disabled:opacity-50 ${
                        cidadao.ativo !== false
                          ? "text-red-600 hover:text-red-800"
                          : "text-green-600 hover:text-green-800"
                      }`}
                    >
                      {atualizandoId === cidadao.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : cidadao.ativo !== false ? (
                        <>
                          <Ban size={18} />
                          Banir
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          Ativar
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
