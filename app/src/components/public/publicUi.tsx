import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

// Blocos visuais partilhados pelas páginas públicas (Início, Guia, Sobre
// nós). Só duas cores: branco e o azul do sistema (#1E40AF).
export const CONTAINER = "mx-auto max-w-6xl px-5";
export const SECTION = `${CONTAINER} py-14 lg:py-20`;
export const BTN_PRIMARY =
  "inline-flex items-center justify-center rounded-full bg-[#1E40AF] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90";
export const BTN_SECONDARY =
  "inline-flex items-center justify-center rounded-full border border-[#1E40AF] bg-white px-6 py-3 text-sm font-semibold text-[#1E40AF] transition-colors hover:bg-[#1E40AF] hover:text-white";
export const TEXT_LINK = "font-semibold text-[#1E40AF] underline underline-offset-4 hover:no-underline";
export const PANEL = "rounded-3xl bg-white shadow-xl shadow-[#1E40AF]/10 ring-1 ring-[#1E40AF]/10";

export function IconTile({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1E40AF] text-white">
      <Icon size={22} />
    </span>
  );
}

export function SectionTitle({ titulo, texto, id, centro }: { titulo: string; texto?: string; id?: string; centro?: boolean }) {
  return (
    <div id={id} className={`max-w-2xl scroll-mt-28 ${centro ? "mx-auto text-center" : ""}`}>
      <h2 className="text-3xl font-bold text-gray-900">{titulo}</h2>
      {texto && <p className="mt-3 text-gray-600">{texto}</p>}
    </div>
  );
}

// Lista "termo — explicação", com linhas finas entre as entradas.
export function Linhas({ itens }: { itens: { titulo: string; texto: React.ReactNode }[] }) {
  return (
    <dl className={`${PANEL} mt-6 divide-y divide-[#1E40AF]/10 px-6`}>
      {itens.map((i) => (
        <div key={i.titulo} className="grid gap-1 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-8">
          <dt className="font-semibold text-gray-900">{i.titulo}</dt>
          <dd className="text-gray-600">{i.texto}</dd>
        </div>
      ))}
    </dl>
  );
}

export const BTN_ON_BLUE =
  "inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1E40AF] transition-colors hover:opacity-90";
export const BTN_ON_BLUE_OUTLINE =
  "inline-flex items-center justify-center rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10";

// Topo das páginas interiores (Guia, Sobre nós): a mesma faixa azul do Início.
export function PageHeader({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <section className="relative bg-[#1E40AF]">
      <div className={`${CONTAINER} relative pb-14 pt-32 lg:pb-16 lg:pt-36`}>
        <h1 className="max-w-3xl text-4xl font-bold text-white sm:text-5xl">{titulo}</h1>
        <p className="mt-4 max-w-2xl text-lg text-white/85">{texto}</p>
      </div>
    </section>
  );
}

// Fecho igual em todas as páginas: registo do cidadão ou login.
export function Fecho() {
  return (
    <section className={`${CONTAINER} pb-16 lg:pb-20`}>
      <div className="relative overflow-hidden rounded-[2rem] bg-[#1E40AF] px-6 py-12 sm:px-12">
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold text-white">Pronto para denunciar?</h2>
            <p className="mt-2 text-white/85">
              Crie a sua conta de cidadão. Se já tem conta, ou é agente ou administrador de um posto, entre no sistema.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/cadastrar" className={`${BTN_ON_BLUE} whitespace-nowrap`}>Faça a sua primeira denúncia</Link>
            <Link to="/login" className={`${BTN_ON_BLUE_OUTLINE} whitespace-nowrap`}>Entrar no sistema</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
