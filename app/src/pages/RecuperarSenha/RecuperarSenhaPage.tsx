import { useState } from "react";
import { Link } from "react-router-dom";
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
import { requestPasswordReset } from "../../api/authService";
import { emailSchema } from "../../utils/validationSchemas";

const recuperarSenhaSchema = z.object({
  email: emailSchema,
});

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#1E40AF] shadow-lg">
            <span className="text-3xl font-bold text-white">SGDIT</span>
          </div>
          <h2 className="text-3xl font-bold text-[#1E40AF]">Recuperar Senha</h2>
          <p className="mt-3 text-base text-gray-600">
            Indique o seu email para receber um link de recuperação
          </p>
        </div>

        {enviado ? (
          <div className="space-y-6 text-center">
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
              Se o email existir na nossa base de dados, foi enviado um link
              com instruções para redefinir a sua senha.
            </div>
            <Link
              to="/login"
              className="text-sm text-[#1E40AF] hover:text-[#2563EB] hover:underline transition-colors font-medium"
            >
              Voltar ao login
            </Link>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

              <Button
                type="submit"
                className="w-full bg-[#1E40AF] hover:bg-[#2563EB] transition-colors"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "A enviar..." : "Enviar link de recuperação"}
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
        )}
      </div>
    </div>
  );
}
