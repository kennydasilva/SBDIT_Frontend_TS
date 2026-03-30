import { useState } from "react";
import { Search, Ban, CheckCircle } from "lucide-react";

interface Cidadao {
  id: number;
  nome: string;
  email: string;
  numeroDenuncias: number;
  dataCadastro: string;
  status: "Ativo" | "Banido";
}

const mockCidadaos: Cidadao[] = [
  { id: 1, nome: "Lucas Ferreira", email: "lucas@email.com", numeroDenuncias: 5, dataCadastro: "2024-01-10", status: "Ativo" },
  { id: 2, nome: "Beatriz Souza", email: "beatriz@email.com", numeroDenuncias: 12, dataCadastro: "2024-02-15", status: "Ativo" },
  { id: 3, nome: "Rafael Santos", email: "rafael@email.com", numeroDenuncias: 3, dataCadastro: "2024-03-20", status: "Ativo" },
  { id: 4, nome: "Carla Mendes", email: "carla@email.com", numeroDenuncias: 0, dataCadastro: "2024-01-05", status: "Banido" },
];

export default function Cidadaos() {
  const [cidadaos, setCidadaos] = useState<Cidadao[]>(mockCidadaos);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCidadaos = cidadaos.filter(cidadao =>
    cidadao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cidadao.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStatus = (id: number) => {
    setCidadaos(cidadaos.map(cidadao =>
      cidadao.id === id
        ? { ...cidadao, status: cidadao.status === "Ativo" ? "Banido" : "Ativo" }
        : cidadao
    ));
  };

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número de Denúncias</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Cadastro</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCidadaos.map((cidadao) => (
              <tr key={cidadao.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cidadao.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cidadao.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cidadao.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{cidadao.numeroDenuncias}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cidadao.dataCadastro}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    cidadao.status === "Ativo"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {cidadao.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => toggleStatus(cidadao.id)}
                    className={`flex items-center gap-1 ${
                      cidadao.status === "Ativo"
                        ? "text-red-600 hover:text-red-800"
                        : "text-green-600 hover:text-green-800"
                    }`}
                  >
                    {cidadao.status === "Ativo" ? (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
