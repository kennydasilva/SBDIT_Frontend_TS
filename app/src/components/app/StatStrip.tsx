import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BarChart3, type LucideIcon } from "../icons";

export interface Stat {
  rotulo: string;
  valor: ReactNode;
  /** Ícone no quadrado azul do cartão. */
  icon?: LucideIcon;
  /** Nota curta por baixo do valor (o que o número significa). */
  nota?: string;
  /** Torna a contagem numa ligação para a lista correspondente. */
  para?: string;
}

const BASE = "flex items-start justify-between gap-3 rounded-2xl bg-white p-4 sm:gap-4 sm:p-5 shadow-lg shadow-blue-600/10 ring-1 ring-blue-600/10";

// Contagens em cartões, cada um com o número em destaque e o ícone do que
// conta num quadrado azul (o mesmo motivo das páginas públicas).
export default function StatStrip({ itens, className = "" }: { itens: Stat[]; className?: string }) {
  const colunas = itens.length >= 5 ? "xl:grid-cols-5" : itens.length === 4 ? "xl:grid-cols-4" : "lg:grid-cols-3";
  return (
    <dl className={`grid grid-cols-2 gap-3 sm:gap-4 ${colunas} ${className}`}>
      {itens.map((s) => {
        const Icon = s.icon ?? BarChart3;
        const corpo = (
          <>
            <div className="min-w-0">
              <dt className="text-sm font-medium text-gray-600">{s.rotulo}</dt>
              <dd className="mt-2 text-2xl font-bold leading-none sm:text-3xl text-blue-800 tabular-nums">{s.valor}</dd>
              {s.nota && <dd className="mt-2 text-xs text-gray-500">{s.nota}</dd>}
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white sm:h-12 sm:w-12 sm:rounded-xl">
              <Icon size={16} />
            </span>
          </>
        );
        return s.para ? (
          <Link key={s.rotulo} to={s.para} className={`${BASE} transition-all duration-200 hover:-translate-y-0.5 hover:ring-blue-600`}>
            {corpo}
          </Link>
        ) : (
          <div key={s.rotulo} className={BASE}>
            {corpo}
          </div>
        );
      })}
    </dl>
  );
}
