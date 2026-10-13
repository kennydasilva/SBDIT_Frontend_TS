import { useEffect, useState } from "react";












import { Link } from "react-router";












import { ChevronRight, Archive, CheckCircle2, Gavel } from "../../components/icons";







import { denunciaService, type DenunciaDetalhada } from "../../api/denunciaService";












import { useAuth } from "../../hooks/useAuth";












import StatStrip from "../../components/app/StatStrip";
import EstadoBadge from "../../components/app/EstadoBadge";
import Paginacao from "../../components/Paginacao";
import { labelTipo } from "../../utils/estadoDenuncia";










import { mensagemDeErro } from "../../utils/mensagens";












import { PAGE, CARD, TABLE_HEAD_CELL, TABLE_ROW_HOVER } from "../../utils/uiClasses";







import PageHeader from "../../components/app/PageHeader";
import { formatarDataHora } from "../../utils/datas";












import { ErroBloco, LinhaVazia } from "../../components/app/Lista";












import { LinhasEsqueleto } from "../../components/app/Carregando";













const TAMANHO_PAGINA = 10;

// Histórico das denúncias que este agente decidiu (aprovou ou rejeitou).
export default function MinhasDecisoesPt() {
  const { user, loading: authLoading } = useAuth();
  const [denuncias, setDenuncias] = useState<DenunciaDetalhada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalItens, setTotalItens] = useState(0);

  useEffect(() => {
    if (!authLoading && user) {
      carregarDenuncias(paginaAtual);
    }
  }, [authLoading, user, paginaAtual]);

  const carregarDenuncias = async (pagina: number) => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await denunciaService.listarPorPt(user.id, pagina, TAMANHO_PAGINA);
      setDenuncias(data.results);
      setTotalItens(data.count);
    } catch (err) {
      setError(mensagemDeErro(err, "Erro ao carregar as decisões"));
    } finally {
      setLoading(false);
    }
  };

  // Contagens da página actual (o backend ainda não devolve totais por estado).
  const aprovadas = denuncias.filter((d) => d.estado === "APROVADA").length;
  const arquivadas = denuncias.filter((d) => d.estado === "ARQUIVADA").length;

  
  return (
    <div className={PAGE}>
      <PageHeader titulo="Minhas decisões" texto="Histórico das denúncias que analisou e das decisões tomadas" />

      <StatStrip
        className="mb-6"
        itens={[
          { icon: Gavel, rotulo: "Decisões tomadas", valor: totalItens },
          { icon: CheckCircle2, rotulo: "Aprovadas nesta página", valor: aprovadas },
          { icon: Archive, rotulo: "Arquivadas nesta página", valor: arquivadas },
        ]}
      />

      <div className={`${CARD} overflow-hidden`}>
        {error ? (
          <ErroBloco mensagem={error} onTentar={() => carregarDenuncias(paginaAtual)} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className={TABLE_HEAD_CELL}>#</th>
                  <th className={TABLE_HEAD_CELL}>Matrícula</th>
                  <th className={TABLE_HEAD_CELL}>Tipo</th>
                  <th className={TABLE_HEAD_CELL}>Decisão</th>
                  <th className={TABLE_HEAD_CELL}>Código legal</th>
                  <th className={TABLE_HEAD_CELL}>Data</th>
                  <th className={TABLE_HEAD_CELL}><span className="sr-only">Abrir</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <LinhasEsqueleto colunas={7} />
                ) : denuncias.length === 0 ? (
                  <LinhaVazia colunas={7}>
                      Ainda não tomou nenhuma decisão. As denúncias que aprovar ou arquivar ficam aqui.
                    </LinhaVazia>
                ) : (
                  denuncias.map((d) => (
                    <tr key={d.id} className={TABLE_ROW_HOVER}>
                      <td className="px-6 py-3.5 text-sm text-gray-500">{d.id}</td>
                      <td className="px-6 py-3.5 text-sm font-medium text-gray-900">{d.matricula || "—"}</td>
                      <td className="px-6 py-3.5 text-sm text-gray-700">{labelTipo(d.tipo_infracao)}</td>
                      <td className="px-6 py-3.5">
                        <EstadoBadge estado={d.estado} tipo={d.tipo_infracao} />
                      </td>
                      <td className="px-6 py-3.5 text-sm text-gray-700">{d.codigo_legal || "—"}</td>
                      <td className="px-6 py-3.5 text-sm text-gray-500 whitespace-nowrap">{formatarDataHora(d.data_captura || d.data_registo)}</td>
                      <td className="px-6 py-3.5 text-right">
                        <Link
                          to={`/pt/denuncias/${d.id}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          Ver <ChevronRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
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
