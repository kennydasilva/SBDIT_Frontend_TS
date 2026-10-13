import type { ReactNode } from "react";
import type { LucideIcon } from "../icons";
import { ICONE_AZUL, PAINEL } from "../../utils/uiClasses";

// Peças das páginas de perfil (cidadão e agente), na linguagem visual das
// páginas públicas: quadrado azul com ícone, cartões de cantos redondos.


const iniciais = (nome?: string | null) => {
  const partes = (nome ?? "").trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
};

interface CartaoIdentidadeProps {
  nome?: string | null;
  papel: string;
  email?: string | null;
  /** Dados curtos por baixo do nome (registo, código, n.º de agente…). */
  itens: { icon: LucideIcon; rotulo: string; valor: ReactNode }[];
}

/** Quem é o utilizador: faixa azul, círculo com as iniciais e dados-chave. */
export function CartaoIdentidade({ nome, papel, email, itens }: CartaoIdentidadeProps) {
  return (
    <section className={`${PAINEL} overflow-hidden`}>
      <div className="h-24 bg-blue-600" />
      <div className="px-6 pb-6">
        <div className="-mt-12 flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white ring-4 ring-white">
          {iniciais(nome)}
        </div>
        <h2 className="mt-4 break-words text-xl font-bold text-gray-900">{nome || "—"}</h2>
        <p className="mt-1 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">{papel}</p>
        {email && <p className="mt-3 break-all text-sm text-gray-600">{email}</p>}

        <ul className="mt-5 space-y-3 border-t border-blue-100 pt-5">
          {itens.map((i) => (
            <li key={i.rotulo} className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <i.icon size={16} />
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-gray-500">{i.rotulo}</span>
                <span className="block break-words text-sm font-semibold text-gray-900">{i.valor || "—"}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Um bloco do perfil: ícone em quadrado azul, título, explicação e conteúdo. */
export function BlocoPerfil({
  icon: Icon, titulo, texto, children,
}: { icon: LucideIcon; titulo: string; texto?: ReactNode; children: ReactNode }) {
  return (
    <section className={`${PAINEL} p-6 sm:p-8`}>
      <div className="flex items-start gap-4">
        <span className={ICONE_AZUL}>
          <Icon size={18} />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-blue-800">{titulo}</h2>
          {texto && <p className="mt-0.5 text-sm text-gray-600">{texto}</p>}
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** Dados só de leitura em quadrículas, cada uma com o seu ícone. */
export function GrelhaDados({ itens }: { itens: { icon: LucideIcon; rotulo: string; valor: ReactNode }[] }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {itens.map((i) => (
        <div key={i.rotulo} className="flex min-w-0 items-center gap-3 rounded-xl bg-blue-50 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600">
            <i.icon size={16} />
          </span>
          <div className="min-w-0">
            <dt className="text-xs text-gray-500">{i.rotulo}</dt>
            <dd className="break-words text-sm font-semibold text-gray-900">{i.valor || "—"}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

/** Números do utilizador, em destaque. */
export function Numeros({ itens }: { itens: { icon: LucideIcon; rotulo: string; valor: ReactNode }[] }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-3">
      {itens.map((i) => (
        <div key={i.rotulo} className="rounded-xl bg-blue-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <dd className="text-3xl font-bold leading-none text-blue-800 tabular-nums">{i.valor}</dd>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
              <i.icon size={16} />
            </span>
          </div>
          <dt className="mt-3 text-sm font-medium text-gray-700">{i.rotulo}</dt>
        </div>
      ))}
    </dl>
  );
}
