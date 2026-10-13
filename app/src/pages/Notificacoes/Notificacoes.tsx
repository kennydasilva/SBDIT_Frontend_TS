import { useEffect, useState } from "react";

import { useNavigate } from "react-router";

import {
  Bell, BellOff, CheckCheck, Loader2, AlertTriangle, FileText, RefreshCw, Siren, ShieldCheck, ClipboardList, Link2,
} from "../../components/icons";

import { useAuth } from "../../hooks/useAuth";

import { notificacaoService, type Notificacao } from "../../api/notificacaoService";

import EmptyState from "../../components/app/EmptyState";
import { ErroBloco, Segmentos } from "../../components/app/Lista";

import Paginacao from "../../components/Paginacao";
import { CARD, BUTTON_SECONDARY, PAGE } from "../../utils/uiClasses";
import PageHeader from "../../components/app/PageHeader";
import { formatarDataHora } from "../../utils/datas";


const TAMANHO_PAGINA = 10;

const ICONE_TIPO: Record<Notificacao["tipo"], { icon: typeof Bell; cor: string }> = {
  DENUNCIA_RECEBIDA: { icon: FileText, cor: "text-blue-600" },
  ESTADO_ALTERADO: { icon: RefreshCw, cor: "text-blue-600" },
  NOVA_PARA_REVISAO: { icon: ClipboardList, cor: "text-blue-600" },
  ACIDENTE_REPORTADO: { icon: Siren, cor: "text-blue-600" },
  AGENTE_DESIGNADO: { icon: ShieldCheck, cor: "text-blue-600" },
  ANALISE_FALHOU: { icon: AlertTriangle, cor: "text-blue-600" },
  DENUNCIA_RELACIONADA: { icon: Link2, cor: "text-blue-600" },
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

  return (
    <div className={PAGE}>
      <PageHeader
        titulo="Notificações" texto="Avisos sobre as denúncias que lhe dizem respeito. Abra um aviso para ver a denúncia."
        acoes={
          <button
            onClick={marcarTodas}
            className={`${BUTTON_SECONDARY} whitespace-nowrap`}
            disabled={aMarcarTodas || !haNaoLidas}
          >
            {aMarcarTodas ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck size={16} />}
            Marcar todas como lidas
          </button>
        }
      />

      <div className="mb-4">
        <Segmentos
          rotulo="Filtrar notificações"
          valor={soNaoLidas ? "por-ler" : "todas"}
          onMudar={(v) => mudarFiltro(v === "por-ler")}
          opcoes={[
            { valor: "todas", rotulo: "Todas" },
            { valor: "por-ler", rotulo: "Por ler" },
          ]}
        />
      </div>

      <div className={`${CARD} overflow-hidden`}>
        {loading ? (
          <div className="space-y-4 p-6" role="status" aria-label="A carregar">
            {[0, 1, 2].map((i) => <div key={i} className="h-12 animate-pulse rounded bg-gray-200" />)}
          </div>
        ) : error ? (
          <ErroBloco mensagem={error} onTentar={() => carregar(paginaAtual, soNaoLidas)} />
        ) : notificacoes.length === 0 ? (
          <EmptyState
            icon={BellOff}
            titulo={soNaoLidas ? "Não tem notificações por ler" : "Ainda não tem notificações"}
            texto="É avisado aqui sempre que uma denúncia que lhe diz respeito muda de estado."
          />
        ) : (
          <ul className="divide-y divide-gray-200">
            {notificacoes.map((n) => {
              const { icon: Icon, cor } = ICONE_TIPO[n.tipo] ?? { icon: Bell, cor: "text-gray-600" };
              const temDestino = !!destino(user?.role, n);

              return (
                <li key={n.id}>
                  <button
                    onClick={() => abrir(n)}
                    className={`w-full text-left flex gap-4 px-6 py-3.5 transition-colors hover:bg-gray-50 ${
                      n.lida ? "" : "bg-blue-50"
                    } ${temDestino || !n.lida ? "cursor-pointer" : "cursor-default"}`}
                  >
                    <Icon size={16} className={`mt-0.5 shrink-0 ${cor}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm ${n.lida ? "text-gray-700" : "font-semibold text-gray-900"}`}>
                          {n.titulo}
                        </p>
                        {!n.lida && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{n.mensagem}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatarDataHora(n.criada_em)}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
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
