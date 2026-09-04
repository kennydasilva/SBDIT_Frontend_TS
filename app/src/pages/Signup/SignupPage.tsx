import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { signup } from "../../api/authService";
import {
  nomeSchema,
  emailSchema,
  passwordSchema,
  telefoneSchema,
} from "../../utils/validationSchemas";

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

export default function SignupPage() {
  const navigate = useNavigate();
  const [erro, setErro] = useState<string | null>(null);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      nome: "",
      email: "",
      numero: "",
      password: "",
      confirmarPassword: "",
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setErro(null);

    try {
      await signup({
        nome: data.nome,
        email: data.email,
        password: data.password,
        numero: data.numero,
      });

      navigate("/login", { state: { cadastroSucesso: true } });
    } catch (error: any) {
      const mensagem =
        error?.response?.data?.error ||
        "Não foi possível concluir o cadastro. Tente novamente.";
      setErro(mensagem);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#1E40AF] shadow-lg">
            <span className="text-3xl font-bold text-white">SGDIT</span>
          </div>
          <h2 className="text-3xl font-bold text-[#1E40AF]">
            Criar Conta de Cidadão
          </h2>
          <p className="mt-3 text-base text-gray-600">
            Preencha os dados para se registar no sistema
          </p>
        </div>

        {erro && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Nome completo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: João Manuel"
                      autoComplete="name"
                      disabled={form.formState.isSubmitting}
                      className="border-gray-300 focus:border-[#2563EB] focus:ring-[#2563EB]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="seu.email@exemplo.com"
                      type="email"
                      autoComplete="email"
                      disabled={form.formState.isSubmitting}
                      className="border-gray-300 focus:border-[#2563EB] focus:ring-[#2563EB]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numero"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Número de telefone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+258 84 123 4567"
                      autoComplete="tel"
                      disabled={form.formState.isSubmitting}
                      className="border-gray-300 focus:border-[#2563EB] focus:ring-[#2563EB]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Senha</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Mínimo 8 caracteres, maiúscula, minúscula e número"
                      type="password"
                      autoComplete="new-password"
                      disabled={form.formState.isSubmitting}
                      className="border-gray-300 focus:border-[#2563EB] focus:ring-[#2563EB]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmarPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Confirmar senha</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Repita a senha"
                      type="password"
                      autoComplete="new-password"
                      disabled={form.formState.isSubmitting}
                      className="border-gray-300 focus:border-[#2563EB] focus:ring-[#2563EB]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-[#1E40AF] hover:bg-[#2563EB] transition-colors"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "A criar conta..." : "Criar Conta"}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Já tem uma conta?{" "}
              <Link
                to="/login"
                className="text-[#1E40AF] hover:text-[#2563EB] hover:underline transition-colors font-medium"
              >
                Entrar
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
