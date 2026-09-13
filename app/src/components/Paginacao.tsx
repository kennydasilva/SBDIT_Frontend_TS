import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginacaoProps {
  paginaAtual: number;
  totalItens: number;
  tamanhoPagina: number;
  onMudarPagina: (pagina: number) => void;
  disabled?: boolean;
}

// Navegação Anterior/Seguinte partilhada pelas páginas de listagem que
// consomem endpoints paginados do backend (DRF PageNumberPagination,
// page_size=20). Não usa `next`/`previous` do backend para decidir se pode
// avançar - dá para calcular localmente a partir de `count` e evita ficar
// preso caso a API mude o formato da URL.
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
    <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-white">
      <p className="text-sm text-gray-600">
        Mostrando <span className="font-medium">{primeiroItem}</span> a{" "}
        <span className="font-medium">{ultimoItem}</span> de{" "}
        <span className="font-medium">{totalItens}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onMudarPagina(paginaAtual - 1)}
          disabled={disabled || paginaAtual <= 1}
          className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
        >
          <ChevronLeft size={16} />
          Anterior
        </button>
        <span className="text-sm text-gray-600 px-1">
          Página {paginaAtual} de {totalPaginas}
        </span>
        <button
          type="button"
          onClick={() => onMudarPagina(paginaAtual + 1)}
          disabled={disabled || paginaAtual >= totalPaginas}
          className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
        >
          Seguinte
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
