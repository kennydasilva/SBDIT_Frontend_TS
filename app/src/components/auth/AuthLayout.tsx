import type { ReactNode } from "react";

interface AuthLayoutProps {
  titulo: string;
  subtitulo: string;
  children: ReactNode;
  rodape?: ReactNode;
}

// Botão e ligação com as cores do ecrã de login.
export const AUTH_BUTTON =
  "inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#1E40AF] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-60";
export const AUTH_LINK =
  "font-medium text-[#1E40AF] transition-colors hover:text-[#2563EB] hover:underline";

// Estrutura comum de Registar / Recuperar / Redefinir senha, com o mesmo
// visual do ecrã de login (círculo SGDIT, cartão centrado).
export default function AuthLayout({ titulo, subtitulo, children, rodape }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 px-4 py-10">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#1E40AF] shadow-lg">
            <span className="text-3xl font-bold text-white">SGDIT</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1E40AF]">{titulo}</h1>
          <p className="mt-3 text-base text-gray-600">{subtitulo}</p>
        </div>

        <div>{children}</div>

        {rodape && <div className="text-center text-sm text-gray-600">{rodape}</div>}
      </div>
    </div>
  );
}
