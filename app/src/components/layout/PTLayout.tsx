import { LayoutDashboard, AlertTriangle, CheckSquare, User, Bell } from "lucide-react";
import AppShell, { type ItemMenu } from "./AppShell";

const menuItems: ItemMenu[] = [
  { path: "/pt/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/pt/denuncias", icon: AlertTriangle, label: "Denúncias" },
  { path: "/pt/minhas-decisoes", icon: CheckSquare, label: "Minhas Decisões" },
  { path: "/pt/notificacoes", icon: Bell, label: "Notificações" },
  { path: "/pt/perfil", icon: User, label: "Perfil" },
];

export default function PTLayout() {
  return <AppShell subtitulo="Polícia de Trânsito" menuItems={menuItems} />;
}
