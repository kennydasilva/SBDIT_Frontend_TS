import criarDenuncia from "../../assets/landing/criar-denuncia.webp";

// Captura real do ecrã "Criar Denúncia" da área do cidadão, numa moldura
// de janela de browser. A captura não inclui dados de nenhum utilizador.
export default function DeviceMockups() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-2xl shadow-[#1E40AF]/20 ring-1 ring-[#1E40AF]/15">
      <div className="flex items-center gap-3 border-b border-[#1E40AF]/10 px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#1E40AF]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#1E40AF]/50" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#1E40AF]/25" />
        </span>
        <span className="flex-1 truncate rounded-full bg-[#1E40AF]/5 px-3 py-1 text-xs text-[#1E40AF]/80">
          SGDIT · Criar Denúncia
        </span>
      </div>
      <img
        src={criarDenuncia}
        alt="Ecrã de criação de denúncia do SGDIT, com os campos da matrícula, do tipo de infração e o mapa para marcar o local"
        width={1600}
        height={1000}
        className="block h-auto w-full"
      />
    </div>
  );
}
