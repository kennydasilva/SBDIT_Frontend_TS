import passo1 from "../../assets/landing/passo1.webp";
import passo2 from "../../assets/landing/passo2.webp";
import telemovel from "../../assets/landing/telemovel.webp";

// Capturas reais da área do cidadão, tiradas com uma conta de teste (sem
// dados de nenhum utilizador), em molduras desenhadas só com o azul do sistema.

const CAPTURAS = {
  passo1: {
    src: passo1,
    alt: "Ecrã Criar denúncia do SGDIT, no primeiro passo: escolha entre contramão, veículo parado, excesso de velocidade e acidente de viação",
  },
  passo2: {
    src: passo2,
    alt: "Ecrã Criar denúncia do SGDIT, no segundo passo: campo da matrícula, zona para escolher o vídeo e descrição opcional",
  },
  telemovel: {
    src: telemovel,
    alt: "Painel do cidadão do SGDIT no telemóvel, com o botão Criar denúncia",
  },
};

type Captura = keyof typeof CAPTURAS;

/** Captura numa moldura de portátil. */
export function Portatil({ captura, prioridade }: { captura: Captura; prioridade?: boolean }) {
  const c = CAPTURAS[captura];
  return (
    <div>
      <div className="rounded-t-xl bg-[#1E40AF] p-2 pb-0 shadow-2xl shadow-[#1E40AF]/25 sm:rounded-t-2xl sm:p-3 sm:pb-0">
        <img
          src={c.src}
          alt={c.alt}
          width={2560}
          height={1600}
          loading={prioridade ? "eager" : "lazy"}
          decoding="async"
          className="block h-auto w-full rounded-t-md bg-white"
        />
      </div>
      {/* Base do portátil */}
      <div className="relative -mx-[4%] h-2.5 rounded-b-xl bg-[#1E40AF] sm:h-3.5">
        <span className="absolute left-1/2 top-0 h-1 w-[14%] -translate-x-1/2 rounded-b-md bg-white/35" />
      </div>
    </div>
  );
}

/** Captura numa moldura de telemóvel. */
export function Telemovel({ captura, className = "" }: { captura: Captura; className?: string }) {
  const c = CAPTURAS[captura];
  return (
    <div className={`rounded-[1.6rem] bg-[#1E40AF] p-1.5 shadow-2xl shadow-[#1E40AF]/30 ${className}`}>
      <img
        src={c.src}
        alt={c.alt}
        width={1170}
        height={2400}
        loading="lazy"
        decoding="async"
        className="block h-auto w-full rounded-[1.25rem] bg-white"
      />
    </div>
  );
}
