import { useEffect, useState } from "react";



import { Plus } from "../../components/icons";



import { Link } from "react-router";



import { useAuth } from "../../hooks/useAuth";



import { denunciaService, type DenunciaDetalhada } from "../../api/denunciaService";



import Paginacao from "../../components/Paginacao";
import { labelEstadoCidadao as labelEstado, labelTipo } from "../../utils/estadoDenuncia";



import EstadoBadge from "../../components/app/EstadoBadge";
import { INPUT, PAGE, TABLE_HEAD_CELL, TABLE_ROW_HOVER, TOOLBAR, CARD_ATTACHED, BUTTON_PRIMARY, LINK } from "../../utils/uiClasses";
import PageHeader from "../../components/app/PageHeader";
import { formatarDataHora } from "../../utils/datas";



import { CampoPesquisa, ErroBloco, LinhaVazia } from "../../components/app/Lista";



import { LinhasEsqueleto } from "../../components/app/Carregando";




const TAMANHO_PAGINA = 10;

const estados = [
  "Todos",
  "PENDENTE",
  "VALIDADA",
  "REJEITADA",
  "APROVADA",
  "ARQUIVADA",
  "ENCAMINHADA",
  "EM_ATENDIMENTO",
  "CONCLUIDA",
  "DUVIDOSA",
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

      const data= await denunciaService.listarPorCidadao(user.id, pagina, TAMANHO_PAGINA);
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
      <PageHeader
        titulo="Minhas denúncias"
        texto="Todas as denúncias que enviou e o estado de cada uma."
        acoes={
          <Link to="/cidadao/criar-denuncia" className={BUTTON_PRIMARY}>
            <Plus size={14} />
            Criar denúncia
          </Link>
        }
      />

      {/* Filters */}
      <div className={TOOLBAR}>
        <CampoPesquisa valor={searchTerm} onMudar={setSearchTerm} rotulo="Pesquisar por matrícula" />
        <select
          value={selectedEstado}
          onChange={(e) => setSelectedEstado(e.target.value)}
          aria-label="Filtrar por estado"
          className={`${INPUT} !h-10 sm:!w-56`}
        >
          {estados.map((estado) => (
            <option key={estado} value={estado}>
              {estado === "Todos" ? "Todos os estados" : labelEstado(estado)}
            </option>
          ))}
        </select>
      </div>


      {/* Table */}
      <div className={`${CARD_ATTACHED} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className={TABLE_HEAD_CELL}>N.º</th>
                <th className={TABLE_HEAD_CELL}>Matrícula</th>
                <th className={TABLE_HEAD_CELL}>Tipo</th>
                <th className={TABLE_HEAD_CELL}>Data</th>
                <th className={TABLE_HEAD_CELL}>Estado</th>
                <th className={TABLE_HEAD_CELL}><span className="sr-only">Abrir</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <LinhasEsqueleto colunas={6} />
              ) : error ? (
                <tr>
                  <td colSpan={6}><ErroBloco mensagem={error} onTentar={() => carregarDenuncias(paginaAtual)} /></td>
                </tr>
              ) : filteredDenuncias.length === 0 ? (
                <LinhaVazia colunas={6}>
                    {denuncias.length === 0 ? "Ainda não fez nenhuma denúncia." : "Nenhuma denúncia desta página corresponde aos filtros."}
                  </LinhaVazia>
              ) : (
                filteredDenuncias.map((denuncia) => (
                  <tr key={denuncia.id} className={TABLE_ROW_HOVER}>
                    <td className="px-6 py-3.5 text-sm font-medium text-gray-900">
                      #{denuncia.id}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-gray-900">
                      {denuncia.matricula}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-gray-900">
                      {labelTipo(denuncia.tipo_infracao)}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-gray-600">
                      {formatarDataHora(denuncia.data_captura)}
                    </td>
                    <td className="px-6 py-3.5">
                      <EstadoBadge estado={denuncia.estado} tipo={denuncia.tipo_infracao} paraCidadao />
                    </td>
                    <td className="px-6 py-3.5">
                      <Link to={`/cidadao/denuncias/${denuncia.id}`} className={`${LINK} text-sm`}>Ver detalhes</Link>
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
