import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../hooks/useAuth";

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
import { login } from "../../api/authService";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "O email é obrigatório")
    .email("Digite um email válido"),
  password: z
    .string()
    .min(1, "A senha é obrigatória")
    .min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await login(data.email, data.password);

      console.log("Login successful:", response);
      console.log("User role:", response.user.role);
      
      const userRole = response.user.role;
    
      switch (userRole) {
        case "SUPER_ADMIN":
          navigate("/super-admin/dashboard");
          break;
        case "ADMIN":
          navigate("/admin/dashboard");
          break;
        case "PT":
          navigate("/pt/dashboard");
          break;
        case "CIDADAO":
          navigate("/cidadao/dashboard");
          break;
        default:
          navigate("/login");
      }
    } catch (error) {
      alert("Erro ao fazer login. Verifique suas credenciais.");
      form.reset();
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
            Sistema de Gestão de Denúncias
          </h2>
          <p className="mt-3 text-base text-gray-600">
            Faça login para acessar o sistema
          </p>
        </div>

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
                      placeholder="seu.email@transito.gov"
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Senha</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite sua senha"
                      type="password"
                      autoComplete="current-password"
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
              {form.formState.isSubmitting ? "Entrando..." : "Entrar no Sistema"}
            </Button>

          
            <div className="text-center">
              <a 
                href="/recuperar-senha" 
                className="text-sm text-[#1E40AF] hover:text-[#2563EB] hover:underline transition-colors"
              >
                Esqueceu sua senha?
              </a>
            </div>

            
            <div className="text-center text-sm text-gray-600">
              Não tem uma conta?{" "}
              <a 
                href="/cadastrar" 
                className="text-[#1E40AF] hover:text-[#2563EB] hover:underline transition-colors font-medium"
              >
                Cadastre-se
              </a>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}