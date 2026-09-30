// Classes Tailwind partilhadas, para manter um visual consistente em toda a
// aplicação (cards mais suaves, sombras discretas, badges pastel em vez de
// cores saturadas) em vez de repetir literais ligeiramente diferentes em
// cada página.

export const CARD = "bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04)]";
export const CARD_HOVER = `${CARD} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`;

export const INPUT =
  "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors";

export const LABEL = "block text-sm font-medium text-gray-700 mb-1.5";

export const BUTTON_PRIMARY =
  "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export const BUTTON_SECONDARY =
  "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export const BUTTON_DANGER =
  "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export const ICON_CHIP = (bg: string, fg: string) => `${bg} ${fg} p-3 rounded-xl`;

// Paleta de estado usada em badges/pílulas (fundo pastel + texto na mesma família)
export const STATUS_TONES: Record<string, string> = {
  amber: "bg-amber-50 text-amber-700",
  blue: "bg-blue-50 text-blue-700",
  emerald: "bg-emerald-50 text-emerald-700",
  rose: "bg-rose-50 text-rose-700",
  gray: "bg-gray-100 text-gray-600",
};

export const BADGE = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium";

export const TABLE_HEAD_CELL = "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide";
export const TABLE_ROW_HOVER = "hover:bg-gray-50/60 transition-colors";

// Estrutura de página: todas as páginas internas usam o mesmo fundo,
// margens e hierarquia de títulos.
export const PAGE = "p-8 bg-gray-50/50 min-h-full";
export const PAGE_TITLE = "text-2xl font-semibold text-gray-900 tracking-tight";
export const PAGE_SUBTITLE = "text-gray-500 mt-1";
export const SECTION_TITLE = "text-lg font-semibold text-gray-900";

export const FIELD_ERROR = "mt-1 text-xs text-rose-600";
export const FIELD_HINT = "mt-1 text-xs text-gray-500";

// Caixas de aviso dentro da página (em vez de alert() do browser).
export const ALERT_ERROR = "rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-800";
export const ALERT_SUCCESS = "rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800";
export const ALERT_WARNING = "rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800";
export const ALERT_INFO = "rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800";

export const LINK = "text-blue-600 hover:text-blue-700 hover:underline font-medium";

export const MODAL_OVERLAY = "fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4";
export const MODAL_CARD = "bg-white rounded-2xl shadow-xl w-full max-w-md p-6";
