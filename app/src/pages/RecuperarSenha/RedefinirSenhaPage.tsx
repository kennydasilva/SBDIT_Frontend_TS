import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import AuthLayout from "../../components/auth/AuthLayout";
import { confirmPasswordReset } from "../../api/authService";
import { passwordSchema } from "../../utils/validationSchemas";
import { INPUT, LABEL, BUTTON_PRIMARY, ALERT_ERROR, FIELD_HINT, LINK } from "../../utils/uiClasses";
import { mensagemDeErro } from "../../utils/mensagens";

const redefinirSenhaSchema = z
  .object({
    password: passwordSchema,
    confirmarPassword: z.string().min(1, "Confirme a sua senha"),
  })
  .refine((data) => data.password === data.confirmarPassword, {
    message: "As senhas não coincidem",
    path: ["confirmarPassword"],
  });

type RedefinirSenhaFormData = z.infer<typeof redefinirSenhaSchema>;

export default function RedefinirSenhaPage() {
  const navigate = useNavigate();
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const [erro, setErro] = useState<string | null>(null);

  const form = useForm<RedefinirSenhaFormData>({
    resolver: zodResolver(redefinirSenhaSchema),
    defaultValues: { password: "", confirmarPassword: "" },
  });

  const onSubmit = async (data: RedefinirSenhaFormData) => {
    setErro(null);

    if (!uid || !token) {
      setErro("Link de recuperação inválido.");
      return;
    }

    try {
      await confirmPasswordReset(uid, token, data.password);
      navigate("/login", { state: { senhaRedefinida: true } });
    } catch (error) {
      setErro(mensagemDeErro(error, "Link inválido ou expirado. Peça uma nova recuperação de senha."));
    }
  };

  const aEnviar = form.formState.isSubmitting;

  return (
    <AuthLayout
      titulo="Redefinir senha"
      subtitulo="Escolha uma nova senha para a sua conta"
      rodape={<Link to="/login" className={LINK}>Voltar a entrar</Link>}
    >
      {erro && (
        <div className={`${ALERT_ERROR} mb-5`}>
          {erro}{" "}
          <Link to="/recuperar-senha" className="font-medium underline">Pedir novo link</Link>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={LABEL}>Nova senha</FormLabel>
                <FormControl>
                  <input type="password" autoComplete="new-password" placeholder="Crie uma senha" disabled={aEnviar} className={INPUT} {...field} />
                </FormControl>
                <p className={FIELD_HINT}>Mínimo 8 caracteres, com maiúscula, minúscula e número.</p>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmarPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={LABEL}>Confirmar nova senha</FormLabel>
                <FormControl>
                  <input type="password" autoComplete="new-password" placeholder="Repita a senha" disabled={aEnviar} className={INPUT} {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <button type="submit" disabled={aEnviar} className={`${BUTTON_PRIMARY} w-full mt-2`}>
            {aEnviar ? <><Loader2 className="w-4 h-4 animate-spin" /> A guardar...</> : "Guardar nova senha"}
          </button>
        </form>
      </Form>
    </AuthLayout>
  );
}
