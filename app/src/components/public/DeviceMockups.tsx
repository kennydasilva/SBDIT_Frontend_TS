import { MapPin, Bell, LayoutDashboard, FileText, PlusCircle, User } from "lucide-react";

// Ecrãs da aplicação desenhados em miniatura para o topo da landing page
// (painel do cidadão num portátil, nova denúncia num telemóvel). São
// desenhos em HTML com dados de exemplo - não mostram dados reais.

const MENU = [
  { icon: LayoutDashboard, texto: "Painel", activo: true },
  { icon: PlusCircle, texto: "Nova denúncia" },
  { icon: FileText, texto: "Minhas denúncias" },
  { icon: Bell, texto: "Notificações" },
  { icon: User, texto: "Perfil" },
];

const RESUMO = [
  { valor: "12", texto: "Denúncias" },
  { valor: "7", texto: "Aprovadas" },
  { valor: "3", texto: "Em revisão" },
];

const LISTA = [
  { tipo: "Contramão", local: "Av. Julius Nyerere", estado: "Aprovada", forte: true },
  { tipo: "Veículo parado", local: "Av. Eduardo Mondlane", estado: "Validada" },
  { tipo: "Excesso de velocidade", local: "Av. de Moçambique", estado: "Pendente" },
];

function Portatil() {
  return (
    <div className="w-full">
      <div className="rounded-t-2xl bg-[#1E40AF] p-2 pb-0 shadow-2xl shadow-[#1E40AF]/25">
        <div className="flex aspect-[16/10] overflow-hidden rounded-t-lg bg-white text-left">
          <aside className="flex w-[24%] flex-col bg-[#1E40AF] p-2 text-white">
            <p className="text-[9px] font-bold leading-none">SGDIT</p>
            <p className="mt-0.5 text-[6px] text-white/80">Cidadão</p>
            <ul className="mt-3 space-y-1">
              {MENU.map((m) => (
                <li
                  key={m.texto}
                  className={`flex items-center gap-1 rounded-md px-1.5 py-1 text-[6px] ${
                    m.activo ? "bg-white/15 font-semibold" : "text-white/85"
                  }`}
                >
                  <m.icon size={7} />
                  {m.texto}
                </li>
              ))}
            </ul>
          </aside>

          <div className="flex-1 p-3">
            <p className="text-[9px] font-semibold text-gray-900">Painel</p>
            <p className="text-[6px] text-gray-500">Resumo das suas denúncias</p>

            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {RESUMO.map((r) => (
                <div key={r.texto} className="rounded-md border border-[#1E40AF]/15 bg-white p-1.5">
                  <p className="text-[11px] font-bold leading-none text-[#1E40AF]">{r.valor}</p>
                  <p className="mt-1 text-[6px] text-gray-500">{r.texto}</p>
                </div>
              ))}
            </div>

            <div className="mt-2 rounded-md border border-[#1E40AF]/15 bg-white p-1.5">
              <p className="text-[6px] font-semibold text-gray-700">Denúncias por mês</p>
              <svg viewBox="0 0 200 50" className="mt-1 w-full" preserveAspectRatio="none">
                <path
                  d="M0 40 C 20 38, 30 20, 50 24 S 80 40, 100 28 S 130 6, 150 14 S 185 30, 200 10 L200 50 L0 50 Z"
                  fill="#1E40AF" fillOpacity="0.12"
                />
                <path
                  d="M0 40 C 20 38, 30 20, 50 24 S 80 40, 100 28 S 130 6, 150 14 S 185 30, 200 10"
                  fill="none"
                  stroke="#1E40AF"
                  strokeWidth="1.5"
                />
              </svg>
            </div>

            <div className="mt-2 rounded-md border border-[#1E40AF]/15 bg-white">
              {LISTA.map((l) => (
                <div key={l.tipo} className="flex items-center justify-between border-b border-[#1E40AF]/10 px-1.5 py-1 last:border-0">
                  <div>
                    <p className="text-[6.5px] font-semibold text-gray-900">{l.tipo}</p>
                    <p className="text-[5.5px] text-gray-500">{l.local}</p>
                  </div>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[5.5px] font-medium ${
                      l.forte ? "bg-[#1E40AF] text-white" : "bg-[#1E40AF]/10 text-[#1E40AF]"
                    }`}
                  >
                    {l.estado}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="relative -mx-[6%] h-3 rounded-b-2xl bg-[#1E40AF]">
        <div className="absolute left-1/2 top-0 h-1 w-[14%] -translate-x-1/2 rounded-b-md bg-white/40" />
      </div>
    </div>
  );
}

function Telemovel() {
  return (
    <div className="w-full rounded-[1.75rem] border-[5px] border-[#1E40AF] bg-white shadow-2xl shadow-[#1E40AF]/30">
      <div className="mx-auto mt-1.5 h-2 w-12 rounded-full bg-[#1E40AF]" />
      <div className="px-3 pb-3 pt-2 text-left">
        <p className="text-[9px] font-semibold text-gray-900">Nova denúncia</p>

        <p className="mt-2 text-[6.5px] font-medium text-gray-500">Tipo de ocorrência</p>
        <div className="mt-1 flex flex-wrap gap-1">
          <span className="rounded-full bg-[#1E40AF] px-2 py-0.5 text-[6.5px] font-medium text-white">Contramão</span>
          <span className="rounded-full bg-[#1E40AF]/10 px-2 py-0.5 text-[6.5px] text-[#1E40AF]">Parado</span>
          <span className="rounded-full bg-[#1E40AF]/10 px-2 py-0.5 text-[6.5px] text-[#1E40AF]">Velocidade</span>
        </div>

        <p className="mt-2 text-[6.5px] font-medium text-gray-500">Matrícula</p>
        <div className="mt-1 rounded-md border border-[#1E40AF]/20 px-2 py-1 text-[7px] text-gray-900">AB-12-CD</div>

        <p className="mt-2 text-[6.5px] font-medium text-gray-500">Local</p>
        <div className="relative mt-1 h-20 overflow-hidden rounded-lg bg-[#1E40AF]/10">
          <svg viewBox="0 0 120 80" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            <path d="M-5 58 L125 30" stroke="#fff" strokeWidth="9" />
            <path d="M38 -5 L62 85" stroke="#fff" strokeWidth="7" />
            <path d="M-5 18 L125 8" stroke="#fff" strokeWidth="4" />
            <path d="M92 -5 L104 85" stroke="#fff" strokeWidth="4" />
            <path d="M-5 58 L125 30" stroke="#1E40AF" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="4 4" />
          </svg>
          <span className="absolute left-[40%] top-[30%] text-[#1E40AF]">
            <MapPin size={18} fill="#1E40AF" stroke="#fff" strokeWidth={1.5} />
          </span>
        </div>
        <p className="mt-1 text-[6px] text-gray-500">Av. Julius Nyerere, Maputo</p>

        <div className="mt-2 rounded-lg bg-[#1E40AF] py-1.5 text-center text-[7.5px] font-semibold text-white">
          Enviar denúncia
        </div>
      </div>
    </div>
  );
}

export default function DeviceMockups() {
  return (
    <div className="relative mx-auto w-full max-w-xl pb-6 pr-10 sm:pr-16">
      <Portatil />
      <div className="absolute -bottom-2 right-0 w-[30%] min-w-[7.5rem]">
        <Telemovel />
      </div>
    </div>
  );
}
