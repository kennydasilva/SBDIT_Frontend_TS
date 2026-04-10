import { useState } from "react";
import { Link } from "react-router";
import { Search } from "lucide-react";

const denunciasData = [
  {
    id: 145,
    matricula: "AB-12-CD",
    tipo: "Contramão",
    data: "2026-04-10 09:15",
    estado: "Validada",
    confianca: 95,
  },
  {
    id: 144,
    matricula: "EF-34-GH",
    tipo: "Veículo Parado",
    data: "2026-04-10 08:45",
    estado: "Validada",
    confianca: 88,
  },
  {
    id: 143,
    matricula: "IJ-56-KL",
    tipo: "Excesso de Velocidade",
    data: "2026-04-09 18:30",
    estado: "Validada",
    confianca: 92,
  },
  {
    id: 142,
    matricula: "MN-78-OP",
    tipo: "Contramão",
    data: "2026-04-09 15:20",
    estado: "Aprovada",
    confianca: 97,
    ptId: "PT-2145",
  },
  {
    id: 141,
    matricula: "QR-90-ST",
    tipo: "Veículo Parado",
    data: "2026-04-09 12:10",
    estado: "Arquivada",
    confianca: 76,
    ptId: "PT-2145",
  },
  {
    id: 140,
    matricula: "UV-11-WX",
    tipo: "Sinal Vermelho",
    data: "2026-04-08 16:45",
    estado: "Validada",
    confianca: 90,
  },
  {
    id: 139,
    matricula: "YZ-22-AB",
    tipo: "Excesso de Velocidade",
    data: "2026-04-08 14:30",
    estado: "Aprovada",
    confianca: 94,
    ptId: "PT-2145",
  },
];

const getStatusColor = (estado: string) => {
  switch (estado) {
    case "Validada":
      return "bg-blue-100 text-blue-800";
    case "Aprovada":
      return "bg-green-100 text-green-800";
    case "Arquivada":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function DenunciasPt() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("todas");

  // Filtrar denúncias conforme regra de negócio
  const filteredDenuncias = denunciasData.filter((denuncia) => {
    // Filtro de busca por matrícula
    const matchesSearch = denuncia.matricula
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Filtro por estado (regra de negócio: mostrar todas VALIDADA, apenas APROVADA/ARQUIVADA do PT logado)
    let matchesEstado = true;
    if (filterEstado === "validadas") {
      matchesEstado = denuncia.estado === "Validada";
    } else if (filterEstado === "aprovadas") {
      matchesEstado = denuncia.estado === "Aprovada" && denuncia.ptId === "PT-2145";
    } else if (filterEstado === "arquivadas") {
      matchesEstado = denuncia.estado === "Arquivada" && denuncia.ptId === "PT-2145";
    } else if (filterEstado === "todas") {
      // Mostrar todas VALIDADA + APROVADA/ARQUIVADA do PT logado
      matchesEstado =
        denuncia.estado === "Validada" ||
        (denuncia.estado === "Aprovada" && denuncia.ptId === "PT-2145") ||
        (denuncia.estado === "Arquivada" && denuncia.ptId === "PT-2145");
    }

    return matchesSearch && matchesEstado;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Denúncias</h1>
        <p className="text-gray-600 mt-2">
          Gerir e analisar denúncias de trânsito
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pesquisar por Matrícula
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Ex: AB-12-CD"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter by Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Estado
            </label>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todas">Todas</option>
              <option value="validadas">Validadas</option>
              <option value="aprovadas">Aprovadas (minhas)</option>
              <option value="arquivadas">Arquivadas (minhas)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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
                  Data de Captura
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Confiança
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDenuncias.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Nenhuma denúncia encontrada
                  </td>
                </tr>
              ) : (
                filteredDenuncias.map((denuncia) => (
                  <tr key={denuncia.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      #{denuncia.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {denuncia.matricula}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {denuncia.tipo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {denuncia.data}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          denuncia.estado
                        )}`}
                      >
                        {denuncia.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className="font-medium">{denuncia.confianca}%</span>
                    </td>
                    <td className="px-6 py-4">
                      {denuncia.estado === "Validada" ? (
                        <Link
                          to={`/pt/denuncias/${denuncia.id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Analisar
                        </Link>
                      ) : (
                        <Link
                          to={`/pt/denuncias/${denuncia.id}`}
                          className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                        >
                          Ver Detalhes
                        </Link>
                      )}
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
