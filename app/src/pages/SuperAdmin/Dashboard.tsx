import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight } from "../../components/icons";
import api from "../../api/axios";
import type { PaginatedResponse } from "../../api/types";
import type { DenunciaDetalhada } from "../../api/denunciaService";
import { relatorioService } from "../../api/relatorioService";
import PageHeader from "../../components/app/PageHeader";
import StatStrip from "../../components/app/StatStrip";
import EstadoBadge from "../../components/app/EstadoBadge";
import EmptyState from "../../components/app/EmptyState";
import { PaginaEsqueleto } from "../../components/app/Carregando";
import { ESTADO_LABEL, labelTipo } from "../../utils/estadoDenuncia";
import { formatarDataHora } from "../../utils/datas";
import {
  PAGE, CARD, CARD_HEADER, CARD_TITLE, LINK,
  TABLE_HEAD_CELL, TABLE_CELL, TABLE_CELL_STRONG, TABLE_ROW_HOVER,
} from "../../utils/uiClasses";

// Quantas denúncias mostrar em "Últimas denúncias" (as restantes estão em "Denúncias").
const RECENTES = 3;

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [contagens, setContagens] = useState({ admins: 0, policiais: 0, cidadaos: 0, denuncias: 0 });
  const [recentes, setRecentes] = useState<DenunciaDetalhada[]>([]);
  const [porEstado, setPorEstado] = useState<Record<string, number>>({});

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    try {
      setLoading(true);

      const [admins, pts, cidadaos, denuncias] = await Promise.all([
        api.get<PaginatedResponse<unknown>>("/admins/?page_size=1"),
        api.get<PaginatedResponse<unknown>>("/pts/?page_size=1"),
        api.get<PaginatedResponse<unknown>>("/cidadao/lista/?page_size=1"),
        api.get<PaginatedResponse<unknown>>(`/denuncias/?page_size=${RECENTES}&ordering=-data_registo`),
      ]);

      setContagens({
        admins: admins.data.count,
        policiais: pts.data.count,
        cidadaos: cidadaos.data.count,
        denuncias: denuncias.data.count,
      });
      setRecentes(denuncias.data.results as DenunciaDetalhada[]);

      // Totais por estado de todas as denúncias (não só as da página).
      relatorioService
        .obterResumo({})
        .then((r) => setPorEstado(r.por_estado))
        .catch(() => {});
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PaginaEsqueleto />;

  // O resumo devolve os estados já com o nome por extenso ou com a chave
  // do backend; mostra-se sempre o nome em português, do maior para o menor.
  const estados = Object.entries(porEstado)
    .map(([chave, total]) => ({ rotulo: ESTADO_LABEL[chave] ?? chave, total }))
    .filter((e) => e.total > 0)
    .sort((a, b) => b.total - a.total);
  const maior = Math.max(1, ...estados.map((e) => e.total));

  return (
    <div className={PAGE}>
      <PageHeader titulo="Visão geral" texto="O estado do sistema em todos os postos." />

      <StatStrip
        className="mb-6"
        itens={[
          { rotulo: "Denúncias", valor: contagens.denuncias.toLocaleString("pt"), para: "/super-admin/denuncias" },
          { rotulo: "Postos (administradores)", valor: contagens.admins.toLocaleString("pt"), para: "/super-admin/admins" },
          { rotulo: "Agentes", valor: contagens.policiais.toLocaleString("pt"), para: "/super-admin/policiais" },
          { rotulo: "Cidadãos", valor: contagens.cidadaos.toLocaleString("pt"), para: "/super-admin/cidadaos" },
        ]}
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className={`${CARD} overflow-hidden`}>
          <div className={CARD_HEADER}>
            <h2 className={CARD_TITLE}>Últimas denúncias</h2>
            <Link to="/super-admin/denuncias" className={`${LINK} inline-flex items-center gap-1.5 text-sm`}>
              Ver todas
              <ArrowRight size={12} />
            </Link>
          </div>
          {recentes.length === 0 ? (
            <EmptyState
              titulo="Ainda não há denúncias"
              texto="As denúncias aparecem aqui assim que os cidadãos as enviarem."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className={TABLE_HEAD_CELL}>Matrícula</th>
                    <th className={TABLE_HEAD_CELL}>Tipo</th>
                    <th className={TABLE_HEAD_CELL}>Data</th>
                    <th className={TABLE_HEAD_CELL}>Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentes.map((d) => (
                    <tr key={d.id} className={TABLE_ROW_HOVER}>
                      <td className={`${TABLE_CELL_STRONG} whitespace-nowrap`}>
                        <Link to={`/super-admin/denuncias/${d.id}`} className="hover:text-blue-700 hover:underline">
                          {d.matricula || "Sem matrícula"}
                        </Link>
                      </td>
                      <td className={`${TABLE_CELL} whitespace-nowrap`}>{labelTipo(d.tipo_infracao)}</td>
                      <td className={`${TABLE_CELL} whitespace-nowrap`}>{formatarDataHora(d.data_captura || d.data_registo)}</td>
                      <td className={TABLE_CELL}><EstadoBadge estado={d.estado} tipo={d.tipo_infracao} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {estados.length > 0 && (
          <section className={CARD}>
            <div className={CARD_HEADER}>
              <h2 className={CARD_TITLE}>Denúncias por estado</h2>
              <Link to="/super-admin/relatorios" className={`${LINK} text-sm`}>Relatórios</Link>
            </div>
            <ul className="space-y-3 px-6 py-5">
              {estados.map((e) => (
                <li key={e.rotulo}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-gray-700">{e.rotulo}</span>
                    <span className="font-semibold text-gray-900 tabular-nums">{e.total}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-gray-100" aria-hidden>
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${(e.total / maior) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
