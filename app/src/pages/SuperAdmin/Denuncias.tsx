import { useEffect, useState } from "react";
import { Link } from "react-router";
import { superAdminService } from "../../api/superAdminService";
import { relatorioService } from "../../api/relatorioService";
import type { DenunciaDetalhada } from "../../api/denunciaService";
import Paginacao from "../../components/Paginacao";
import PageHeader from "../../components/app/PageHeader";
import StatStrip from "../../components/app/StatStrip";
import EstadoBadge from "../../components/app/EstadoBadge";
import { PaginaEsqueleto } from "../../components/app/Carregando";
import { CampoPesquisa, ErroPagina, LinhaVazia } from "../../components/app/Lista";
import { ESTADO_LABEL, labelTipo } from "../../utils/estadoDenuncia";
import { formatarDataHora } from "../../utils/datas";
import {
  PAGE, TOOLBAR, CARD_ATTACHED, INPUT, LINK,
  TABLE_HEAD_CELL, TABLE_CELL, TABLE_CELL_STRONG, TABLE_ROW_HOVER,
} from "../../utils/uiClasses";

const TAMANHO_PAGINA = 10;

export default function Denuncias() {
  const [denuncias, setDenuncias] = useState<DenunciaDetalhada[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("Todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalItens, setTotalItens] = useState(0);
  // Totais por estado de todas as denúncias (a lista vem paginada, por
  // isso não se podem contar a partir da página carregada).
  const [porEstado, setPorEstado] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    carregarDenuncias(paginaAtual);
  }, [paginaAtual]);

  useEffect(() => {
    relatorioService
      .obterResumo({})
      .then((r) => setPorEstado(r.por_estado))
      .catch(() => {});
  }, []);

  const carregarDenuncias = async (pagina: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await superAdminService.listarDenuncias(pagina, TAMANHO_PAGINA);
      setDenuncias(data.results);
      setTotalItens(data.count);
    } catch (err) {
      setError("Erro ao carregar as denúncias.");
    } finally {
      setLoading(false);
    }
  };

  const filteredDenuncias = denuncias.filter(denuncia => {
    const matchesSearch =
      denuncia.matricula?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      denuncia.localizacao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "Todos" || denuncia.estado === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading && denuncias.length === 0) return <PaginaEsqueleto />;

  if (error) return <ErroPagina mensagem={error} onTentar={() => carregarDenuncias(paginaAtual)} />;

  const n = (estado: string) => porEstado?.[estado] ?? 0;

  return (
    <div className={PAGE}>
      <PageHeader titulo="Denúncias" texto="Todas as denúncias do sistema, da mais recente para a mais antiga." />

      {porEstado && (
        <StatStrip
          className="mb-6"
          itens={[
            { rotulo: "Total", valor: totalItens },
            { rotulo: "À espera da análise", valor: n("PENDENTE") },
            { rotulo: "À espera do agente", valor: n("VALIDADA") + n("DUVIDOSA") },
            { rotulo: "Aprovadas", valor: n("APROVADA") },
            { rotulo: "Rejeitadas ou arquivadas", valor: n("REJEITADA") + n("ARQUIVADA") },
          ]}
        />
      )}

      <div className={TOOLBAR}>
        <CampoPesquisa valor={searchTerm} onMudar={setSearchTerm} rotulo="Pesquisar por matrícula ou local" />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          aria-label="Filtrar por estado"
          className={`${INPUT} !h-9 sm:!w-56`}
        >
          <option value="Todos">Todos os estados</option>
          {Object.entries(ESTADO_LABEL).map(([estado, rotulo]) => (
            <option key={estado} value={estado}>{rotulo}</option>
          ))}
        </select>
      </div>

      <div className={`${CARD_ATTACHED} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className={TABLE_HEAD_CELL}>N.º</th>
                <th className={TABLE_HEAD_CELL}>Matrícula</th>
                <th className={TABLE_HEAD_CELL}>Tipo</th>
                <th className={TABLE_HEAD_CELL}>Local</th>
                <th className={TABLE_HEAD_CELL}>Data</th>
                <th className={TABLE_HEAD_CELL}>Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDenuncias.length === 0 ? (
                <LinhaVazia colunas={6}>
                  {denuncias.length === 0 ? "Ainda não há denúncias." : "Nenhuma denúncia desta página corresponde aos filtros."}
                </LinhaVazia>
              ) : (
                filteredDenuncias.map((d) => (
                  <tr key={d.id} className={TABLE_ROW_HOVER}>
                    <td className={`${TABLE_CELL} whitespace-nowrap`}>
                      <Link to={`/super-admin/denuncias/${d.id}`} className={LINK}>#{d.id}</Link>
                    </td>
                    <td className={`${TABLE_CELL_STRONG} whitespace-nowrap`}>{d.matricula || "Sem matrícula"}</td>
                    <td className={`${TABLE_CELL} whitespace-nowrap`}>{labelTipo(d.tipo_infracao)}</td>
                    <td className={`${TABLE_CELL} max-w-xs truncate`} title={d.localizacao}>{d.localizacao || "—"}</td>
                    <td className={`${TABLE_CELL} whitespace-nowrap`}>{formatarDataHora(d.data_captura || d.data_registo)}</td>
                    <td className={TABLE_CELL}><EstadoBadge estado={d.estado} tipo={d.tipo_infracao} /></td>
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
