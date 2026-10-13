// Estados de carregamento: o esqueleto ocupa o lugar do conteúdo que vem,
// em vez de um spinner no meio do ecrã.

const BARRA = "animate-pulse rounded bg-gray-200";

/** Linhas de uma tabela a carregar. */
export function LinhasEsqueleto({ colunas, linhas = 5 }: { colunas: number; linhas?: number }) {
  return (
    <>
      {Array.from({ length: linhas }, (_, l) => (
        <tr key={l} aria-hidden>
          {Array.from({ length: colunas }, (_, c) => (
            <td key={c} className="px-6 py-3.5">
              <div className={`${BARRA} h-4`} style={{ width: `${c === 0 ? 40 : 55 + ((l + c) % 3) * 15}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/** Página inteira a carregar: título, faixa de contagens e um bloco. */
export function PaginaEsqueleto() {
  return (
    <div className="p-4 sm:p-6 lg:p-8" role="status" aria-label="A carregar">
      <div className={`${BARRA} h-7 w-56`} />
      <div className={`${BARRA} mt-2 h-4 w-80 max-w-full`} />
      <div className={`${BARRA} mt-6 h-20 w-full`} />
      <div className={`${BARRA} mt-6 h-64 w-full`} />
    </div>
  );
}
