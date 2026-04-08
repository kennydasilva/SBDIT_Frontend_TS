import { useEffect, useState } from "react";
import { Search, Eye } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { denunciaService, type DenunciaDetalhada } from "../../api/denunciaService";



const estados = [
  "Todos",
  "PENDENTE",
  "VALIDADA",
  "REJEITADA",
  "APROVADA",
  "ARQUIVADA",
];

const getStatusColor = (estado: string) => {
  switch (estado) {
    case "PENDENTE":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "VALIDADA":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "APROVADA":
      return "bg-green-100 text-green-800 border-green-200";
    case "REJEITADA":
      return "bg-red-100 text-red-800 border-red-200";
    case "ARQUIVADA":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function MinhasDenuncias() {
  const { user, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("Todos");
  const [denuncias, setDenuncias] = useState<DenunciaDetalhada[]>([]);
  const [loading, setLoading] = useState(true);
  const[error, setError]= useState<string | null>(null);
 


  useEffect(() => {
    if (!authLoading && user) {
      carregarDenuncias();
    }
  }, [authLoading, user]);


  const carregarDenuncias = async () => {
    if (!user) return;
    try{
      setLoading(true);
      setError(null);

      const data= await denunciaService.listarPorCidadao(user.id);
      setDenuncias(data);
    } catch (err) {
      setError("Erro ao carregar denúncias.");
    } finally {
      setLoading(false);
    }
  };

  const filteredDenuncias = denuncias.filter((denuncia) => {
    const matchesSearch =
      denuncia.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      denuncia.estado.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado =
      selectedEstado === "Todos" || denuncia.estado === selectedEstado;
    return matchesSearch && matchesEstado;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Minhas Denúncias</h1>
        <p className="text-gray-600 mt-2">
          Acompanhe o status de todas as suas denúncias
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por matrícula ou estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Estado Filter */}
          <div className="flex gap-2 flex-wrap">
            {estados.map((estado) => (
              <button
                key={estado}
                onClick={() => setSelectedEstado(estado)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedEstado === estado
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {estado}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Matrícula
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo de Infração
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDenuncias.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <p className="text-gray-500">
                      Nenhuma denúncia encontrada
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDenuncias.map((denuncia) => (
                  <tr key={denuncia.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      #{denuncia.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {denuncia.matricula}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {denuncia.tipo_infracao}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {denuncia.data_captura}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          denuncia.estado
                        )}`}
                      >
                        {denuncia.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/cidadao/denuncias/${denuncia.id}`}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
                      >
                        <Eye size={18} />
                        <span className="text-sm font-medium">
                          Ver Detalhes
                        </span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredDenuncias.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando {filteredDenuncias.length} de{" "}
              {denuncias.length} denúncias
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                Anterior
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                1
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                Próximo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
