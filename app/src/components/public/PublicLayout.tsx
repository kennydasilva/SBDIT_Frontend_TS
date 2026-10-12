import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { LogIn, Menu, X } from "lucide-react";
import { CONTAINER } from "./publicUi";

const LINKS = [
  { para: "/", texto: "Início" },
  { para: "/guia", texto: "Guia" },
  { para: "/sobre", texto: "Sobre nós" },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1E40AF] shadow-md shadow-blue-900/20">
        <span className="text-[11px] font-bold text-white">SGDIT</span>
      </span>
      <span className="hidden text-sm font-semibold leading-tight text-gray-900 lg:block">
        Sistema de Gestão de Denúncias
        <span className="block text-xs font-normal text-gray-500">Infrações de trânsito</span>
      </span>
    </Link>
  );
}

const classeLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
    isActive ? "bg-blue-50 text-[#1E40AF]" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className={`${CONTAINER} flex items-center justify-between gap-4 py-3`}>
          <Logo />

          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <NavLink key={l.para} to={l.para} end className={classeLink}>
                {l.texto}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-[#1E40AF] transition-colors duration-300 hover:bg-blue-50"
            >
              <LogIn size={16} />
              <span className="hidden sm:inline">Entrar no sistema</span>
              <span className="sm:hidden">Entrar</span>
            </Link>
            <Link
              to="/cadastrar"
              className="hidden rounded-full bg-[#1E40AF] px-5 py-2 text-sm font-medium text-white shadow-md shadow-blue-900/15 transition-colors duration-300 hover:bg-[#2563EB] sm:inline-flex"
            >
              Criar conta
            </Link>
            <button
              onClick={() => setMenuAberto((a) => !a)}
              className="rounded-full p-2 text-gray-600 hover:bg-gray-50 md:hidden"
              aria-label="Menu"
            >
              {menuAberto ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuAberto && (
          <nav className={`${CONTAINER} flex flex-col gap-1 pb-4 md:hidden`}>
            {LINKS.map((l) => (
              <NavLink key={l.para} to={l.para} end className={classeLink}>
                {l.texto}
              </NavLink>
            ))}
            <Link to="/cadastrar" className="rounded-full bg-[#1E40AF] px-4 py-2 text-center text-sm font-medium text-white">
              Criar conta
            </Link>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-100 bg-gray-50/60">
        <div className={`${CONTAINER} flex flex-col items-center justify-between gap-5 py-8 md:flex-row`}>
          <Logo />
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-600">
            {LINKS.map((l) => (
              <Link key={l.para} to={l.para} className="transition-colors hover:text-[#1E40AF]">
                {l.texto}
              </Link>
            ))}
            <Link to="/login" className="transition-colors hover:text-[#1E40AF]">Entrar</Link>
            <Link to="/cadastrar" className="transition-colors hover:text-[#1E40AF]">Criar conta</Link>
          </nav>
          <p className="text-xs text-gray-500">SGDIT — Denúncias de Infrações de Trânsito</p>
        </div>
      </footer>
    </div>
  );
}
