import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MailCheck } from "lucide-react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import AuthLayout from "../../components/auth/AuthLayout";
import { requestPasswordReset } from "../../api/authService";
import { emailSchema } from "../../utils/validationSchemas";
import { INPUT, LABEL, BUTTON_PRIMARY, LINK } from "../../utils/uiClasses";

const recuperarSenhaSchema = z.object({ email: emailSchema });

type RecuperarSenhaFormData = z.infer<typeof recuperarSenhaSchema>;

export default function RecuperarSenhaPage() {
  const [enviado, setEnviado] = useState(false);

  const form = useForm<RecuperarSenhaFormData>({
    resolver: zodResolver(recuperarSenhaSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: RecuperarSenhaFormData) => {
    try {
      await requestPasswordReset(data.email);
    } finally {
      // Não revelamos se o email existe ou não, por segurança
      setEnviado(true);
    }
  };

  const aEnviar = form.formState.isSubmitting;

  return (
    <AuthLayout
      titulo="Recuperar senha"
      subtitulo="Indique o seu email para receber um link de recuperação"
      rodape={<Link to="/login" className={LINK}>Voltar a entrar</Link>}
    >
      {enviado ? (
        <div className="text-center py-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <MailCheck size={24} />
          </div>
          <p className="text-sm text-gray-700">
            Se o email existir no sistema, foi enviado um link com as instruções para redefinir a sua senha.
          </p>
        </div>
      ) : (
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
            <button type="submit" disabled={aEnviar} className={`${BUTTON_PRIMARY} w-full`}>
              {aEnviar ? <><Loader2 className="w-4 h-4 animate-spin" /> A enviar...</> : "Enviar link de recuperação"}
            </button>
          </form>
        </Form>
      )}
    </AuthLayout>
  );
}
