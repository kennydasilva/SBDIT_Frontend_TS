import { Link } from "react-router";
import { denunciaService, type DenunciaDetalhada } from "../../api/denunciaService";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";

const decisoesData = [
  {
    id: 142,
    matricula: "MN-78-OP",
    tipo: "Contramão",
    estado: "Aprovada",
    codigoLegal: "Art. 24º - Circulação em Contramão",
    dataDecisao: "2026-04-09 15:45",
  },
  {
    id: 141,
    matricula: "QR-90-ST",
    tipo: "Veículo Parado",
    estado: "Arquivada",
    codigoLegal: "Sem infração detectada",
    dataDecisao: "2026-04-09 12:30",
  },
  {
    id: 139,
    matricula: "YZ-22-AB",
    tipo: "Excesso de Velocidade",
    estado: "Aprovada",
    codigoLegal: "Art. 27º - Excesso de Velocidade",
    dataDecisao: "2026-04-08 14:50",
  },
  {
    id: 135,
    matricula: "CD-33-EF",
    tipo: "Sinal Vermelho",
    estado: "Aprovada",
    codigoLegal: "Art. 72º - Desrespeito ao Sinal Vermelho",
    dataDecisao: "2026-04-07 11:20",
  },
  {
    id: 132,
    matricula: "GH-44-IJ",
    tipo: "Veículo Parado",
    estado: "Arquivada",
    codigoLegal: "Veículo autorizado a estacionar",
    dataDecisao: "2026-04-06 16:15",
  },
  {
    id: 128,
    matricula: "KL-55-MN",
    tipo: "Contramão",
    estado: "Aprovada",
    codigoLegal: "Art. 24º - Circulação em Contramão",
    dataDecisao: "2026-04-05 10:05",
  },
  {
    id: 125,
    matricula: "OP-66-QR",
    tipo: "Excesso de Velocidade",
    estado: "Aprovada",
    codigoLegal: "Art. 27º - Excesso de Velocidade",
    dataDecisao: "2026-04-04 13:40",
  },
];

const getStatusColor = (estado: string) => {
  switch (estado) {
    case "APROVADA":
      return "bg-green-100 text-green-800";
    case "ARQUIVADA":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function MinhasDecisoesPt() {
  const { user, loading: authLoading } = useAuth();
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

      setLoading(true)

      const data= await denunciaService.listarPorPt(user.id)

      setDenuncias(data);

    }
    catch(error){
      setError("Erro ao carregar decisões.");
    }
    finally{
      setLoading(false);
    }
    
  }
  const totalDecisoes = denuncias.length;
  const aprovadas = denuncias.filter((d) => d.estado === "APROVADA").length;
  const arquivadas = denuncias.filter((d) => d.estado === "ARQUIVADA").length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Minhas Decisões</h1>
        <p className="text-gray-600 mt-2">
          Histórico de denúncias analisadas e decisões tomadas
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Total de Decisões</p>
          <p className="text-3xl font-bold text-gray-900">{totalDecisoes}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Denúncias Aprovadas</p>
          <p className="text-3xl font-bold text-green-600">{aprovadas}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Denúncias Arquivadas</p>
          <p className="text-3xl font-bold text-gray-600">{arquivadas}</p>
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
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Código Legal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Data da Decisão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {denuncias.map((decisao) => (
                <tr key={decisao.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    #{decisao.id}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {decisao.matricula}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {decisao.tipo_infracao}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        decisao.estado
                      )}`}
                    >
                      {decisao.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {decisao.codigo_legal}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {decisao.data_captura}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <Link
                        to={`/pt/denuncias/${decisao.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Ver Detalhes
                      </Link>
                      <Link
                        to={`/pt/denuncias/${decisao.id}`}
                        className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                      >
                        Editar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
