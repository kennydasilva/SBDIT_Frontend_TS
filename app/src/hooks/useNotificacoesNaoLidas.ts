import { useEffect, useState } from "react";
import { notificacaoService, EVENTO_NOTIFICACOES } from "../api/notificacaoService";

const INTERVALO_MS = 30_000;

// Número de notificações por ler, para o contador da barra lateral.
// Actualiza a cada 30s e logo que alguma notificação é marcada como lida.
export function useNotificacoesNaoLidas() {
  const [naoLidas, setNaoLidas] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem("access")) return;

    let activo = true;
    const actualizar = () =>
      notificacaoService
        .contarNaoLidas()
        .then((n) => activo && setNaoLidas(n))
        .catch(() => {});

    actualizar();
    const intervalo = window.setInterval(actualizar, INTERVALO_MS);
    window.addEventListener(EVENTO_NOTIFICACOES, actualizar);

    return () => {
      activo = false;
      window.clearInterval(intervalo);
      window.removeEventListener(EVENTO_NOTIFICACOES, actualizar);
    };
  }, []);

  return naoLidas;
}
