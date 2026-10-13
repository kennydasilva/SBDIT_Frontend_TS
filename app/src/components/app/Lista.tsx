import type { ReactNode } from "react";
import { AlertTriangle, Search } from "../icons";
import { BUTTON_SECONDARY } from "../../utils/uiClasses";

// Peças das páginas de listagem: pesquisa, filtro por segmentos e erro.

interface CampoPesquisaProps {
  valor: string;
  onMudar: (valor: string) => void;
  /** O que se pesquisa: serve de texto de exemplo e de nome para leitores de ecrã. */
  rotulo: string;
  className?: string;
}

export function CampoPesquisa({ valor, onMudar, rotulo, className = "" }: CampoPesquisaProps) {
  return (
    <div className={`relative w-full sm:max-w-xs ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
      <input
        type="search"
        value={valor}
        onChange={(e) => onMudar(e.target.value)}
        placeholder={rotulo}
        aria-label={rotulo}
        className="h-10 w-full rounded-xl border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
      />
    </div>
  );
}

interface SegmentosProps<T extends string> {
  opcoes: { valor: T; rotulo: string; contagem?: number }[];
  valor: T;
  onMudar: (valor: T) => void;
  /** Nome do grupo para leitores de ecrã (ex: "Filtrar por estado"). */
  rotulo: string;
}

// Escolha entre poucas opções, num só controlo com divisórias.
export function Segmentos<T extends string>({ opcoes, valor, onMudar, rotulo }: SegmentosProps<T>) {
  return (
    <div role="group" aria-label={rotulo} className="inline-flex max-w-full overflow-x-auto rounded-xl border border-gray-300 bg-white">
      {opcoes.map((o) => {
        const ativo = o.valor === valor;
        return (
          <button
            key={o.valor}
            type="button"
            aria-pressed={ativo}
            onClick={() => onMudar(o.valor)}
            className={`h-10 shrink-0 border-l border-gray-300 px-3 text-sm font-medium transition-colors first:border-l-0 ${
              ativo ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            {o.rotulo}
            {o.contagem !== undefined && (
              <span className={`ml-1.5 tabular-nums ${ativo ? "text-white/80" : "text-gray-500"}`}>{o.contagem}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Falha ao carregar: diz o que falhou e deixa tentar de novo, no lugar do conteúdo. */
export function ErroBloco({ mensagem, onTentar }: { mensagem: string; onTentar?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-12 text-center">
      <AlertTriangle size={24} className="mb-3 text-rose-600" />
      <p className="font-medium text-gray-900">{mensagem}</p>
      <p className="mt-1 text-sm text-gray-600">Verifique a ligação e tente outra vez.</p>
      {onTentar && (
        <button type="button" onClick={onTentar} className={`${BUTTON_SECONDARY} mt-4`}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}

/** Página inteira que não carregou. */
export function ErroPagina({ mensagem, onTentar }: { mensagem: string; onTentar?: () => void }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="rounded-2xl bg-white shadow-lg shadow-blue-600/10 ring-1 ring-blue-600/10">
        <ErroBloco mensagem={mensagem} onTentar={onTentar} />
      </div>
    </div>
  );
}

/** Linha única de uma tabela sem resultados. */
export function LinhaVazia({ colunas, children }: { colunas: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colunas} className="px-6 py-12 text-center text-sm text-gray-600">
        {children}
      </td>
    </tr>
  );
}
