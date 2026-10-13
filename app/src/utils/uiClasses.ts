// Classes Tailwind partilhadas, para manter um visual consistente em toda a
// aplicação em vez de repetir literais ligeiramente diferentes em cada
// página. Estilo sóbrio: cantos pouco arredondados, contornos de 1px em
// vez de sombras, campos e botões com a mesma altura, um só azul.

export const CARD =
  "bg-white rounded-lg border border-gray-200";
export const CARD_HOVER = `${CARD} hover:border-blue-600 transition-colors`;

export const INPUT =
  "w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:bg-gray-50 disabled:text-gray-500 transition-colors";

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
  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium";

export const TABLE_HEAD_CELL =
  "px-6 py-2.5 text-left text-xs font-semibold text-gray-600";
export const TABLE_ROW_HOVER =
  "hover:bg-gray-50 transition-colors";

// Estrutura de página: todas as páginas internas usam o mesmo fundo,
// margens e hierarquia de títulos.
export const PAGE =
  "p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full";
export const PAGE_TITLE = "text-2xl font-semibold text-blue-800 tracking-tight";
export const PAGE_SUBTITLE = "text-gray-500 mt-1";
export const SECTION_TITLE = "text-lg font-semibold text-gray-900";

export const FIELD_ERROR = "mt-1 text-xs text-rose-600";
export const FIELD_HINT = "mt-1 text-xs text-gray-500";

// Caixas de aviso dentro da página (em vez de alert() do browser).
export const ALERT_ERROR = "rounded-md border border-rose-100 bg-rose-50 p-4 text-sm text-rose-800";
export const ALERT_SUCCESS = "rounded-md border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800";
export const ALERT_WARNING = "rounded-md border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800";
export const ALERT_INFO = "rounded-md border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800";

export const LINK = "text-blue-600 hover:text-blue-700 hover:underline font-medium";

export const MODAL_OVERLAY = "fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4";
export const MODAL_CARD =
  "bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-md p-6";
