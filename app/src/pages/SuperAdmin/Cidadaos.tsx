import { useEffect, useState } from "react";





import { Ban, CheckCircle, Loader2 } from "../../components/icons";



import { superAdminService, type cidadao } from "../../api/superAdminService";





import Paginacao from "../../components/Paginacao";
import { BADGE, TABLE_HEAD_CELL, TABLE_ROW_HOVER, PAGE, TOOLBAR, CARD_ATTACHED } from "../../utils/uiClasses";


import { mostrarErro } from "../../utils/mensagens";





import PageHeader from "../../components/app/PageHeader";
import { PaginaEsqueleto } from "../../components/app/Carregando";





import { ErroPagina, CampoPesquisa, LinhaVazia } from "../../components/app/Lista";





import { formatarData } from "../../utils/datas";






const TAMANHO_PAGINA = 10;

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
      const data = await superAdminService.listarCidadao(pagina, TAMANHO_PAGINA);
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
      mostrarErro(err, "Erro ao alterar o estado do cidadão");
    } finally {
      setAtualizandoId(null);
    }
  };

  if (loading) return <PaginaEsqueleto />;

  if (error) return <ErroPagina mensagem={error} onTentar={() => carregarCidadaos(paginaAtual)} />;

  return (
    <div className={PAGE}>
      <PageHeader titulo="Cidadãos" texto="As contas de cidadão registadas. Uma conta banida deixa de poder entrar e denunciar." />

      {/* Search Bar */}
      <div className={TOOLBAR}>
        <CampoPesquisa valor={searchTerm} onMudar={setSearchTerm} rotulo="Pesquisar por nome ou email" />
      </div>

      {/* Table */}
      <div className={`${CARD_ATTACHED} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                  <th className={TABLE_HEAD_CELL}>Nome</th>
                <th className={TABLE_HEAD_CELL}>Email</th>
                <th className={TABLE_HEAD_CELL}>Telemóvel</th>
                <th className={TABLE_HEAD_CELL}>Registado em</th>
                <th className={TABLE_HEAD_CELL}>Estado</th>
                <th className={TABLE_HEAD_CELL}><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCidadaos.length === 0 ? (
                <LinhaVazia colunas={6}>
                    Nenhum cidadão encontrado
                  </LinhaVazia>
              ) : (
                filteredCidadaos.map((cidadao) => (
                  <tr key={cidadao.id} className={TABLE_ROW_HOVER}>
                    <td className="px-6 py-3.5 whitespace-nowrap text-sm font-medium text-gray-900">{cidadao.nome}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-600">{cidadao.email}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-600">{cidadao.numero || "—"}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-500">
                      {formatarData(cidadao.data_registo)}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className={`${BADGE} ${cidadao.ativo !== false ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                        {cidadao.ativo !== false ? "Ativo" : "Banido"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-sm">
                      <button
                        onClick={() => toggleStatus(cidadao)}
                        disabled={atualizandoId === cidadao.id}
                        className={`inline-flex items-center gap-1.5 font-medium disabled:opacity-50 ${
                        cidadao.ativo !== false ? "text-rose-600 hover:text-rose-700" : "text-blue-600 hover:text-blue-700"
                      }`}
                      >
                        {atualizandoId === cidadao.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : cidadao.ativo !== false ? (
                          <>
                            <Ban size={12} />
                            Banir
                          </>
                        ) : (
                          <>
                            <CheckCircle size={12} />
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
