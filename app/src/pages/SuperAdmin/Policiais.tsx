import { useEffect, useState } from "react";
import { superAdminService } from "../../api/superAdminService";
import { relatorioService } from "../../api/relatorioService";
import type { PT } from "../../api/ptService";
import Paginacao from "../../components/Paginacao";
import PageHeader from "../../components/app/PageHeader";
import { PaginaEsqueleto } from "../../components/app/Carregando";
import { CampoPesquisa, ErroPagina, LinhaVazia } from "../../components/app/Lista";
import {
  PAGE, TOOLBAR, CARD_ATTACHED, INPUT, TABLE_HEAD_CELL, TABLE_CELL, TABLE_CELL_STRONG, TABLE_ROW_HOVER,
} from "../../utils/uiClasses";

const TAMANHO_PAGINA = 10;

export default function Policiais() {
  const [policiais, setPoliciais] = useState<PT[]>([]);
  const [postos, setPostos] = useState<Record<number, string>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAdmin, setFilterAdmin] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalItens, setTotalItens] = useState(0);

  useEffect(() => {
    carregarPoliciais(paginaAtual);
  }, [paginaAtual]);

  // Nome do posto de cada agente (a lista só traz o id do Admin do posto).
  useEffect(() => {
    relatorioService
      .listarPostos()
      .then((lista) => setPostos(Object.fromEntries(lista.map((p) => [p.id, p.posto]))))
      .catch(() => {});
  }, []);

  const carregarPoliciais = async (pagina: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await superAdminService.listarPts(pagina, TAMANHO_PAGINA);
      setPoliciais(data.results);
      setTotalItens(data.count);
    } catch (err) {
      setError("Erro ao carregar os agentes.");
    } finally {
      setLoading(false);
    }
  };

  const nomePosto = (adminId: number) => postos[adminId] ?? `Posto n.º ${adminId}`;

  const filteredPoliciais = policiais.filter(policial => {
    const matchesSearch =
      policial.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policial.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterAdmin === "Todos" || String(policial.admin_id) === filterAdmin;
    return matchesSearch && matchesFilter;
  });

  const admins = Array.from(new Set(policiais.map(p => p.admin_id)));

  if (loading) return <PaginaEsqueleto />;

  if (error) return <ErroPagina mensagem={error} onTentar={() => carregarPoliciais(paginaAtual)} />;

  return (
    <div className={PAGE}>
      <PageHeader
        titulo="Agentes de trânsito"
        texto="Todos os agentes do sistema. Cada agente é criado e gerido pelo Admin do seu posto."
      />

      <div className={TOOLBAR}>
        <CampoPesquisa valor={searchTerm} onMudar={setSearchTerm} rotulo="Pesquisar por nome ou email" />
        <select
          value={filterAdmin}
          onChange={(e) => setFilterAdmin(e.target.value)}
          aria-label="Filtrar por posto"
          className={`${INPUT} !h-10 sm:!w-64`}
        >
          <option value="Todos">Todos os postos</option>
          {admins.map(id => (
            <option key={id} value={String(id)}>{nomePosto(id)}</option>
          ))}
        </select>
      </div>

      <div className={`${CARD_ATTACHED} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className={TABLE_HEAD_CELL}>N.º de agente</th>
                <th className={TABLE_HEAD_CELL}>Nome</th>
                <th className={TABLE_HEAD_CELL}>Email</th>
                <th className={TABLE_HEAD_CELL}>Posto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPoliciais.length === 0 ? (
                <LinhaVazia colunas={4}>
                  {policiais.length === 0 ? "Ainda não há agentes registados." : "Nenhum agente corresponde à pesquisa."}
                </LinhaVazia>
              ) : (
                filteredPoliciais.map((policial) => (
                  <tr key={policial.id} className={TABLE_ROW_HOVER}>
                    <td className={`${TABLE_CELL_STRONG} whitespace-nowrap`}>{policial.numero_agente}</td>
                    <td className={`${TABLE_CELL} whitespace-nowrap text-gray-900`}>{policial.nome}</td>
                    <td className={`${TABLE_CELL} whitespace-nowrap`}>{policial.email}</td>
                    <td className={`${TABLE_CELL} whitespace-nowrap`}>{nomePosto(policial.admin_id)}</td>
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
