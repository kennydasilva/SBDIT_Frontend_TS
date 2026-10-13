import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, CheckCircle2 } from "../../components/icons";
import { useAuth } from "../../hooks/useAuth";
import { ptService } from "../../api/ptService";
import { denunciaService, type DenunciaDetalhada } from "../../api/denunciaService";
import PageHeader from "../../components/app/PageHeader";
import StatStrip from "../../components/app/StatStrip";
import Destaque, { BOTAO_SOBRE_AZUL } from "../../components/app/Destaque";
import EstadoBadge from "../../components/app/EstadoBadge";
import EmptyState from "../../components/app/EmptyState";
import { PaginaEsqueleto } from "../../components/app/Carregando";
import { labelTipo } from "../../utils/estadoDenuncia";
import {
  PAGE, CARD, CARD_HEADER, CARD_TITLE, LINK, BUTTON_PRIMARY,
  TABLE_HEAD_CELL, TABLE_CELL, TABLE_CELL_STRONG, TABLE_ROW_HOVER,
} from "../../utils/uiClasses";

// Quantas decisões mostrar em "Últimas decisões dos agentes".
const RECENTES = 3;

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalPoliciais, setTotalPoliciais] = useState(0);
  const [recentes, setRecentes] = useState<DenunciaDetalhada[]>([]);
  const [acidentes, setAcidentes] = useState({ total: 0, porDesignar: 0 });

  useEffect(() => {
    if (!authLoading && user) {
      carregar();
    }
  }, [authLoading, user]);

  const carregar = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { results: pts } = await ptService.listarPT(user.id);
      setTotalPoliciais(pts.length);

      // Acidentes da jurisdição: os que ainda não têm agente são a
      // tarefa do Admin (o posto é lido do token no backend).
      denunciaService
        .listarAcidentesAdmin(1, 100)
        .then((r) => setAcidentes({ total: r.count, porDesignar: r.results.filter((a) => !a.pt_id).length }))
        .catch(() => {});

      const denunciasPorPt = await Promise.all(
        pts.map((pt) =>
          denunciaService
            .listarPorPt(pt.id)
            .then((r) => r.results)
            .catch(() => [])
        )
      );

      const todas = denunciasPorPt.flat().sort((a, b) => b.id - a.id).slice(0, RECENTES);
      setRecentes(todas);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PaginaEsqueleto />;

  return (
    <div className={PAGE}>
      <PageHeader titulo="Painel do posto" texto="Os acidentes e as decisões na jurisdição do seu posto." />

      {acidentes.porDesignar > 0 ? (
        <Destaque
          titulo={
            acidentes.porDesignar === 1
              ? "1 acidente à espera de um agente"
              : `${acidentes.porDesignar} acidentes à espera de um agente`
          }
          texto="Foram reportados na jurisdição do seu posto. Designe o agente que vai ao local."
          acao={
            <Link to="/admin/acidentes" className={BOTAO_SOBRE_AZUL}>
              Designar agentes
              <ArrowRight size={14} />
            </Link>
          }
        />
      ) : totalPoliciais === 0 ? (
        <Destaque
          titulo="O seu posto ainda não tem agentes"
          texto="Sem agentes não é possível designar ninguém para os acidentes nem decidir as denúncias da sua jurisdição."
          acao={<Link to="/admin/policiais" className={BOTAO_SOBRE_AZUL}>Criar o primeiro agente</Link>}
        />
      ) : null}

      <StatStrip
        className="mb-6"
        itens={[
          { rotulo: "Acidentes por designar", valor: acidentes.porDesignar, para: "/admin/acidentes" },
          { rotulo: "Acidentes reportados", valor: acidentes.total, para: "/admin/acidentes" },
          { rotulo: "Agentes do posto", valor: totalPoliciais, para: "/admin/policiais" },
        ]}
      />

      <section className={`${CARD} overflow-hidden`}>
        <div className={CARD_HEADER}>
          <h2 className={CARD_TITLE}>Últimas decisões dos agentes</h2>
          <Link to="/admin/relatorios" className={`${LINK} inline-flex items-center gap-1.5 text-sm`}>
            Ver relatórios
            <ArrowRight size={12} />
          </Link>
        </div>
        {recentes.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            titulo="Ainda não há decisões"
            texto="As denúncias que os agentes do seu posto aprovarem ou arquivarem aparecem aqui."
            acao={totalPoliciais === 0 ? <Link to="/admin/policiais" className={BUTTON_PRIMARY}>Criar agente</Link> : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className={TABLE_HEAD_CELL}>Matrícula</th>
                  <th className={TABLE_HEAD_CELL}>Tipo</th>
                  <th className={TABLE_HEAD_CELL}>Local</th>
                  <th className={TABLE_HEAD_CELL}>Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentes.map((d) => (
                  <tr key={d.id} className={TABLE_ROW_HOVER}>
                    <td className={`${TABLE_CELL_STRONG} whitespace-nowrap`}>
                      <Link to={`/admin/denuncias/${d.id}`} className="hover:text-blue-700 hover:underline">
                        {d.matricula || "Sem matrícula"}
                      </Link>
                    </td>
                    <td className={`${TABLE_CELL} whitespace-nowrap`}>{labelTipo(d.tipo_infracao)}</td>
                    <td className={`${TABLE_CELL} max-w-sm truncate`} title={d.localizacao}>{d.localizacao || "—"}</td>
                    <td className={TABLE_CELL}><EstadoBadge estado={d.estado} tipo={d.tipo_infracao} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
