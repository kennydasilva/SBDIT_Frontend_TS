import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Loader2, Menu, X, type LucideIcon } from "../icons";
import { useAuth } from "../../hooks/useAuth";
import { useNotificacoesNaoLidas } from "../../hooks/useNotificacoesNaoLidas";
import { logout } from "../../api/authService";

export interface ItemMenu {
  path: string;
  icon: LucideIcon;
  label: string;
}

const PAPEL_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Administrador",
  ADMIN: "Administrador do posto",
  PT: "Agente de trânsito",
  CIDADAO: "Cidadão",
};

const iniciais = (texto?: string | null) => {
  if (!texto) return "?";
  const base = texto.includes("@") ? texto.split("@")[0].replace(/[._-]+/g, " ") : texto;
  const partes = base.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
};

interface AppShellProps {
  subtitulo: string;
  menuItems: ItemMenu[];
  /** Nome a mostrar no rodapé (se já for conhecido); senão usa o email. */
  nome?: string | null;
  carregando?: boolean;
}

/**
 * Estrutura comum das 4 áreas (Super Admin, Admin, Agente, Cidadão):
 * barra lateral, contador de notificações por ler, sair e conteúdo.
 */
export default function AppShell({ subtitulo, menuItems, nome, carregando }: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const naoLidas = useNotificacoesNaoLidas();
  // Em ecrãs pequenos a barra lateral fica escondida e abre por cima do
  // conteúdo (menu); a partir de `lg` está sempre visível.
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    setMenuAberto(false);
  }, [location.pathname]);

  if (loading || carregando) {
    return (
      <div className="flex h-screen items-center justify-center gap-2 text-sm text-gray-600" role="status">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        A carregar…
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    // Sair leva à página inicial pública, não ao ecrã de login.
    navigate("/");
  };

  const nomeVisivel = nome || user?.email || "";

  return (
    <div className="flex h-screen bg-gray-50">
      {menuAberto && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMenuAberto(false)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 bg-blue-800 text-white flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          menuAberto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 py-5 border-b border-white/10 flex items-start justify-between">
          <div>
            <p className="text-lg font-bold leading-tight tracking-tight">SGDIT</p>
            <p className="text-sm text-blue-100">{subtitulo}</p>
          </div>
          <button
            onClick={() => setMenuAberto(false)}
            className="p-1 -mr-2 rounded-md text-blue-100 hover:bg-white/10 lg:hidden"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav aria-label="Menu principal" className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const ativo = location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={ativo ? "page" : undefined}
                className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors focus-visible:outline-white ${
                  ativo ? "bg-white font-semibold text-blue-800" : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={16} className="shrink-0" />
                <span>{item.label}</span>
                {item.path.endsWith("/notificacoes") && naoLidas > 0 && (
                  <span className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums ${ativo ? "bg-blue-600 text-white" : "bg-white text-blue-800"}`}>
                    {naoLidas > 99 ? "99+" : naoLidas}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 shrink-0 rounded-full bg-white/15 flex items-center justify-center text-sm font-semibold">
              {iniciais(nomeVisivel)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{nomeVisivel}</p>
              <p className="text-xs text-blue-100">{PAPEL_LABEL[user?.role ?? ""] ?? user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-1 flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm text-blue-100 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-white"
          >
            <LogOut size={16} className="shrink-0" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden shrink-0 flex items-center gap-3 bg-blue-800 text-white px-4 py-3">
          <button
            onClick={() => setMenuAberto(true)}
            className="relative p-1 -ml-1 rounded-md hover:bg-white/10"
            aria-label="Abrir menu"
          >
            <Menu size={22} />
            {naoLidas > 0 && <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-white" />}
          </button>
          <div className="leading-tight">
            <p className="font-bold tracking-tight">SGDIT</p>
            <p className="text-xs text-blue-100">{subtitulo}</p>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {/* Largura máxima: em ecrãs muito largos as tabelas não se esticam de ponta a ponta. */}
          <div className="mx-auto min-h-full w-full max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
