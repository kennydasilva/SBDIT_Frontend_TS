import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";

interface CampoProps {
  rotulo: string;
  /** Marca o campo como opcional (os obrigatórios não levam asterisco). */
  opcional?: boolean;
  ajuda?: ReactNode;
  erro?: string;
  children: ReactNode;
  className?: string;
}

// Um campo de formulário: rótulo por cima, ajuda e erro por baixo, ligados
// ao controlo para leitores de ecrã.
export default function Campo({ rotulo, opcional, ajuda, erro, children, className = "" }: CampoProps) {
  const id = useId();
  const descricao = [ajuda ? `${id}-ajuda` : null, erro ? `${id}-erro` : null].filter(Boolean).join(" ") || undefined;
  const controlo = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        id: (children.props as { id?: string }).id ?? id,
        "aria-describedby": descricao,
        "aria-invalid": erro ? true : undefined,
      })
    : children;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-800">
        {rotulo}
        {opcional && <span className="ml-1.5 font-normal text-gray-500">(opcional)</span>}
      </label>
      {controlo}
      {ajuda && !erro && (
        <p id={`${id}-ajuda`} className="mt-1.5 text-xs text-gray-500">
          {ajuda}
        </p>
      )}
      {erro && (
        <p id={`${id}-erro`} className="mt-1.5 text-xs font-medium text-rose-600">
          {erro}
        </p>
      )}
    </div>
  );
}

/** Secção de formulário: título e explicação à esquerda, campos à direita. */
export function SeccaoFormulario({ titulo, texto, children }: { titulo: string; texto?: ReactNode; children: ReactNode }) {
  return (
    <section className="grid gap-x-10 gap-y-4 border-t border-gray-200 py-6 first:border-0 first:pt-0 last:pb-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <div>
        <h2 className="text-base font-semibold text-gray-900">{titulo}</h2>
        {texto && <p className="mt-1 text-sm text-gray-600">{texto}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

/** Dados só de leitura, como texto (não como campos desactivados). */
export function Dados({ itens }: { itens: { rotulo: string; valor: ReactNode }[] }) {
  return (
    <dl className="divide-y divide-gray-200">
      {itens.map((i) => (
        <div key={i.rotulo} className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
          <dt className="text-sm text-gray-600">{i.rotulo}</dt>
          <dd className="break-words text-sm font-medium text-gray-900">{i.valor || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
