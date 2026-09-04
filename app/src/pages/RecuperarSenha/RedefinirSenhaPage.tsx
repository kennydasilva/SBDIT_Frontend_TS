import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
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
import { confirmPasswordReset } from "../../api/authService";
import { passwordSchema } from "../../utils/validationSchemas";

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
    } catch (error: any) {
      const mensagem =
        error?.response?.data?.error ||
        "Link inválido ou expirado. Solicite uma nova recuperação de senha.";
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
          <h2 className="text-3xl font-bold text-[#1E40AF]">Redefinir Senha</h2>
          <p className="mt-3 text-base text-gray-600">
            Escolha uma nova senha para a sua conta
          </p>
        </div>

        {erro && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Nova senha</FormLabel>
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
                  <FormLabel className="text-gray-700">Confirmar nova senha</FormLabel>
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
              {form.formState.isSubmitting ? "A redefinir..." : "Redefinir Senha"}
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-[#1E40AF] hover:text-[#2563EB] hover:underline transition-colors"
              >
                Voltar ao login
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
