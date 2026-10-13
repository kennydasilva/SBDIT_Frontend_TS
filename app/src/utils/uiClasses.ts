// Classes Tailwind partilhadas, para manter um visual consistente em toda a
// aplicação em vez de repetir literais ligeiramente diferentes em cada
// página. Estilo sóbrio: cantos pouco arredondados, contornos de 1px em
// vez de sombras, campos e botões com a mesma altura, um só azul.

export const CARD =
  "bg-white rounded-2xl shadow-lg shadow-blue-600/10 ring-1 ring-blue-600/10";
// Linguagem visual das páginas públicas dentro da aplicação: painel de
// cantos redondos com sombra azulada, quadrado azul com ícone branco e
// botões maiores. Usada nos ecrãs do cidadão e nos perfis.
export const PAINEL = "rounded-2xl bg-white shadow-lg shadow-blue-600/10 ring-1 ring-blue-600/10";
export const ICONE_AZUL = "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white";
export const BOTAO_GRANDE = "!px-6";

export const CARD_HOVER = `${CARD} hover:ring-blue-600 transition-shadow`;

export const INPUT =
  "w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:bg-gray-50 disabled:text-gray-500 transition-colors";

// Caixa de texto de várias linhas: mesma moldura do INPUT, altura livre.
export const TEXTAREA =
  "block w-full min-h-28 px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm leading-relaxed text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:bg-gray-50 disabled:text-gray-500 transition-colors resize-y";

export const LABEL =
  "block text-sm font-medium text-gray-800 mb-1.5";

export const BUTTON_PRIMARY =
  "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-sm shadow-blue-600/30 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export const BUTTON_SECONDARY =
  "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl border border-gray-300 bg-white text-gray-800 text-sm font-semibold hover:bg-blue-50 hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export const BUTTON_DANGER =
  "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export const ICON_CHIP = (bg: string, fg: string) => `${bg} ${fg} p-2.5 rounded-md`;

// Tons de estado em badges/pílulas, com as cores convencionais.
export const STATUS_TONES: Record<string, string> = {
  amber: "bg-amber-100 text-amber-900", // à espera
  blue: "bg-sky-100 text-sky-800", // em curso (azul-céu)
  emerald: "bg-emerald-100 text-emerald-800", // concluído
  rose: "bg-rose-100 text-rose-800", // rejeitado / a exigir atenção
  gray: "bg-gray-100 text-gray-600", // fechado sem seguimento
};

export const BADGE =
  "inline-flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-semibold";

export const TABLE_HEAD_CELL =
  "relative px-6 py-3 text-left text-xs font-semibold text-blue-800 whitespace-nowrap";
export const TABLE_CELL = "px-6 py-3.5 text-sm text-gray-700";
// Identificador ou matrícula: a coluna que identifica a linha.
export const TABLE_CELL_STRONG = "px-6 py-3.5 text-sm font-medium text-gray-900";
export const TABLE_ROW_HOVER =
  "hover:bg-blue-50/60 transition-colors";

// Estrutura de página: todas as páginas internas usam o mesmo fundo,
// margens e hierarquia de títulos.
export const PAGE =
  "p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full";
export const PAGE_TITLE = "text-2xl font-bold text-blue-800 tracking-tight";
export const PAGE_SUBTITLE = "text-sm text-gray-600 mt-1";
export const SECTION_TITLE = "text-lg font-bold text-blue-800";

export const FIELD_ERROR = "mt-1 text-xs text-rose-600";
export const FIELD_HINT = "mt-1 text-xs text-gray-500";

// Cabeçalho de um bloco (cartão com lista ou tabela) e a sua ligação "ver tudo".
export const CARD_HEADER = "flex items-center justify-between gap-4 border-b border-gray-200 px-6 py-4";
export const CARD_TITLE = "text-lg font-bold text-blue-800";

// Caixas de aviso dentro da página (em vez de alert() do browser).
export const ALERT_ERROR = "rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800";
export const ALERT_SUCCESS = "rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900";
export const ALERT_WARNING = "rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900";
export const ALERT_INFO = "rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900";

export const LINK = "text-blue-600 hover:text-blue-700 hover:underline font-medium";

// Barra de pesquisa e filtros colada ao topo da tabela que filtra (em
// vez de um cartão solto por cima): usa-se com CARD_ATTACHED na tabela.
export const TOOLBAR =
  "flex flex-wrap items-center gap-3 rounded-t-2xl border border-b-0 border-gray-200 bg-white px-5 py-4";
export const CARD_ATTACHED = "bg-white rounded-b-2xl border border-gray-200 shadow-lg shadow-blue-600/10";

// Botão só com ícone (editar, eliminar) nas linhas das tabelas.
export const ICON_BUTTON =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-50";
export const ICON_BUTTON_DANGER =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors disabled:opacity-50";

export const MODAL_TITLE = "text-xl font-bold text-blue-800 [&+div]:mt-5";
export const MODAL_TEXT = "mt-2 text-sm text-gray-600";
// Acções do modal à direita, a principal por último.
export const MODAL_FOOTER = "mt-6 flex flex-wrap justify-end gap-2";

export const MODAL_OVERLAY = "fixed inset-0 bg-blue-900/50 flex items-center justify-center z-50 p-4";
export const MODAL_CARD =
  "bg-white rounded-2xl shadow-2xl shadow-blue-900/30 w-full max-w-md p-6 sm:p-7 max-h-[calc(100dvh-2rem)] overflow-y-auto";
