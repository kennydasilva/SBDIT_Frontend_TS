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
    <section className="mb-6 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 rounded-lg bg-blue-600 px-6 py-5 text-white">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold leading-snug">{titulo}</h2>
        {texto && <p className="mt-1 max-w-[65ch] text-sm text-blue-100">{texto}</p>}
      </div>
      {acao && <div className="shrink-0">{acao}</div>}
    </section>
  );
}

// Botão para usar sobre o azul do destaque.
export const BOTAO_SOBRE_AZUL =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-blue-800 transition-colors hover:bg-blue-50";
