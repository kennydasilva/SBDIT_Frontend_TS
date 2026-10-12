import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { CONTAINER, BTN_PRIMARY } from "./publicUi";

const LINKS = [
  { para: "/", texto: "Início" },
  { para: "/guia", texto: "Guia" },
  { para: "/sobre", texto: "Sobre nós" },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E40AF]">
        <span className="text-[10px] font-bold text-white">SGDIT</span>
      </span>
      <span className="hidden text-sm font-semibold leading-tight text-[#1E40AF] lg:block">
        Sistema de Gestão de Denúncias
        <span className="block text-xs font-normal text-[#1E40AF]/80">Infrações de trânsito</span>
      </span>
    </Link>
  );
}

const classeLink = ({ isActive }: { isActive: boolean }) =>
  `border-b-2 py-1 text-sm font-medium transition-colors ${
    isActive ? "border-[#1E40AF] text-[#1E40AF]" : "border-transparent text-[#1E40AF]/80 hover:text-[#1E40AF]"
  }`;

// Cabeçalho e rodapé comuns às páginas públicas (Início, Guia, Sobre nós).
// O login e o registo ficam fora: têm o seu próprio ecrã.
export default function PublicLayout() {
  const { pathname } = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMenuAberto(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#1E40AF]">
      {/* Barra flutuante, sobre o fundo suave do topo de cada página */}
      <header className="fixed inset-x-0 top-0 z-40 px-4 pt-4">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white/95 shadow-lg shadow-[#1E40AF]/15 ring-1 ring-[#1E40AF]/10 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-2.5 sm:px-5">
            <Logo />

            <nav className="hidden items-center gap-7 md:flex">
              {LINKS.map((l) => (
                <NavLink key={l.para} to={l.para} end className={classeLink}>
                  {l.texto}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-semibold text-[#1E40AF] hover:underline">
                Entrar no sistema
              </Link>
              <Link to="/cadastrar" className={`${BTN_PRIMARY} hidden !px-5 !py-2 !shadow-none sm:inline-flex`}>
                Criar conta
              </Link>
              <button
                onClick={() => setMenuAberto((a) => !a)}
                className="p-1 text-[#1E40AF]/80 md:hidden"
                aria-label="Menu"
              >
                {menuAberto ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {menuAberto && (
            <nav className="flex flex-col border-t border-[#1E40AF]/10 px-5 pb-2 md:hidden">
              {[...LINKS, { para: "/cadastrar", texto: "Criar conta" }].map((l) => (
                <Link key={l.para} to={l.para} className="border-b border-[#1E40AF]/10 py-3 text-sm font-medium text-[#1E40AF]/80 last:border-0">
                  {l.texto}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-[#1E40AF]">
        <div className={`${CONTAINER} flex flex-col gap-4 py-8 text-sm text-white sm:flex-row sm:items-center sm:justify-between`}>
          <p>SGDIT — Sistema de Gestão de Denúncias de Infrações de Trânsito</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {LINKS.map((l) => (
              <Link key={l.para} to={l.para} className="hover:underline">
                {l.texto}
              </Link>
            ))}
            <Link to="/login" className="hover:underline">Entrar</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
