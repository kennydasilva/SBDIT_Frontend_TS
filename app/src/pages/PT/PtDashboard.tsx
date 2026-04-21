import { CheckCircle, Archive, Clock, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../../hooks/useAuth";
import { denunciaService, type DenunciaDetalhada } from "../../api/denunciaService";



const getStatusColor = (estado: string) => {
  switch (estado) {
    case "VALIDADA":
      return "bg-blue-100 text-blue-800";
    case "APROVADA":
      return "bg-green-100 text-green-800";
    case "ARQUIVADA":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function DashboardPt() {
  const { user, loading: authLoading } = useAuth();
  const [denuncias, setDenuncias] = useState<DenunciaDetalhada[]>([]);
  const [loading, setLoading] = useState(true);
  const[error, setError]= useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("todas");
  const [denunciasAprovadas, setDenunciasAprovadas] = useState<DenunciaDetalhada[]>([]);
  const [denunciasArquivadas, setDenunciasArquivadas] = useState<DenunciaDetalhada[]>([]);
  const [denunciasTemp, setDenunciasTemp] = useState<DenunciaDetalhada[]>([]);
  const [contramaoCount, setContramaoCount] = useState(0);
  const [veiculoParadoCount, setVeiculoParadoCount] = useState(0);
  const [excessoVelocidadeCount, setExcessoVelocidadeCount] = useState(0);
  const [sinalVermelhoCount, setSinalVermelhoCount] = useState(0);

  

 const calcularInfracoes = (dados: DenunciaDetalhada[]) => {
  let contramao = 0;
  let veiculoParado = 0;
  let excesso = 0;

   
  for (const d of dados) {
    if (d.tipo_infracao === "CONTRAMAO") {
      contramao++;

      
    } else if (d.tipo_infracao === "VEICULO_PARADO") {
      veiculoParado++;
      
    } else if (d.tipo_infracao === "EXCESSO_VELOCIDADE") {
      excesso++;
      
    }


    
  }

  for(const da of dados){

    if(da.estado === "APROVADA"){
      setDenunciasAprovadas(prev => [...prev, da]);
    } else if(da.estado === "ARQUIVADA"){
      setDenunciasArquivadas(prev => [...prev, da]);
    }
  }

  

  setContramaoCount(contramao);
  setVeiculoParadoCount(veiculoParado);
  setExcessoVelocidadeCount(excesso);

  
};





  
  useEffect(() => {
          if (!authLoading && user) {
            carregarDenuncias();
            
           
          }
  }, [authLoading, user]);
        
      
      
  const carregarDenuncias = async () => {
        if (!user) return;
    
        try{
          setLoading(true);
    
          const data= await denunciaService.listarValidadas();
    
          setDenuncias(data);

          const data2 = await denunciaService.listarPorPt(user.id);

        setDenunciasTemp(data2);

       

        calcularInfracoes(data2);
      } catch (error) {
          setError("Erro ao carregar denúncias.");
      } finally {
          setLoading(false);
      }
  }


  const stats = [
    {
      label: "Denúncias Validadas",
      value: denuncias.length.toString(),
      icon: AlertTriangle,
      color: "bg-blue-500",
    },
    {
      label: "Aprovadas por mim",
      value: denunciasAprovadas.length.toString(),
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      label: "Arquivadas por mim",
      value: denunciasArquivadas.length.toString(),
      icon: Archive,
      color: "bg-gray-500",
    },
    {
      label: "Pendentes de análise",
      value: "16",
      icon: Clock,
      color: "bg-yellow-500",
    },
  ];

  const chartData = [
    {
      tipo: "CONTRAMAO",
      quantidade: denunciasTemp.filter(d => d.tipo_infracao === "CONTRAMAO").length
    },
    {
      tipo: "VEICULO_PARADO",
      quantidade: denunciasTemp.filter(d => d.tipo_infracao === "VEICULO_PARADO").length
    },
    {
      tipo: "EXCESSO_VELOCIDADE",
      quantidade: denunciasTemp.filter(d => d.tipo_infracao === "EXCESSO_VELOCIDADE").length
    }
  ];





  return (
  <>

  {loading ? (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Carregando denúncias...
        </h2>
      </div>
  ) : null
  }
  
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Bem-vindo ao painel de análise de denúncias</p>
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

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Infrações Analisadas por Tipo
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tipo" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="quantidade" fill="#2563EB" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Denuncias */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            Últimas Denúncias Validadas
          </h2>
          <Link
            to="/pt/denuncias"
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
                  Tipo de Infração
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Confiança
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
              {denuncias.map((denuncia) => (
                <tr key={denuncia.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    #{denuncia.id}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {denuncia.matricula}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {denuncia.tipo_infracao}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {denuncia.data_captura}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className="font-medium">{denuncia.confianca}%</span>
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
                  <td className="px-6 py-4">
                    <Link
                      to={`/pt/denuncias/${denuncia.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Analisar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    
    
  </>
  );
}
