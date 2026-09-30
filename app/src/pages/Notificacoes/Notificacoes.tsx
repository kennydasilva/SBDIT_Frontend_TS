import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Bell, BellOff, CheckCheck, Loader2, AlertTriangle, FileText, RefreshCw, Siren, ShieldCheck, ClipboardList,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { notificacaoService, type Notificacao } from "../../api/notificacaoService";
import Paginacao from "../../components/Paginacao";
import { CARD, BUTTON_PRIMARY, BUTTON_SECONDARY } from "../../utils/uiClasses";

const TAMANHO_PAGINA = 20;

const ICONE_TIPO: Record<Notificacao["tipo"], { icon: typeof Bell; cor: string }> = {
  DENUNCIA_RECEBIDA: { icon: FileText, cor: "bg-blue-50 text-blue-600" },
  ESTADO_ALTERADO: { icon: RefreshCw, cor: "bg-violet-50 text-violet-600" },
  NOVA_PARA_REVISAO: { icon: ClipboardList, cor: "bg-amber-50 text-amber-600" },
  ACIDENTE_REPORTADO: { icon: Siren, cor: "bg-rose-50 text-rose-600" },
  AGENTE_DESIGNADO: { icon: ShieldCheck, cor: "bg-emerald-50 text-emerald-600" },
  ANALISE_FALHOU: { icon: AlertTriangle, cor: "bg-rose-50 text-rose-600" },
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
      return n.tipo === "ACIDENTE_REPORTADO" ? "/admin/acidentes" : null;
    case "SUPER_ADMIN":
      return "/super-admin/denuncias";
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
      const data = await notificacaoService.listar(pagina, filtro);
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
    <div className="p-8 bg-gray-50/50 min-h-full">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Notificações</h1>
          <p className="text-gray-500 mt-1">Actualizações sobre as denúncias que lhe dizem respeito</p>
        </div>
        <button
          onClick={marcarTodas}
          className={BUTTON_SECONDARY}
          disabled={aMarcarTodas || !haNaoLidas}
        >
          {aMarcarTodas ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck size={16} />}
          Marcar todas como lidas
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { valor: false, label: "Todas" },
          { valor: true, label: "Por ler" },
        ].map((f) => (
          <button
            key={f.label}
            onClick={() => mudarFiltro(f.valor)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              soNaoLidas === f.valor
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className={`${CARD} overflow-hidden`}>
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <p className="text-rose-600">{error}</p>
            <button onClick={() => carregar(paginaAtual, soNaoLidas)} className={`${BUTTON_PRIMARY} mt-4`}>
              Tentar Novamente
            </button>
          </div>
        ) : notificacoes.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <BellOff className="mx-auto mb-3 text-gray-300" size={36} />
            {soNaoLidas ? "Não tem notificações por ler" : "Ainda não tem notificações"}
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {notificacoes.map((n) => {
              const { icon: Icon, cor } = ICONE_TIPO[n.tipo] ?? { icon: Bell, cor: "bg-gray-100 text-gray-600" };
              const temDestino = !!destino(user?.role, n);

              return (
                <li key={n.id}>
                  <button
                    onClick={() => abrir(n)}
                    className={`w-full text-left flex gap-4 px-6 py-4 transition-colors hover:bg-gray-50/60 ${
                      n.lida ? "" : "bg-blue-50/40"
                    } ${temDestino || !n.lida ? "cursor-pointer" : "cursor-default"}`}
                  >
                    <div className={`${cor} p-2.5 rounded-xl h-fit shrink-0`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm ${n.lida ? "text-gray-700" : "font-semibold text-gray-900"}`}>
                          {n.titulo}
                        </p>
                        {!n.lida && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{n.mensagem}</p>
                      <p className="text-xs text-gray-400 mt-1">{n.criada_em}</p>
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
