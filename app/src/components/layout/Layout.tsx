import { LayoutDashboard, Users, Shield, UserCircle, AlertTriangle, FileText, Settings, MapPinned, Bell } from "lucide-react";
import AppShell, { type ItemMenu } from "./AppShell";

const menuItems: ItemMenu[] = [
  { path: "/super-admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/super-admin/admins", icon: Users, label: "Administradores" },
  { path: "/super-admin/policiais", icon: Shield, label: "Agentes" },
  { path: "/super-admin/cidadaos", icon: UserCircle, label: "Cidadãos" },
  { path: "/super-admin/denuncias", icon: AlertTriangle, label: "Denúncias" },
  { path: "/super-admin/jurisdicoes", icon: MapPinned, label: "Jurisdições" },
  { path: "/super-admin/relatorios", icon: FileText, label: "Relatórios" },
  { path: "/super-admin/notificacoes", icon: Bell, label: "Notificações" },
  { path: "/super-admin/configuracoes", icon: Settings, label: "Configurações" },
];

export default function Layout() {
  return <AppShell subtitulo="Administração do sistema" menuItems={menuItems} />;
}
