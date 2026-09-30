import { toast } from "sonner";

// Mensagens de feedback da aplicação (em vez de alert() do browser, que
// bloqueia a página e tem um aspecto diferente em cada navegador).

/** Extrai a mensagem de erro devolvida pelo backend (`error`/`message`/`detail`). */
export function mensagemDeErro(erro: unknown, alternativa: string): string {
  const dados = (erro as { response?: { data?: Record<string, unknown> } })?.response?.data;
  const texto = dados?.error ?? dados?.message ?? dados?.detail;
  return typeof texto === "string" && texto.trim() ? texto : alternativa;
}

export const mostrarSucesso = (mensagem: string) => toast.success(mensagem);

export const mostrarErro = (erro: unknown, alternativa: string) =>
  toast.error(mensagemDeErro(erro, alternativa));

export const mostrarAviso = (mensagem: string) => toast.warning(mensagem);
