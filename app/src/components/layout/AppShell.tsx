import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Loader2, type LucideIcon } from "lucide-react";
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

  if (loading || carregando) {
    return (
      <div className="flex items-center justify-center h-screen gap-2 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        A carregar...
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const nomeVisivel = nome || user?.email || "";

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 shrink-0 bg-blue-800 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-white/10">
          <h1 className="text-xl font-bold tracking-tight">SGDIT</h1>
          <p className="text-sm text-blue-200">{subtitulo}</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const ativo = location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-colors ${
                  ativo ? "bg-white/15 text-white font-medium" : "text-blue-100 hover:bg-white/10"
                }`}
              >
                <Icon size={19} />
                <span>{item.label}</span>
                {item.path.endsWith("/notificacoes") && naoLidas > 0 && (
                  <span className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-rose-500 text-white text-xs font-semibold flex items-center justify-center">
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
              <p className="text-xs text-blue-200">{PAPEL_LABEL[user?.role ?? ""] ?? user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-1 flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-blue-100 hover:bg-white/10 transition-colors w-full"
          >
            <LogOut size={19} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
