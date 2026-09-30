import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";

interface AuthLayoutProps {
  titulo: string;
  subtitulo: string;
  children: ReactNode;
  rodape?: ReactNode;
}

// Estrutura comum de Entrar / Registar / Recuperar / Redefinir senha.
export default function AuthLayout({ titulo, subtitulo, children, rodape }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
          <div className="leading-tight">
            <p className="text-lg font-bold text-gray-900 tracking-tight">SGDIT</p>
            <p className="text-xs text-gray-500">Gestão de Denúncias de Infrações de Trânsito</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.06)] p-8">
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">{titulo}</h1>
          <p className="text-sm text-gray-500 mt-1 mb-6">{subtitulo}</p>
          {children}
        </div>

        {rodape && <div className="mt-6 text-center text-sm text-gray-600">{rodape}</div>}
      </div>
    </div>
  );
}
