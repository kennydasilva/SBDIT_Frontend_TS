import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export interface Stat {
  rotulo: string;
  valor: ReactNode;
  /** Nota curta por baixo do valor (o que o número significa). */
  nota?: string;
  /** Torna a contagem numa ligação para a lista correspondente. */
  para?: string;
}

// Contagens numa só faixa com divisórias, em vez de um cartão por número:
// lêem-se de uma vez e não competem com o conteúdo da página.
export default function StatStrip({ itens, className = "" }: { itens: Stat[]; className?: string }) {
  return (
    <dl
      className={`grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-gray-200 bg-gray-200 sm:auto-cols-fr sm:grid-flow-col sm:grid-cols-none ${className}`}
    >
      {itens.map((s) => {
        const corpo = (
          <>
            <dt className="text-sm text-gray-600">{s.rotulo}</dt>
            <dd className="mt-1 text-2xl font-semibold leading-none text-gray-900 tabular-nums">{s.valor}</dd>
            {s.nota && <dd className="mt-1.5 text-xs text-gray-500">{s.nota}</dd>}
          </>
        );
        return s.para ? (
          <Link key={s.rotulo} to={s.para} className="block bg-white px-5 py-4 transition-colors last:odd:col-span-2 hover:bg-blue-50 sm:last:odd:col-span-1">
            {corpo}
          </Link>
        ) : (
          <div key={s.rotulo} className="bg-white px-5 py-4 last:odd:col-span-2 sm:last:odd:col-span-1">
            {corpo}
          </div>
        );
      })}
    </dl>
  );
}
