import type { ReactNode } from "react";
import type { LucideIcon } from "../icons";

interface EmptyStateProps {
  icon?: LucideIcon;
  titulo: string;
  texto?: ReactNode;
  /** O passo seguinte (botão ou ligação). */
  acao?: ReactNode;
}

// Lista ou secção sem conteúdo: diz o que falta e o que fazer a seguir.
export default function EmptyState({ icon: Icon, titulo, texto, acao }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      {Icon && (
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon size={24} />
        </span>
      )}
      <p className="text-base font-bold text-blue-800">{titulo}</p>
      {texto && <p className="mt-1 max-w-md text-sm text-gray-600">{texto}</p>}
      {acao && <div className="mt-4">{acao}</div>}
    </div>
  );
}
