// Um só formato de data em toda a aplicação: "12/10/2026" e
// "12/10/2026, 10:58". O backend devolve datas em três formas (ISO,
// "AAAA-MM-DD" e "DD/MM/AAAA HH:MM:SS" já formatada); todas passam por aqui.

const DMA = /^(\d{2})\/(\d{2})\/(\d{4})(?:[ ,]+(\d{2}):(\d{2})(?::(\d{2}))?)?$/;

function interpretar(valor: string): { data: Date; temHora: boolean } | null {
  const texto = valor.trim();
  const dma = DMA.exec(texto);
  if (dma) {
    const [, d, m, a, h, min] = dma;
    return {
      data: new Date(Number(a), Number(m) - 1, Number(d), Number(h ?? 0), Number(min ?? 0)),
      temHora: h !== undefined,
    };
  }
  // "AAAA-MM-DD" sozinho é um dia do calendário, não um instante UTC.
  const soDia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto);
  if (soDia) {
    return { data: new Date(Number(soDia[1]), Number(soDia[2]) - 1, Number(soDia[3])), temHora: false };
  }
  const data = new Date(texto);
  return Number.isNaN(data.getTime()) ? null : { data, temHora: true };
}

const dois = (n: number) => String(n).padStart(2, "0");
const dia = (d: Date) => `${dois(d.getDate())}/${dois(d.getMonth() + 1)}/${d.getFullYear()}`;

/** "12/10/2026". Devolve "—" se não houver data. */
export function formatarData(valor?: string | null): string {
  if (!valor) return "—";
  const r = interpretar(valor);
  return r ? dia(r.data) : valor;
}

/** "12/10/2026, 10:58" (sem hora se a origem não a tiver). */
export function formatarDataHora(valor?: string | null): string {
  if (!valor) return "—";
  const r = interpretar(valor);
  if (!r) return valor;
  return r.temHora ? `${dia(r.data)}, ${dois(r.data.getHours())}:${dois(r.data.getMinutes())}` : dia(r.data);
}
