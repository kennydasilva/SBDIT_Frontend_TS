import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  Shield,
  UserCircle,
  AlertTriangle,
  FileText,
  Settings,
  MapPinned,
  LogOut
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { logout } from "../../api/authService";



const menuItems = [
  { path: "/super-admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/super-admin/admins", icon: Users, label: "Administradores" },
  { path: "/super-admin/policiais", icon: Shield, label: "Policiais" },
  { path: "/super-admin/cidadaos", icon: UserCircle, label: "Cidadãos" },
  { path: "/super-admin/denuncias", icon: AlertTriangle, label: "Denúncias" },
  { path: "/super-admin/jurisdicoes", icon: MapPinned, label: "Jurisdições" },
  { path: "/super-admin/relatorios", icon: FileText, label: "Relatórios" },
  { path: "/super-admin/configuracoes", icon: Settings, label: "Configurações" },
];
export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const {user, loading}= useAuth();

  if(loading){
    return <div className="flex justify-cnter items-center h-screen">Carregando...</div>;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1E40AF] text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-blue-800">
          <h1 className="text-xl font-bold">SGDIT</h1>
          
          <p className="text-sm text-blue-200">Sistema de Gestão</p>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  isActive
                    ? "bg-[#2563EB] text-white"
                    : "text-blue-100 hover:bg-blue-800"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg mt-4 text-blue-100 hover:bg-blue-800 transition-colors w-full"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="font-semibold">SA</span>
            </div>
            <div>
              <p className="font-medium">Super Admin</p>
              {user &&(
              <p className="text-xs text-blue-200">{user.email}</p>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
