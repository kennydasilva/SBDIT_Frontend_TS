import { useEffect, useState } from "react";
import { Search, Eye, Loader2 } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { denunciaService, type DenunciaDetalhada } from "../../api/denunciaService";
import Paginacao from "../../components/Paginacao";
import { labelEstado, labelTipo, toneEstado } from "../../utils/estadoDenuncia";
import { CARD, INPUT, PAGE, PAGE_SUBTITLE, PAGE_TITLE, TABLE_HEAD_CELL, TABLE_ROW_HOVER } from "../../utils/uiClasses";

const TAMANHO_PAGINA = 20;

const estados = [
  "Todos",
  "PENDENTE",
  "VALIDADA",
  "REJEITADA",
  "APROVADA",
  "ARQUIVADA",
  "ENCAMINHADA",
  "EM_ATENDIMENTO",
];

export default function MinhasDenuncias() {
  const { user, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("Todos");
  const [denuncias, setDenuncias] = useState<DenunciaDetalhada[]>([]);
  const [loading, setLoading] = useState(true);
  const[error, setError]= useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalItens, setTotalItens] = useState(0);


  useEffect(() => {
    if (!authLoading && user) {
      carregarDenuncias(paginaAtual);
    }
  }, [authLoading, user, paginaAtual]);


  const carregarDenuncias = async (pagina: number) => {
    if (!user) return;
    try{
      setLoading(true);
      setError(null);

      const data= await denunciaService.listarPorCidadao(user.id, pagina);
      setDenuncias(data.results);
      setTotalItens(data.count);
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
    <div className={PAGE}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={PAGE_TITLE}>Minhas Denúncias</h1>
        <p className={PAGE_SUBTITLE}>
          Acompanhe o estado de todas as suas denúncias
        </p>
      </div>

      {/* Filters */}
      <div className={`${CARD} p-6 mb-6`}>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Pesquisar por matrícula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${INPUT} pl-10`}
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
                {estado === "Todos" ? "Todos" : labelEstado(estado)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={`${CARD} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100">
              <tr>
                <th className={TABLE_HEAD_CELL}>
                  ID
                </th>
                <th className={TABLE_HEAD_CELL}>
                  Matrícula
                </th>
                <th className={TABLE_HEAD_CELL}>
                  Tipo de Infração
                </th>
                <th className={TABLE_HEAD_CELL}>
                  Data
                </th>
                <th className={TABLE_HEAD_CELL}>
                  Estado
                </th>
                <th className={TABLE_HEAD_CELL}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-rose-600">{error}</td>
                </tr>
              ) : filteredDenuncias.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    {denuncias.length === 0 ? "Ainda não fez nenhuma denúncia" : "Nenhuma denúncia corresponde aos filtros"}
                  </td>
                </tr>
              ) : (
                filteredDenuncias.map((denuncia) => (
                  <tr key={denuncia.id} className={TABLE_ROW_HOVER}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      #{denuncia.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {denuncia.matricula}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {labelTipo(denuncia.tipo_infracao)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {denuncia.data_captura}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${toneEstado(
                          denuncia.estado
                        )}`}
                      >
                        {labelEstado(denuncia.estado, denuncia.tipo_infracao)}
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

        <Paginacao
          paginaAtual={paginaAtual}
          totalItens={totalItens}
          tamanhoPagina={TAMANHO_PAGINA}
          onMudarPagina={setPaginaAtual}
          disabled={loading}
        />
      </div>
    </div>
  );
}
