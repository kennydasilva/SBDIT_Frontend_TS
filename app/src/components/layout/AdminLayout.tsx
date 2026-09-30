import { LayoutDashboard, Shield, Siren, Bell } from "lucide-react";
import AppShell, { type ItemMenu } from "./AppShell";

// Só páginas que existem: os antigos links para Cidadãos/Denúncias/
// Relatórios do Admin não tinham rota e mandavam o utilizador para o login.
const menuItems: ItemMenu[] = [
  { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/admin/policiais", icon: Shield, label: "Agentes" },
  { path: "/admin/acidentes", icon: Siren, label: "Acidentes" },
  { path: "/admin/notificacoes", icon: Bell, label: "Notificações" },
];

export default function AdminLayout() {
  return <AppShell subtitulo="Posto policial" menuItems={menuItems} />;
}
