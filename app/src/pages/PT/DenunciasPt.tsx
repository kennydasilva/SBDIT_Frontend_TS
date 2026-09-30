import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Search, Loader2, AlertTriangle, ChevronRight } from "lucide-react";
import { denunciaService, type DenunciaDetalhada } from "../../api/denunciaService";
import Paginacao from "../../components/Paginacao";
import { labelTipo, TIPO_LABEL } from "../../utils/estadoDenuncia";
import { mensagemDeErro } from "../../utils/mensagens";
import {
  PAGE, PAGE_TITLE, PAGE_SUBTITLE, CARD, INPUT, LABEL, BADGE, BUTTON_PRIMARY,
  TABLE_HEAD_CELL, TABLE_ROW_HOVER,
} from "../../utils/uiClasses";

const TAMANHO_PAGINA = 20;

// Cor da confiança da análise automática (0-1 no backend).
const toneConfianca = (c: number) =>
  c >= 0.75 ? "bg-emerald-50 text-emerald-700" : c >= 0.5 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700";

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
      const data = await denunciaService.listarValidadas(pagina);
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
      <div className="mb-8">
        <h1 className={PAGE_TITLE}>Denúncias para revisão</h1>
        <p className={PAGE_SUBTITLE}>
          Confirmadas pela análise automática, na jurisdição do seu posto. Abra cada uma para aprovar ou rejeitar.
        </p>
      </div>

      <div className={`${CARD} p-4 mb-6`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Pesquisar por matrícula</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Ex: AB-12-CD"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${INPUT} pl-10`}
              />
            </div>
          </div>
          <div>
            <label className={LABEL}>Tipo de infração</label>
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className={INPUT}>
              <option value="">Todos</option>
              {Object.entries(TIPO_LABEL)
                .filter(([tipo]) => tipo !== "ACIDENTE")
                .map(([tipo, label]) => (
                  <option key={tipo} value={tipo}>{label}</option>
                ))}
            </select>
          </div>
        </div>
      </div>

      <div className={`${CARD} overflow-hidden`}>
        {error ? (
          <div className="text-center py-14">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <p className="text-rose-600">{error}</p>
            <button onClick={() => carregarDenuncias(paginaAtual)} className={`${BUTTON_PRIMARY} mt-4`}>
              Tentar novamente
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className={TABLE_HEAD_CELL}>#</th>
                  <th className={TABLE_HEAD_CELL}>Matrícula</th>
                  <th className={TABLE_HEAD_CELL}>Tipo</th>
                  <th className={TABLE_HEAD_CELL}>Data</th>
                  <th className={TABLE_HEAD_CELL}>Confiança</th>
                  <th className={TABLE_HEAD_CELL}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                    </td>
                  </tr>
                ) : filtradas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      {denuncias.length === 0 ? "Não há denúncias à espera de revisão" : "Nenhuma denúncia corresponde aos filtros"}
                    </td>
                  </tr>
                ) : (
                  filtradas.map((d) => (
                    <tr key={d.id} className={TABLE_ROW_HOVER}>
                      <td className="px-6 py-4 text-sm text-gray-500">{d.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {d.matricula}
                          {d.localizacao_contraditoria && (
                            <span className={`${BADGE} bg-rose-50 text-rose-700`}>⚠️ possível falsa</span>
                          )}
                          {!!d.total_relacionadas && (
                            <span className={`${BADGE} bg-violet-50 text-violet-700`}>
                              +{d.total_relacionadas} {d.total_relacionadas === 1 ? "testemunha" : "testemunhas"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{labelTipo(d.tipo_infracao)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{d.data_captura || d.data_registo}</td>
                      <td className="px-6 py-4 text-sm">
                        {d.confianca != null ? (
                          <span className={`${BADGE} ${toneConfianca(d.confianca)}`}>
                            {Math.round(d.confianca * 100)}%
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
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
