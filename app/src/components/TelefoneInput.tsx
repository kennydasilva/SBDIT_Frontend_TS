import { INPUT } from "../utils/uiClasses";

const INDICATIVO = "+258";

// Só os 9 dígitos nacionais, a partir de um número guardado com ou sem
// indicativo ("+258 84 123 4567", "258841234567", "841234567").
const digitosNacionais = (valor?: string | null) => {
  const digitos = (valor ?? "").replace(/\D/g, "");
  return (digitos.startsWith("258") && digitos.length > 9 ? digitos.slice(3) : digitos).slice(0, 9);
};

interface Props {
  value?: string | null;
  // Recebe o número completo ("+258841234567"), ou "" se estiver vazio.
  onChange: (numero: string) => void;
  disabled?: boolean;
  name?: string;
  autoComplete?: string;
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

// Telemóvel de Moçambique: o indicativo +258 é fixo, o utilizador só
// escreve os 9 dígitos do número.
export default function TelefoneInput({ value, onChange, disabled, name, autoComplete, id, ...aria }: Props) {
  return (
    <div className="flex">
      <span className="inline-flex items-center h-11 px-3.5 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-sm text-gray-600 select-none">
        {INDICATIVO}
      </span>
      <input
        id={id}
        {...aria}
        type="tel"
        inputMode="numeric"
        name={name}
        autoComplete={autoComplete}
        value={digitosNacionais(value)}
        onChange={(e) => {
          const digitos = digitosNacionais(e.target.value);
          onChange(digitos ? `${INDICATIVO}${digitos}` : "");
        }}
        placeholder="84 123 4567"
        maxLength={9}
        disabled={disabled}
        className={`${INPUT} rounded-l-none disabled:bg-gray-50 disabled:text-gray-500`}
      />
    </div>
  );
}
