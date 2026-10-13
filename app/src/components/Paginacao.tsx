import { ChevronLeft, ChevronRight } from "./icons";

interface PaginacaoProps {
  paginaAtual: number;
  totalItens: number;
  tamanhoPagina: number;
  onMudarPagina: (pagina: number) => void;
  disabled?: boolean;
}

const BOTAO =
  "inline-flex h-8 items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white";

// Navegação Anterior/Seguinte partilhada pelas páginas de listagem que
// consomem endpoints paginados do backend (DRF PageNumberPagination).
// Não usa `next`/`previous` do backend para decidir se pode avançar - dá
// para calcular localmente a partir de `count` e evita ficar preso caso a
// API mude o formato da URL.
export default function Paginacao({
  paginaAtual,
  totalItens,
  tamanhoPagina,
  onMudarPagina,
  disabled = false,
}: PaginacaoProps) {
  const totalPaginas = Math.max(1, Math.ceil(totalItens / tamanhoPagina));

  if (totalPaginas <= 1) {
    return null;
  }

  const primeiroItem = totalItens === 0 ? 0 : (paginaAtual - 1) * tamanhoPagina + 1;
  const ultimoItem = Math.min(paginaAtual * tamanhoPagina, totalItens);

  return (
    <nav
      aria-label="Paginação"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-6 py-3"
    >
      <p className="text-sm text-gray-600 tabular-nums">
        {primeiroItem}–{ultimoItem} de {totalItens}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onMudarPagina(paginaAtual - 1)}
          disabled={disabled || paginaAtual <= 1}
          className={BOTAO}
        >
          <ChevronLeft size={12} />
          Anterior
        </button>
        <span className="px-1 text-sm text-gray-600 tabular-nums">
          Página {paginaAtual} de {totalPaginas}
        </span>
        <button
          type="button"
          onClick={() => onMudarPagina(paginaAtual + 1)}
          disabled={disabled || paginaAtual >= totalPaginas}
          className={BOTAO}
        >
          Seguinte
          <ChevronRight size={12} />
        </button>
      </div>
    </nav>
  );
}
