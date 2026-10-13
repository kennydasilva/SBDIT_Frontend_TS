import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "../icons";

interface PageHeaderProps {
  titulo: ReactNode;
  texto?: ReactNode;
  /** Botões da página, alinhados à direita do título. */
  acoes?: ReactNode;
  /** Ligação "voltar" por cima do título (páginas de detalhe). */
  voltar?: { para: string; texto: string };
}

// Cabeçalho comum das páginas internas: o título diz onde se está, o
// texto diz o que ali se faz, e a acção principal fica sempre no mesmo sítio.
export default function PageHeader({ titulo, texto, acoes, voltar }: PageHeaderProps) {
  return (
    <header className="mb-6">
      {voltar && (
        <Link
          to={voltar.para}
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={14} />
          {voltar.texto}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold leading-tight tracking-tight text-blue-800">{titulo}</h1>
          {texto && <p className="mt-1 max-w-[70ch] text-sm text-gray-600">{texto}</p>}
        </div>
        {acoes && <div className="flex shrink-0 flex-wrap items-center gap-2">{acoes}</div>}
      </div>
    </header>
  );
}
