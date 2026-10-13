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
      {Icon && <Icon size={28} className="mb-3 text-blue-300" />}
      <p className="font-medium text-gray-900">{titulo}</p>
      {texto && <p className="mt-1 max-w-md text-sm text-gray-600">{texto}</p>}
      {acao && <div className="mt-4">{acao}</div>}
    </div>
  );
}
