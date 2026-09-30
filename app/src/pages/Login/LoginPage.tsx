import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import AuthLayout from "../../components/auth/AuthLayout";
import { login } from "../../api/authService";
import { emailSchema } from "../../utils/validationSchemas";
import { INPUT, LABEL, BUTTON_PRIMARY, ALERT_ERROR, ALERT_SUCCESS, LINK } from "../../utils/uiClasses";

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "A senha é obrigatória"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const DESTINO_POR_PAPEL: Record<string, string> = {
  SUPER_ADMIN: "/super-admin/dashboard",
  ADMIN: "/admin/dashboard",
  PT: "/pt/dashboard",
  CIDADAO: "/cidadao/dashboard",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [erro, setErro] = useState<string | null>(null);

  // Mensagem de sucesso vinda do registo ou da redefinição de senha.
  const estado = location.state as { cadastroSucesso?: boolean; senhaRedefinida?: boolean } | null;
  const sucesso = estado?.cadastroSucesso
    ? "Conta criada com sucesso. Já pode entrar."
    : estado?.senhaRedefinida
      ? "Senha redefinida com sucesso. Entre com a nova senha."
      : null;

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setErro(null);
    try {
      const response = await login(data.email, data.password);
      navigate(DESTINO_POR_PAPEL[response.user.role] ?? "/login");
    } catch {
      setErro("Email ou senha incorretos.");
      form.setValue("password", "");
    }
  };

  const aEnviar = form.formState.isSubmitting;

  return (
    <AuthLayout
      titulo="Entrar"
      subtitulo="Aceda à sua conta para continuar"
      rodape={
        <>
          Ainda não tem conta?{" "}
          <Link to="/cadastrar" className={LINK}>Registe-se</Link>
        </>
      }
    >
      {sucesso && !erro && <div className={`${ALERT_SUCCESS} mb-5`}>{sucesso}</div>}
      {erro && <div className={`${ALERT_ERROR} mb-5`}>{erro}</div>}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={LABEL}>Email</FormLabel>
                <FormControl>
                  <input type="email" autoComplete="email" placeholder="nome@exemplo.com" disabled={aEnviar} className={INPUT} {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className={LABEL}>Senha</FormLabel>
                  <Link to="/recuperar-senha" className="text-xs text-blue-600 hover:underline mb-1.5">
                    Esqueceu a senha?
                  </Link>
                </div>
                <FormControl>
                  <input type="password" autoComplete="current-password" placeholder="A sua senha" disabled={aEnviar} className={INPUT} {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <button type="submit" disabled={aEnviar} className={`${BUTTON_PRIMARY} w-full mt-2`}>
            {aEnviar ? <><Loader2 className="w-4 h-4 animate-spin" /> A entrar...</> : "Entrar"}
          </button>
        </form>
      </Form>
    </AuthLayout>
  );
}
