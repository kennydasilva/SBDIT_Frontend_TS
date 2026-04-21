import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import { denunciaService, type DenunciaDetalhada } from "../../api/denunciaService";



const getStatusColor = (estado: string) => {
  switch (estado) {
    case "PENDENTE":
      return "bg-yellow-100 text-yellow-800";
    case "VALIDADA":
      return "bg-blue-100 text-blue-800";
    case "APROVADA":
      return "bg-green-100 text-green-800";
    case "REJEITADA":
      return "bg-red-100 text-red-800";
    case "ARQUIVADA":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function CidadaoDashboard() {

   const { user, loading: authLoading } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEstado, setSelectedEstado] = useState("Todos");
    const [denuncias, setDenuncias] = useState<DenunciaDetalhada[]>([]);
    const [loading, setLoading] = useState(true);
    const[error, setError]= useState<string | null>(null);
    const[pendentes, setPendentes]=useState(0);
    const[validadas, setValidadas]=useState(0);
    const[rejeitadas, setRejeitadas]=useState(0);
    

   
  
  
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
        calcular(data);
      } catch (err) {
        setError("Erro ao carregar denúncias.");
      } finally {
        setLoading(false);
      }
    };


    const calcular=(dados:DenunciaDetalhada[])=>{
      let pendente=0;
      let validada=0;
      let rejeitada=0;

      for(const d of dados){
        if(d.estado === "PENDENTE"){
          pendente++;
        }
        else if(d.estado === "VALIDADA"){
          validada++;
        }
        else if(d.estado === "REJEITADA"){
          rejeitada++;
        }
      }

      setPendentes(pendente);
      setValidadas(validada);
      setRejeitadas(rejeitada);

    }


  const stats = [
  {
    label: "Total de Denúncias",
    value: denuncias.length.toString(),
    icon: FileText,
    color: "bg-blue-500",
  },
  {
    label: "Pendentes",
    value: pendentes.toString(),
    icon: Clock,
    color: "bg-yellow-500",
  },
  {
    label: "Validadas",
    value: validadas.toString(),
    icon: CheckCircle,
    color: "bg-green-500",
  },
  {
    label: "Rejeitadas",
    value: rejeitadas.toString(),
    icon: XCircle,
    color: "bg-red-500",
  },
];


  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Bem-vindo ao portal do cidadão</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Denuncias */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            Denúncias Recentes
          </h2>
          <Link
            to="/cidadao/minhas-denuncias"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Ver todas
          </Link>
        </div>
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
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {denuncias.map((denuncia) => (
                <tr key={denuncia.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
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
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        denuncia.estado
                      )}`}
                    >
                      {denuncia.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/cidadao/criar-denuncia"
          className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg shadow-sm flex items-center justify-between transition-colors"
        >
          <div>
            <h3 className="text-xl font-bold">Criar Nova Denúncia</h3>
            <p className="text-blue-100 text-sm mt-1">
              Registre uma nova infração de trânsito
            </p>
          </div>
          <FileText size={32} />
        </Link>

        <Link
          to="/cidadao/minhas-denuncias"
          className="bg-white hover:bg-gray-50 border-2 border-blue-600 text-blue-600 p-6 rounded-lg shadow-sm flex items-center justify-between transition-colors"
        >
          <div>
            <h3 className="text-xl font-bold">Ver Minhas Denúncias</h3>
            <p className="text-gray-600 text-sm mt-1">
              Acompanhe o status das suas denúncias
            </p>
          </div>
          <FileText size={32} />
        </Link>
      </div>
    </div>
  );
}
