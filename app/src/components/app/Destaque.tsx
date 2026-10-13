import type { ReactNode } from "react";

interface DestaqueProps {
  titulo: ReactNode;
  texto?: ReactNode;
  /** A acção que resolve o que o destaque anuncia. */
  acao?: ReactNode;
}

// A tarefa do momento no topo de um painel: uma só por página, em azul
// cheio, para se distinguir das contagens e das listas.
export default function Destaque({ titulo, texto, acao }: DestaqueProps) {
  return (
    <section className="mb-6 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 rounded-2xl bg-blue-600 px-6 py-6 text-white shadow-lg shadow-blue-600/25 sm:px-8">
      <div className="min-w-0">
        <h2 className="text-xl font-bold leading-snug">{titulo}</h2>
        {texto && <p className="mt-1 max-w-[65ch] text-sm text-blue-100">{texto}</p>}
      </div>
      {acao && <div className="shrink-0">{acao}</div>}
    </section>
  );
}

// Botão para usar sobre o azul do destaque.
export const BOTAO_SOBRE_AZUL =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-blue-800 transition-colors hover:bg-blue-50";
