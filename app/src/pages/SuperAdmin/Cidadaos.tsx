import { useEffect, useState } from "react";
import { Search, Ban, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { superAdminService, type cidadao } from "../../api/superAdminService";
import Paginacao from "../../components/Paginacao";
import { CARD, INPUT, BUTTON_PRIMARY, BADGE, TABLE_HEAD_CELL, TABLE_ROW_HOVER } from "../../utils/uiClasses";

const TAMANHO_PAGINA = 20;

export default function Cidadaos() {
  const [cidadaos, setCidadaos] = useState<cidadao[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [atualizandoId, setAtualizandoId] = useState<number | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalItens, setTotalItens] = useState(0);

  useEffect(() => {
    carregarCidadaos(paginaAtual);
  }, [paginaAtual]);

  const carregarCidadaos = async (pagina: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await superAdminService.listarCidadao(pagina);
      setCidadaos(data.results);
      setTotalItens(data.count);
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
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <p className="text-rose-600">{error}</p>
          <button
            onClick={() => carregarCidadaos(paginaAtual)}
            className={`${BUTTON_PRIMARY} mt-4`}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50/50 min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Gestão de Cidadãos</h1>
      </div>

      {/* Search Bar */}
      <div className={`${CARD} p-4 mb-6`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${INPUT} pl-10`}
          />
        </div>
      </div>

      {/* Table */}
      <div className={`${CARD} overflow-hidden`}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className={TABLE_HEAD_CELL}>ID</th>
              <th className={TABLE_HEAD_CELL}>Nome</th>
              <th className={TABLE_HEAD_CELL}>Email</th>
              <th className={TABLE_HEAD_CELL}>Número</th>
              <th className={TABLE_HEAD_CELL}>Data de Registo</th>
              <th className={TABLE_HEAD_CELL}>Status</th>
              <th className={TABLE_HEAD_CELL}>Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredCidadaos.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Nenhum cidadão encontrado
                </td>
              </tr>
            ) : (
              filteredCidadaos.map((cidadao) => (
                <tr key={cidadao.id} className={TABLE_ROW_HOVER}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cidadao.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cidadao.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cidadao.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cidadao.numero || "—"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cidadao.data_registo ? new Date(cidadao.data_registo).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`${BADGE} ${cidadao.ativo !== false ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                      {cidadao.ativo !== false ? "Ativo" : "Banido"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => toggleStatus(cidadao)}
                      disabled={atualizandoId === cidadao.id}
                      className={`flex items-center gap-1 disabled:opacity-50 ${
                        cidadao.ativo !== false
                          ? "text-rose-600 hover:text-rose-800"
                          : "text-emerald-600 hover:text-emerald-800"
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
