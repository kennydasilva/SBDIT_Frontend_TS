import { useEffect, useState } from "react";







import { Link } from "react-router";







import { AlertTriangle, ChevronRight } from "../../components/icons";





import { denunciaService, type DenunciaDetalhada } from "../../api/denunciaService";







import Paginacao from "../../components/Paginacao";
import { labelTipo, TIPO_LABEL } from "../../utils/estadoDenuncia";







import { mensagemDeErro } from "../../utils/mensagens";







import { PAGE, INPUT, BADGE, TABLE_HEAD_CELL, TABLE_ROW_HOVER, TOOLBAR, CARD_ATTACHED } from "../../utils/uiClasses";


import PageHeader from "../../components/app/PageHeader";
import { formatarDataHora } from "../../utils/datas";







import { CampoPesquisa, ErroBloco, LinhaVazia } from "../../components/app/Lista";







import { LinhasEsqueleto } from "../../components/app/Carregando";








const TAMANHO_PAGINA = 10;

// Cor da confiança da análise automática (0-1 no backend).
const toneConfianca = (c: number) =>
  c >= 0.75 ? "bg-blue-50 text-blue-800" : c >= 0.5 ? "bg-blue-50 text-blue-800" : "bg-gray-100 text-gray-500";

// Fila de revisão do agente: só denúncias validadas pela análise automática,
// da jurisdição do seu posto (ou sem posto). Cada uma aguarda a sua decisão.
export default function DenunciasPt() {
  const [denuncias, setDenuncias] = useState<DenunciaDetalhada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalItens, setTotalItens] = useState(0);

  useEffect(() => {
    carregarDenuncias(paginaAtual);
  }, [paginaAtual]);

  const carregarDenuncias = async (pagina: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await denunciaService.listarValidadas(pagina, TAMANHO_PAGINA);
      setDenuncias(data.results);
      setTotalItens(data.count);
    } catch (err) {
      setError(mensagemDeErro(err, "Erro ao carregar as denúncias"));
    } finally {
      setLoading(false);
    }
  };

  const filtradas = denuncias.filter((d) =>
    (d.matricula ?? "").toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!filtroTipo || d.tipo_infracao === filtroTipo)
  );

  return (
    <div className={PAGE}>
      <PageHeader titulo="Denúncias para revisão" texto="Confirmadas pela análise automática, na jurisdição do seu posto. Abra cada uma para aprovar ou arquivar." />

      <div className={TOOLBAR}>
        <CampoPesquisa valor={searchTerm} onMudar={setSearchTerm} rotulo="Pesquisar por matrícula" />
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          aria-label="Filtrar por tipo de infração"
          className={`${INPUT} !h-9 sm:!w-56`}
        >
          <option value="">Todos os tipos</option>
          {Object.entries(TIPO_LABEL)
            .filter(([tipo]) => tipo !== "ACIDENTE")
            .map(([tipo, label]) => (
              <option key={tipo} value={tipo}>{label}</option>
            ))}
        </select>
      </div>


      <div className={`${CARD_ATTACHED} overflow-hidden`}>
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
                  <th className={TABLE_HEAD_CELL}>Data</th>
                  <th className={TABLE_HEAD_CELL}>Confiança</th>
                  <th className={TABLE_HEAD_CELL}><span className="sr-only">Abrir</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <LinhasEsqueleto colunas={6} />
                ) : filtradas.length === 0 ? (
                  <LinhaVazia colunas={6}>
                      {denuncias.length === 0 ? "Não há denúncias à espera de decisão." : "Nenhuma denúncia desta página corresponde aos filtros."}
                    </LinhaVazia>
                ) : (
                  filtradas.map((d) => (
                    <tr key={d.id} className={TABLE_ROW_HOVER}>
                      <td className="px-6 py-3.5 text-sm text-gray-500">{d.id}</td>
                      <td className="px-6 py-3.5 text-sm font-medium text-gray-900">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {d.matricula}
                          {d.localizacao_contraditoria && (
                            <span className={`${BADGE} bg-blue-600 text-white`}><AlertTriangle size={12} /> possível falsa</span>
                          )}
                          {!!d.total_relacionadas && (
                            <span className={`${BADGE} bg-blue-50 text-blue-800`}>
                              +{d.total_relacionadas} {d.total_relacionadas === 1 ? "testemunha" : "testemunhas"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-gray-700">{labelTipo(d.tipo_infracao)}</td>
                      <td className="px-6 py-3.5 text-sm text-gray-500 whitespace-nowrap">{formatarDataHora(d.data_captura || d.data_registo)}</td>
                      <td className="px-6 py-3.5 text-sm">
                        {d.confianca != null ? (
                          <span className={`${BADGE} ${toneConfianca(d.confianca)}`}>
                            {Math.round(d.confianca * 100)}%
                          </span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Link
                          to={`/pt/denuncias/${d.id}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          Analisar <ChevronRight size={16} />
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
