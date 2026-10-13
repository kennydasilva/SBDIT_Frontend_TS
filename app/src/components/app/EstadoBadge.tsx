import { labelEstado, labelEstadoCidadao, toneEstado, toneEstadoCidadao } from "../../utils/estadoDenuncia";

interface EstadoBadgeProps {
  estado: string;
  tipo?: string;
  /** Na área do cidadão a suspeita não é revelada ("Em verificação"). */
  paraCidadao?: boolean;
}

// O estado de uma denúncia, sempre com o mesmo rótulo em português e o
// mesmo aspecto, em qualquer página.
export default function EstadoBadge({ estado, tipo, paraCidadao }: EstadoBadgeProps) {
  const rotulo = paraCidadao ? labelEstadoCidadao(estado, tipo) : labelEstado(estado, tipo);
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded border px-2 py-0.5 text-xs font-medium ${paraCidadao ? toneEstadoCidadao(estado) : toneEstado(estado)}`}
    >
      {rotulo}
    </span>
  );
}
