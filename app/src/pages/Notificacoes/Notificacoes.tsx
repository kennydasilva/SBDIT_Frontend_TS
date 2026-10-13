import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Bell, BellOff, CheckCheck, Loader2, AlertTriangle, FileText, RefreshCw, Siren, ShieldCheck, ClipboardList, Link2, ChevronRight,
} from "../../components/icons";
import { useAuth } from "../../hooks/useAuth";
import { useNotificacoesNaoLidas } from "../../hooks/useNotificacoesNaoLidas";
import { notificacaoService, type Notificacao } from "../../api/notificacaoService";
import EmptyState from "../../components/app/EmptyState";
import { ErroBloco, Segmentos } from "../../components/app/Lista";
import Paginacao from "../../components/Paginacao";
import { PAGE, PAINEL } from "../../utils/uiClasses";
import { formatarData } from "../../utils/datas";
import PageHeader from "../../components/app/PageHeader";
import { formatarDataHora } from "../../utils/datas";


const TAMANHO_PAGINA = 10;

const TIPO: Record<Notificacao["tipo"], { icon: typeof Bell; rotulo: string }> = {
  DENUNCIA_RECEBIDA: { icon: FileText, rotulo: "Denúncia recebida" },
  ESTADO_ALTERADO: { icon: RefreshCw, rotulo: "Mudança de estado" },
  NOVA_PARA_REVISAO: { icon: ClipboardList, rotulo: "Nova para decidir" },
  ACIDENTE_REPORTADO: { icon: Siren, rotulo: "Acidente reportado" },
  AGENTE_DESIGNADO: { icon: ShieldCheck, rotulo: "Agente designado" },
  ANALISE_FALHOU: { icon: AlertTriangle, rotulo: "Análise falhou" },
  DENUNCIA_RELACIONADA: { icon: Link2, rotulo: "Denúncia relacionada" },
};


// Página onde abrir a denúncia a que a notificação se refere, conforme o
// papel de quem a lê (cada papel vê as denúncias num sítio diferente).
const destino = (role: string | undefined, n: Notificacao): string | null => {
  if (!n.denuncia_id) return null;
  switch (role) {
    case "CIDADAO":
      return `/cidadao/denuncias/${n.denuncia_id}`;
    case "PT":
      // O PT não tem ecrã de acidente: a designação traz o local na mensagem.
      return n.tipo === "AGENTE_DESIGNADO" ? null : `/pt/denuncias/${n.denuncia_id}`;
    case "ADMIN":
      // Acidentes têm ecrã próprio (é lá que se designa o agente).
      return n.tipo === "ACIDENTE_REPORTADO" ? "/admin/acidentes" : `/admin/denuncias/${n.denuncia_id}`;
    case "SUPER_ADMIN":
      return `/super-admin/denuncias/${n.denuncia_id}`;
    default:
      return null;
  }
};

// Partilhada pelos 4 perfis (Cidadão, PT, Admin, Super Admin): cada um só
// recebe do backend as suas próprias notificações.
export default function Notificacoes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [soNaoLidas, setSoNaoLidas] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalItens, setTotalItens] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aMarcarTodas, setAMarcarTodas] = useState(false);

  useEffect(() => {
    carregar(paginaAtual, soNaoLidas);
  }, [paginaAtual, soNaoLidas]);

  const carregar = async (pagina: number, filtro: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificacaoService.listar(pagina, filtro, TAMANHO_PAGINA);
      setNotificacoes(data.results);
      setTotalItens(data.count);
    } catch (err) {
      console.error("Erro ao carregar notificações:", err);
      setError("Erro ao carregar notificações");
    } finally {
      setLoading(false);
    }
  };

  const mudarFiltro = (filtro: boolean) => {
    setSoNaoLidas(filtro);
    setPaginaAtual(1);
  };

  const abrir = async (n: Notificacao) => {
    if (!n.lida) {
      try {
        await notificacaoService.marcarLida(n.id);
        setNotificacoes((lista) => lista.map((x) => (x.id === n.id ? { ...x, lida: true } : x)));
      } catch (err) {
        console.error("Erro ao marcar notificação como lida:", err);
      }
    }

    const caminho = destino(user?.role, n);
    if (caminho) navigate(caminho);
  };

  const marcarTodas = async () => {
    try {
      setAMarcarTodas(true);
      await notificacaoService.marcarTodasLidas();
      await carregar(paginaAtual, soNaoLidas);
    } catch (err) {
      console.error("Erro ao marcar notificações como lidas:", err);
    } finally {
      setAMarcarTodas(false);
    }
  };

  const haNaoLidas = notificacoes.some((n) => !n.lida);
  const porLer = useNotificacoesNaoLidas();

  // Agrupadas por dia, pela ordem em que chegam (da mais recente para a mais antiga).
  const porDia: { dia: string; itens: Notificacao[] }[] = [];
  for (const n of notificacoes) {
    const dia = formatarData(n.criada_em);
    const grupo = porDia[porDia.length - 1];
    if (grupo && grupo.dia === dia) grupo.itens.push(n);
    else porDia.push({ dia, itens: [n] });
  }
  const tiposNaPagina = Array.from(new Set(notificacoes.map((n) => n.tipo)));

  return (
    <div className={PAGE}>
      <PageHeader
        titulo="Notificações"
        texto="Avisos sobre as denúncias que lhe dizem respeito. Abra um aviso para ver a denúncia."
      />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          <div className={`${PAINEL} flex flex-wrap items-center justify-between gap-3 px-5 py-3.5`}>
            <Segmentos
              rotulo="Filtrar notificações"
              valor={soNaoLidas ? "por-ler" : "todas"}
              onMudar={(v) => mudarFiltro(v === "por-ler")}
              opcoes={[
                { valor: "todas", rotulo: "Todas" },
                { valor: "por-ler", rotulo: "Por ler", contagem: porLer },
              ]}
            />
            <p className="text-sm text-gray-600 tabular-nums">
              {totalItens} {totalItens === 1 ? "notificação" : "notificações"}
            </p>
          </div>

          {loading ? (
            <div className="mt-5 space-y-3" role="status" aria-label="A carregar">
              {[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-blue-100/70" />)}
            </div>
          ) : error ? (
            <div className={`${PAINEL} mt-5`}>
              <ErroBloco mensagem={error} onTentar={() => carregar(paginaAtual, soNaoLidas)} />
            </div>
          ) : notificacoes.length === 0 ? (
            <div className={`${PAINEL} mt-5`}>
              <EmptyState
                icon={BellOff}
                titulo={soNaoLidas ? "Não tem notificações por ler" : "Ainda não tem notificações"}
                texto="É avisado aqui sempre que uma denúncia que lhe diz respeito muda de estado."
              />
            </div>
          ) : (
            porDia.map((grupo) => (
              <section key={grupo.dia} className="mt-6">
                {/* Dia: rótulo com uma linha fina até ao fim */}
                <h2 className="flex items-center gap-3 text-xs font-semibold text-blue-800">
                  {grupo.dia}
                  <span className="h-px flex-1 bg-blue-200" aria-hidden />
                </h2>
                {/* Cada aviso é um cartão separado; o não lido tem contorno azul cheio. */}
                <ul className="mt-3 space-y-3">
                  {grupo.itens.map((n) => {
                    const { icon: Icon, rotulo } = TIPO[n.tipo] ?? { icon: Bell, rotulo: "Aviso" };
                    const temDestino = !!destino(user?.role, n);

                    return (
                      <li key={n.id}>
                        <button
                          onClick={() => abrir(n)}
                          className={`group flex w-full items-start gap-4 rounded-2xl p-5 text-left shadow-sm shadow-blue-600/5 transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/15 ${
                            n.lida
                              ? "bg-white ring-1 ring-blue-200 hover:ring-blue-400"
                              : "bg-blue-50 ring-2 ring-blue-600"
                          } ${temDestino || !n.lida ? "cursor-pointer" : "!cursor-default"}`}
                        >
                          <span
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                              n.lida ? "bg-blue-50 text-blue-600" : "bg-blue-600 text-white"
                            }`}
                          >
                            <Icon size={19} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className={`text-[15px] ${n.lida ? "font-semibold text-gray-800" : "font-bold text-gray-900"}`}>
                                {n.titulo}
                              </span>
                              {!n.lida && (
                                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white">Nova</span>
                              )}
                            </span>
                            <span className="mt-1.5 block text-sm leading-relaxed text-gray-600">{n.mensagem}</span>
                            <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-blue-100 pt-3 text-xs text-gray-500">
                              <span className={`rounded-md px-2 py-0.5 font-medium text-blue-800 ${n.lida ? "bg-blue-50" : "bg-white"}`}>{rotulo}</span>
                              {formatarDataHora(n.criada_em)}
                              {temDestino && (
                                <span className="ml-auto inline-flex items-center gap-1.5 font-semibold text-blue-600 group-hover:underline">
                                  Abrir denúncia
                                  <ChevronRight size={10} />
                                </span>
                              )}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}

          {totalItens > TAMANHO_PAGINA && (
            <div className={`${PAINEL} mt-5 overflow-hidden [&>nav]:border-t-0`}>
              <Paginacao
                paginaAtual={paginaAtual}
                totalItens={totalItens}
                tamanhoPagina={TAMANHO_PAGINA}
                onMudarPagina={setPaginaAtual}
                disabled={loading}
              />
            </div>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-6">
          <section className="rounded-2xl bg-blue-600 p-6 text-white shadow-lg shadow-blue-600/25">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-blue-800">
                <Bell size={20} />
              </span>
              <div>
                <p className="text-3xl font-bold leading-none tabular-nums">{porLer}</p>
                <p className="mt-1 text-sm text-blue-100">{porLer === 1 ? "notificação por ler" : "notificações por ler"}</p>
              </div>
            </div>
            <button
              onClick={marcarTodas}
              disabled={aMarcarTodas || !haNaoLidas}
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-blue-800 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/70"
            >
              {aMarcarTodas ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck size={14} />}
              Marcar todas como lidas
            </button>
          </section>

          {tiposNaPagina.length > 0 && (
            <section className={`${PAINEL} p-6`}>
              <h2 className="text-base font-bold text-blue-800">Tipos de aviso nesta página</h2>
              <ul className="mt-4 space-y-3">
                {tiposNaPagina.map((t) => {
                  const { icon: Icon, rotulo } = TIPO[t] ?? { icon: Bell, rotulo: "Aviso" };
                  return (
                    <li key={t} className="flex items-center gap-3 text-sm font-medium text-gray-800">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Icon size={15} />
                      </span>
                      {rotulo}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
