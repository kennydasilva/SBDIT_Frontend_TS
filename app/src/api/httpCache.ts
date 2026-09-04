import type { AxiosInstance, AxiosRequestConfig } from "axios";

// Cache em memória (TTL curto) para GETs de dados "lidos muitas vezes, mudam
// pouco" (rankings, listas de utilizadores). Só dura enquanto a página estiver
// aberta - não é persistido. Complementa o cache Redis do backend: evita até
// o pedido de rede, não só a query à base de dados.
const TTL_PADRAO_MS = 30_000;

interface EntradaCache {
  dados: unknown;
  expiraEm: number;
}

const cache = new Map<string, EntradaCache>();

function chaveCache(url: string, params?: unknown): string {
  return `${url}::${params ? JSON.stringify(params) : ""}`;
}

export async function cachedGet<T>(
  api: AxiosInstance,
  url: string,
  config?: AxiosRequestConfig,
  ttlMs: number = TTL_PADRAO_MS
): Promise<T> {
  const chave = chaveCache(url, config?.params);
  const entrada = cache.get(chave);

  if (entrada && entrada.expiraEm > Date.now()) {
    return entrada.dados as T;
  }

  const response = await api.get<T>(url, config);
  cache.set(chave, { dados: response.data, expiraEm: Date.now() + ttlMs });

  return response.data;
}

/** Limpa entradas cujo url comece por um prefixo - usar após mutações que invalidem o cache */
export function limparCache(prefixoUrl?: string) {
  if (!prefixoUrl) {
    cache.clear();
    return;
  }

  for (const chave of cache.keys()) {
    if (chave.startsWith(prefixoUrl)) {
      cache.delete(chave);
    }
  }
}
