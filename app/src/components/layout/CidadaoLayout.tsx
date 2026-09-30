import { useEffect, useState } from "react";
import { LayoutDashboard, PlusCircle, FileText, User, Bell } from "lucide-react";
import AppShell, { type ItemMenu } from "./AppShell";
import { useAuth } from "../../hooks/useAuth";
import { cidadaoService } from "../../api/cidadaoService";

const menuItems: ItemMenu[] = [
  { path: "/cidadao/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/cidadao/criar-denuncia", icon: PlusCircle, label: "Criar Denúncia" },
  { path: "/cidadao/minhas-denuncias", icon: FileText, label: "Minhas Denúncias" },
  { path: "/cidadao/notificacoes", icon: Bell, label: "Notificações" },
  { path: "/cidadao/perfil", icon: User, label: "Perfil" },
];

export default function CidadaoLayout() {
  const { user, loading } = useAuth();
  const [nome, setNome] = useState<string | null>(null);

  // Mostra o nome do cidadão no rodapé; se falhar, fica o email.
  useEffect(() => {
    if (loading || !user) return;
    cidadaoService
      .getCidadaoId(user.id)
      .then((c) => setNome(c.nome))
      .catch(() => {});
  }, [loading, user]);

  return <AppShell subtitulo="Área do cidadão" menuItems={menuItems} nome={nome} />;
}
