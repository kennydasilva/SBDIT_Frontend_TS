import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, FileText, Plus, Archive, CheckCircle2, Clock } from "../../components/icons";
import { useAuth } from "../../hooks/useAuth";
import { denunciaService, type DenunciaDetalhada } from "../../api/denunciaService";
import { cidadaoService, type RankingEntry } from "../../api/cidadaoService";
import PageHeader from "../../components/app/PageHeader";
import StatStrip from "../../components/app/StatStrip";
import EstadoBadge from "../../components/app/EstadoBadge";
import EmptyState from "../../components/app/EmptyState";
import { PaginaEsqueleto } from "../../components/app/Carregando";
import { ErroPagina } from "../../components/app/Lista";
import { labelTipo } from "../../utils/estadoDenuncia";
import { formatarDataHora } from "../../utils/datas";
import {
  PAGE, CARD, CARD_HEADER, CARD_TITLE, LINK, BUTTON_PRIMARY,
  TABLE_HEAD_CELL, TABLE_CELL, TABLE_CELL_STRONG, TABLE_ROW_HOVER,
} from "../../utils/uiClasses";

// Quantas denúncias mostrar em "Últimas denúncias" (as restantes estão
// em "Minhas Denúncias").
const RECENTES = 3;

// Estados em que a denúncia ainda está a ser tratada.
const EM_CURSO = ["PENDENTE", "VALIDADA", "DUVIDOSA", "ENCAMINHADA", "EM_ATENDIMENTO"];

export default function CidadaoDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [denuncias, setDenuncias] = useState<DenunciaDetalhada[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [meuCodigo, setMeuCodigo] = useState<string | null>(null);
  const [nome, setNome] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      carregarDenuncias();
      carregarRanking();
    }
  }, [authLoading, user]);

  const carregarRanking = async () => {
    if (!user) return;
    try {
      const [rankingData, perfil] = await Promise.all([
        cidadaoService.ranking(),
        cidadaoService.getCidadaoId(user.id),
      ]);
      setRanking(rankingData);
      setMeuCodigo(perfil.codigo_ranking ?? null);
      setNome(perfil.nome ?? null);
    } catch (err) {
      // ranking é um extra motivacional, falha silenciosa não deve bloquear o dashboard
      console.error("Erro ao carregar ranking:", err);
    }
  };

  const carregarDenuncias = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      // Pede o máximo por página para os totais por estado; o total geral
      // vem da contagem do servidor. Na lista só aparecem as mais recentes.
      const { results: data, count } = await denunciaService.listarPorCidadao(user.id, 1, 100);
      setDenuncias(data);
      setTotal(count);
    } catch (err) {
      setError("Erro ao carregar as suas denúncias.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PaginaEsqueleto />;

  if (error) return <ErroPagina mensagem={error} onTentar={carregarDenuncias} />;

  const contar = (estados: string[]) => denuncias.filter((d) => estados.includes(d.estado)).length;
  const primeiroNome = nome?.trim().split(/\s+/)[0];

  return (
    <div className={PAGE}>
      <PageHeader
        titulo={primeiroNome ? `Olá, ${primeiroNome}` : "Painel do cidadão"}
        texto="Denuncie uma infração de trânsito ou um acidente e acompanhe o que acontece a seguir."
        acoes={
          <Link to="/cidadao/criar-denuncia" className={BUTTON_PRIMARY}>
            <Plus size={14} />
            Criar denúncia
          </Link>
        }
      />

      {total > 0 && (
        <StatStrip
          className="mb-6"
          itens={[
            { icon: FileText, rotulo: "Denúncias enviadas", valor: total, para: "/cidadao/minhas-denuncias" },
            { icon: Clock, rotulo: "Em curso", valor: contar(EM_CURSO), nota: "À espera da análise ou da decisão" },
            { icon: CheckCircle2, rotulo: "Resolvidas", valor: contar(["APROVADA", "CONCLUIDA"]), nota: "Aprovadas ou acidentes concluídos" },
            { icon: Archive, rotulo: "Sem seguimento", valor: contar(["REJEITADA", "ARQUIVADA"]), nota: "Rejeitadas ou arquivadas" },
          ]}
        />
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className={`${CARD} overflow-hidden`}>
          <div className={CARD_HEADER}>
            <h2 className={CARD_TITLE}>Últimas denúncias</h2>
            {total > 0 && (
              <Link to="/cidadao/minhas-denuncias" className={`${LINK} inline-flex items-center gap-1.5 text-sm`}>
                Ver todas
                <ArrowRight size={12} />
              </Link>
            )}
          </div>
          {denuncias.length === 0 ? (
            <EmptyState
              icon={FileText}
              titulo="Ainda não fez nenhuma denúncia"
              texto="Precisa de um vídeo da infração, da matrícula do veículo e do local. Num acidente basta o local."
              acao={<Link to="/cidadao/criar-denuncia" className={BUTTON_PRIMARY}>Criar a primeira denúncia</Link>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className={TABLE_HEAD_CELL}>N.º</th>
                    <th className={TABLE_HEAD_CELL}>Matrícula</th>
                    <th className={TABLE_HEAD_CELL}>Tipo</th>
                    <th className={TABLE_HEAD_CELL}>Data</th>
                    <th className={TABLE_HEAD_CELL}>Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {denuncias.slice(0, RECENTES).map((d) => (
                    <tr key={d.id} className={TABLE_ROW_HOVER}>
                      <td className={`${TABLE_CELL} text-gray-600`}>
                        <Link to={`/cidadao/denuncias/${d.id}`} className={LINK}>#{d.id}</Link>
                      </td>
                      <td className={`${TABLE_CELL_STRONG} whitespace-nowrap`}>{d.matricula || "Sem matrícula"}</td>
                      <td className={`${TABLE_CELL} whitespace-nowrap`}>{labelTipo(d.tipo_infracao)}</td>
                      <td className={`${TABLE_CELL} whitespace-nowrap`}>{formatarDataHora(d.data_captura || d.data_registo)}</td>
                      <td className={TABLE_CELL}><EstadoBadge estado={d.estado} tipo={d.tipo_infracao} paraCidadao /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {ranking.length > 0 && (
          <section className={CARD}>
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className={CARD_TITLE}>Cidadãos mais activos</h2>
              <p className="mt-1 text-sm text-gray-600">
                A lista é anónima: cada cidadão só reconhece o seu próprio código.
              </p>
            </div>
            <ol className="divide-y divide-gray-200">
              {ranking.map((entrada) => {
                const souEu = meuCodigo !== null && entrada.codigo === meuCodigo;
                return (
                  <li
                    key={entrada.codigo}
                    className={`flex items-center justify-between gap-3 px-6 py-2.5 text-sm ${souEu ? "bg-blue-50" : ""}`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="w-6 shrink-0 text-gray-500 tabular-nums">{entrada.posicao}.º</span>
                      <span className={`truncate ${souEu ? "font-semibold text-blue-800" : "font-medium text-gray-900"}`}>
                        {entrada.codigo}
                        {souEu && " (o seu código)"}
                      </span>
                    </span>
                    <span className="shrink-0 text-gray-600 tabular-nums">
                      {entrada.numero_denuncias} {entrada.numero_denuncias === 1 ? "denúncia" : "denúncias"}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        )}
      </div>
    </div>
  );
}
