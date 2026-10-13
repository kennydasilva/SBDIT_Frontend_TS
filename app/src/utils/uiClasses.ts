// Classes Tailwind partilhadas, para manter um visual consistente em toda a
// aplicação em vez de repetir literais ligeiramente diferentes em cada
// página. Estilo sóbrio: cantos pouco arredondados, contornos de 1px em
// vez de sombras, campos e botões com a mesma altura, um só azul.

export const CARD =
  "bg-white rounded-lg border border-gray-200";
// Linguagem visual das páginas públicas dentro da aplicação: painel de
// cantos redondos com sombra azulada, quadrado azul com ícone branco e
// botões maiores. Usada nos ecrãs do cidadão e nos perfis.
export const PAINEL = "rounded-2xl bg-white shadow-lg shadow-blue-600/10 ring-1 ring-blue-600/10";
export const ICONE_AZUL = "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white";
export const BOTAO_GRANDE = "!h-11 !rounded-xl !px-6";

export const CARD_HOVER = `${CARD} hover:border-blue-600 transition-colors`;

export const INPUT =
  "w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:bg-gray-50 disabled:text-gray-500 transition-colors";

// Caixa de texto de várias linhas: mesma moldura do INPUT, altura livre.
export const TEXTAREA =
  "block w-full min-h-24 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm leading-relaxed text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:bg-gray-50 disabled:text-gray-500 transition-colors resize-y";

export const LABEL =
  "block text-sm font-medium text-gray-800 mb-1.5";

export const BUTTON_PRIMARY =
  "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export const BUTTON_SECONDARY =
  "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md border border-gray-300 bg-white text-gray-800 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export const BUTTON_DANGER =
  "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export const ICON_CHIP = (bg: string, fg: string) => `${bg} ${fg} p-2.5 rounded-md`;

// Tons de estado em badges/pílulas: um só azul, distinguido pelo
// preenchimento (as chaves são os nomes antigos, usados nas páginas).
export const STATUS_TONES: Record<string, string> = {
  amber: "bg-white text-blue-800 ring-1 ring-inset ring-blue-200", // à espera
  blue: "bg-blue-50 text-blue-800", // em curso
  emerald: "bg-blue-600 text-white", // concluído
  rose: "bg-gray-100 text-gray-600", // fechado sem seguimento
  gray: "bg-gray-100 text-gray-600",
};

export const BADGE =
  "inline-flex items-center gap-1.5 whitespace-nowrap px-2 py-0.5 rounded text-xs font-medium";

export const TABLE_HEAD_CELL =
  "relative px-6 py-2.5 text-left text-xs font-semibold text-gray-600 whitespace-nowrap";
export const TABLE_CELL = "px-6 py-3.5 text-sm text-gray-700";
// Identificador ou matrícula: a coluna que identifica a linha.
export const TABLE_CELL_STRONG = "px-6 py-3.5 text-sm font-medium text-gray-900";
export const TABLE_ROW_HOVER =
  "hover:bg-gray-50 transition-colors";

// Estrutura de página: todas as páginas internas usam o mesmo fundo,
// margens e hierarquia de títulos.
export const PAGE =
  "p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full";
export const PAGE_TITLE = "text-2xl font-semibold text-blue-800 tracking-tight";
export const PAGE_SUBTITLE = "text-sm text-gray-600 mt-1";
export const SECTION_TITLE = "text-lg font-semibold text-gray-900";

export const FIELD_ERROR = "mt-1 text-xs text-rose-600";
export const FIELD_HINT = "mt-1 text-xs text-gray-500";

// Cabeçalho de um bloco (cartão com lista ou tabela) e a sua ligação "ver tudo".
export const CARD_HEADER = "flex items-center justify-between gap-4 border-b border-gray-200 px-6 py-4";
export const CARD_TITLE = "text-base font-semibold text-gray-900";

// Caixas de aviso dentro da página (em vez de alert() do browser).
export const ALERT_ERROR = "rounded-md border border-rose-100 bg-rose-50 p-4 text-sm text-rose-800";
export const ALERT_SUCCESS = "rounded-md border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800";
export const ALERT_WARNING = "rounded-md border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800";
export const ALERT_INFO = "rounded-md border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800";

export const LINK = "text-blue-600 hover:text-blue-700 hover:underline font-medium";

// Barra de pesquisa e filtros colada ao topo da tabela que filtra (em
// vez de um cartão solto por cima): usa-se com CARD_ATTACHED na tabela.
export const TOOLBAR =
  "flex flex-wrap items-center gap-3 rounded-t-lg border border-b-0 border-gray-200 bg-white px-4 py-3";
export const CARD_ATTACHED = "bg-white rounded-b-lg border border-gray-200";

// Botão só com ícone (editar, eliminar) nas linhas das tabelas.
export const ICON_BUTTON =
  "inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors disabled:opacity-50";
export const ICON_BUTTON_DANGER =
  "inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-rose-50 hover:text-rose-700 transition-colors disabled:opacity-50";

export const MODAL_TITLE = "text-lg font-semibold text-gray-900 [&+div]:mt-5";
export const MODAL_TEXT = "mt-2 text-sm text-gray-600";
// Acções do modal à direita, a principal por último.
export const MODAL_FOOTER = "mt-6 flex flex-wrap justify-end gap-2";

export const MODAL_OVERLAY = "fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4";
export const MODAL_CARD =
  "bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-md p-6 max-h-[calc(100dvh-2rem)] overflow-y-auto";
