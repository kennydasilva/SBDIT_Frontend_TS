import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Loader2, AlertTriangle, ChevronRight, CheckCircle2, XCircle, ClipboardList } from "lucide-react";
import { denunciaService, type DenunciaDetalhada } from "../../api/denunciaService";
import { useAuth } from "../../hooks/useAuth";
import Paginacao from "../../components/Paginacao";
import { labelEstado, labelTipo, toneEstado } from "../../utils/estadoDenuncia";
import { mensagemDeErro } from "../../utils/mensagens";
import {
  PAGE, PAGE_TITLE, PAGE_SUBTITLE, CARD, BADGE, BUTTON_PRIMARY, ICON_CHIP,
  TABLE_HEAD_CELL, TABLE_ROW_HOVER,
} from "../../utils/uiClasses";

const TAMANHO_PAGINA = 20;

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
      const data = await denunciaService.listarPorPt(user.id, pagina);
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
  const rejeitadas = denuncias.filter((d) => d.estado === "REJEITADA").length;

  const resumo = [
    { label: "Total de decisões", valor: totalItens, icon: ClipboardList, chip: ICON_CHIP("bg-blue-50", "text-blue-600") },
    { label: "Aprovadas", valor: aprovadas, icon: CheckCircle2, chip: ICON_CHIP("bg-emerald-50", "text-emerald-600") },
    { label: "Rejeitadas", valor: rejeitadas, icon: XCircle, chip: ICON_CHIP("bg-rose-50", "text-rose-600") },
  ];

  return (
    <div className={PAGE}>
      <div className="mb-8">
        <h1 className={PAGE_TITLE}>Minhas decisões</h1>
        <p className={PAGE_SUBTITLE}>Histórico das denúncias que analisou e das decisões tomadas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {resumo.map((r) => (
          <div key={r.label} className={`${CARD} p-5 flex items-center gap-4`}>
            <div className={r.chip}>
              <r.icon size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{r.label}</p>
              <p className="text-2xl font-semibold text-gray-900">{r.valor}</p>
            </div>
          </div>
        ))}
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
                  <th className={TABLE_HEAD_CELL}>Decisão</th>
                  <th className={TABLE_HEAD_CELL}>Código legal</th>
                  <th className={TABLE_HEAD_CELL}>Data</th>
                  <th className={TABLE_HEAD_CELL}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                    </td>
                  </tr>
                ) : denuncias.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                      Ainda não tomou nenhuma decisão
                    </td>
                  </tr>
                ) : (
                  denuncias.map((d) => (
                    <tr key={d.id} className={TABLE_ROW_HOVER}>
                      <td className="px-6 py-4 text-sm text-gray-500">{d.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{d.matricula || "—"}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{labelTipo(d.tipo_infracao)}</td>
                      <td className="px-6 py-4">
                        <span className={`${BADGE} ${toneEstado(d.estado)}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                          {labelEstado(d.estado, d.tipo_infracao)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{d.codigo_legal || "—"}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{d.data_captura || d.data_registo}</td>
                      <td className="px-6 py-4 text-right">
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
