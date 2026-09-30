import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import AuthLayout from "../../components/auth/AuthLayout";
import { signup } from "../../api/authService";
import { nomeSchema, emailSchema, passwordSchema, telefoneSchema } from "../../utils/validationSchemas";
import { INPUT, LABEL, BUTTON_PRIMARY, ALERT_ERROR, FIELD_HINT, LINK } from "../../utils/uiClasses";
import { mensagemDeErro } from "../../utils/mensagens";

const signupSchema = z
  .object({
    nome: nomeSchema,
    email: emailSchema,
    numero: telefoneSchema,
    password: passwordSchema,
    confirmarPassword: z.string().min(1, "Confirme a sua senha"),
  })
  .refine((data) => data.password === data.confirmarPassword, {
    message: "As senhas não coincidem",
    path: ["confirmarPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

const CAMPOS: {
  name: keyof SignupFormData;
  label: string;
  type: string;
  placeholder: string;
  autoComplete: string;
  dica?: string;
}[] = [
  { name: "nome", label: "Nome completo", type: "text", placeholder: "Ex: Ana Machava", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", placeholder: "nome@exemplo.com", autoComplete: "email" },
  { name: "numero", label: "Telemóvel", type: "tel", placeholder: "+258 84 123 4567", autoComplete: "tel" },
  {
    name: "password", label: "Senha", type: "password", placeholder: "Crie uma senha", autoComplete: "new-password",
    dica: "Mínimo 8 caracteres, com maiúscula, minúscula e número.",
  },
  { name: "confirmarPassword", label: "Confirmar senha", type: "password", placeholder: "Repita a senha", autoComplete: "new-password" },
];

export default function SignupPage() {
  const navigate = useNavigate();
  const [erro, setErro] = useState<string | null>(null);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { nome: "", email: "", numero: "", password: "", confirmarPassword: "" },
  });

  const onSubmit = async (data: SignupFormData) => {
    setErro(null);
    try {
      await signup({ nome: data.nome, email: data.email, password: data.password, numero: data.numero });
      navigate("/login", { state: { cadastroSucesso: true } });
    } catch (error) {
      setErro(mensagemDeErro(error, "Não foi possível concluir o registo. Tente novamente."));
    }
  };

  const aEnviar = form.formState.isSubmitting;

  return (
    <AuthLayout
      titulo="Criar conta"
      subtitulo="Registe-se para denunciar infrações de trânsito"
      rodape={
        <>
          Já tem conta?{" "}
          <Link to="/login" className={LINK}>Entrar</Link>
        </>
      }
    >
      {erro && <div className={`${ALERT_ERROR} mb-5`}>{erro}</div>}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {CAMPOS.map((c) => (
            <FormField
              key={c.name}
              control={form.control}
              name={c.name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={LABEL}>{c.label}</FormLabel>
                  <FormControl>
                    <input type={c.type} autoComplete={c.autoComplete} placeholder={c.placeholder} disabled={aEnviar} className={INPUT} {...field} />
                  </FormControl>
                  {c.dica && <p className={FIELD_HINT}>{c.dica}</p>}
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          ))}

          <button type="submit" disabled={aEnviar} className={`${BUTTON_PRIMARY} w-full mt-2`}>
            {aEnviar ? <><Loader2 className="w-4 h-4 animate-spin" /> A criar conta...</> : "Criar conta"}
          </button>
        </form>
      </Form>
    </AuthLayout>
  );
}
