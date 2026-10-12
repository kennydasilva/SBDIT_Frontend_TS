import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowRight, LogIn } from "lucide-react";

// Blocos visuais partilhados pelas páginas públicas (Início, Guia, Sobre
// nós), para ficarem todas com o mesmo aspecto.
export const CONTAINER = "mx-auto max-w-6xl px-5";
export const SECTION = `${CONTAINER} py-16 lg:py-20`;
export const SOFT_CARD =
  "rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(30,64,175,0.18)] transition-all duration-300 hover:-trangray-y-0.5 hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_40px_-18px_rgba(30,64,175,0.28)]";
export const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#1E40AF] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/15 transition-all duration-300 hover:bg-[#2563EB] hover:shadow-blue-900/25";
export const BTN_SOFT =
  "inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-all duration-300 hover:border-blue-200 hover:bg-blue-50 hover:text-[#1E40AF]";

export function Chip({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#1E40AF]">
      <Icon size={22} strokeWidth={1.8} />
    </span>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-[#1E40AF]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#1E40AF]" />
      {children}
    </span>
  );
}

export function SectionHeading({ titulo, texto }: { titulo: string; texto?: string }) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-bold tracking-tight text-gray-900">{titulo}</h2>
      {texto && <p className="mt-3 text-gray-600">{texto}</p>}
    </div>
  );
}

// Topo das páginas interiores (Guia, Sobre nós).
export function PageHero({ etiqueta, titulo, texto }: { etiqueta: string; titulo: string; texto: string }) {
  return (
    <section className="bg-gradient-to-b from-blue-50/80 via-gray-50 to-white">
      <div className={`${CONTAINER} py-16 lg:py-20`}>
        <Eyebrow>{etiqueta}</Eyebrow>
        <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl">
          {titulo}
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-gray-600">{texto}</p>
      </div>
    </section>
  );
}

// Chamada final, igual em todas as páginas: registo do cidadão ou login.
export function CallToAction() {
  return (
    <section className="px-5 pb-16 lg:pb-20">
      <div className="mx-auto max-w-6xl rounded-[2rem] bg-gradient-to-br from-[#1E40AF] to-[#2563EB] px-6 py-14 text-center shadow-xl shadow-blue-900/15 sm:px-12">
        <h2 className="text-3xl font-bold tracking-tight text-white">Ajude a tornar as estradas mais seguras</h2>
        <p className="mx-auto mt-3 max-w-xl text-blue-100">
          Crie a sua conta de cidadão e faça a sua primeira denúncia. Já tem conta, ou é agente ou
          administrador de um posto? Entre no sistema.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/cadastrar"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1E40AF] transition-all duration-300 hover:bg-blue-50"
          >
            Faça a sua primeira denúncia
            <ArrowRight size={17} />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10"
          >
            <LogIn size={17} />
            Entrar no sistema
          </Link>
        </div>
      </div>
    </section>
  );
}
