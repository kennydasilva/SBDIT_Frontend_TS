import { FileText, Clock, CheckCircle2, XCircle, Trophy, ArrowRight, ClipboardList } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import { denunciaService, type DenunciaDetalhada } from "../../api/denunciaService";
import { cidadaoService, type RankingEntry } from "../../api/cidadaoService";



const STATUS_STYLE: Record<string, string> = {
  PENDENTE: "bg-amber-50 text-amber-700",
  VALIDADA: "bg-blue-50 text-blue-700",
  APROVADA: "bg-emerald-50 text-emerald-700",
  REJEITADA: "bg-rose-50 text-rose-700",
  ARQUIVADA: "bg-gray-100 text-gray-600",
};

const getStatusStyle = (estado: string) => STATUS_STYLE[estado] ?? "bg-gray-100 text-gray-600";

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
    const [ranking, setRanking] = useState<RankingEntry[]>([]);
    const [meuCodigo, setMeuCodigo] = useState<string | null>(null);



    useEffect(() => {
      if (!authLoading && user) {
        carregarDenuncias();
        carregarRanking();
      }
    }, [authLoading, user]);

    const carregarRanking = async () => {
      if (!user) return;
      try {
        const [rankingData, perfil] = await Promise.all([
          cidadaoService.ranking(),
          cidadaoService.getCidadaoId(user.id),
        ]);
        setRanking(rankingData);
        setMeuCodigo(perfil.codigo_ranking ?? null);
      } catch (err) {
        // ranking é um extra motivacional, falha silenciosa não deve bloquear o dashboard
        console.error("Erro ao carregar ranking:", err);
      }
    };


    const carregarDenuncias = async () => {
      if (!user) return;
      try{
        setLoading(true);
        setError(null);

        const { results: data } = await denunciaService.listarPorCidadao(user.id);
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
      bg: "bg-blue-50",
      fg: "text-blue-600",
    },
    {
      label: "Pendentes",
      value: pendentes.toString(),
      icon: Clock,
      bg: "bg-amber-50",
      fg: "text-amber-600",
    },
    {
      label: "Validadas",
      value: validadas.toString(),
      icon: CheckCircle2,
      bg: "bg-emerald-50",
      fg: "text-emerald-600",
    },
    {
      label: "Rejeitadas",
      value: rejeitadas.toString(),
      icon: XCircle,
      bg: "bg-rose-50",
      fg: "text-rose-600",
    },
  ];


  return (
    <div className="p-8 bg-gray-50/50 min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-1">Bem-vindo ao portal do cidadão</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-semibold text-gray-900 mt-1.5">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bg} ${stat.fg} p-3 rounded-xl`}>
                  <Icon size={22} strokeWidth={1.75} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Denuncias */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-base font-semibold text-gray-900">
            Denúncias Recentes
          </h2>
          <Link
            to="/cidadao/minhas-denuncias"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Ver todas
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Matrícula
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {denuncias.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">
                    Ainda não tens denúncias registadas.
                  </td>
                </tr>
              ) : (
                denuncias.map((denuncia) => (
                  <tr key={denuncia.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      #{denuncia.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {denuncia.matricula}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {denuncia.tipo_infracao}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {denuncia.data_captura}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                          denuncia.estado
                        )}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                        {denuncia.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ranking de Cidadãos */}
      {ranking.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2.5">
            <div className="bg-amber-50 text-amber-500 p-2 rounded-lg">
              <Trophy size={18} strokeWidth={1.75} />
            </div>
            <h2 className="text-base font-semibold text-gray-900">
              Top 10 Cidadãos Mais Ativos
            </h2>
          </div>
          <p className="px-6 pt-4 text-sm text-gray-400">
            Ranking anónimo — cada cidadão só reconhece o seu próprio código.
          </p>
          <div className="divide-y divide-gray-50">
            {ranking.map((entrada) => {
              const souEu = meuCodigo !== null && entrada.codigo === meuCodigo;
              return (
                <div
                  key={entrada.codigo}
                  className={`flex items-center justify-between px-6 py-3 ${
                    souEu ? "bg-blue-50/60" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-sm font-semibold text-gray-400">
                      {entrada.posicao}º
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {entrada.codigo}
                      {souEu && (
                        <span className="ml-2 text-xs font-semibold text-blue-600">
                          (és tu!)
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {entrada.numero_denuncias} denúncias
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link
          to="/cidadao/criar-denuncia"
          className="group bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-6 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="p-3 rounded-xl bg-blue-600 text-white group-hover:bg-blue-700 transition-colors">
            <FileText size={22} strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Criar Nova Denúncia</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Registe uma nova infração de trânsito
            </p>
          </div>
        </Link>

        <Link
          to="/cidadao/minhas-denuncias"
          className="group bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-6 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
            <ClipboardList size={22} strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Ver Minhas Denúncias</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Acompanhe o estado das suas denúncias
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
