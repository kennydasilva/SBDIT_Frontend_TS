import { LayoutDashboard, AlertTriangle, CheckSquare, User, Bell } from "../icons";
import AppShell, { type ItemMenu } from "./AppShell";

const menuItems: ItemMenu[] = [
  { path: "/pt/dashboard", icon: LayoutDashboard, label: "Painel" },
  { path: "/pt/denuncias", icon: AlertTriangle, label: "Fila de denúncias" },
  { path: "/pt/minhas-decisoes", icon: CheckSquare, label: "Minhas decisões" },
  { path: "/pt/notificacoes", icon: Bell, label: "Notificações" },
  { path: "/pt/perfil", icon: User, label: "Perfil" },
];

export default function PTLayout() {
  return <AppShell subtitulo="Agente de trânsito" menuItems={menuItems} />;
}
