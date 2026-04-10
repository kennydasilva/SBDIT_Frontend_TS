import { Link, Outlet, useLocation } from "react-router";
import {
  LayoutDashboard,
  AlertTriangle,
  CheckSquare,
  User,
  LogOut
} from "lucide-react";

const menuItems = [
  { path: "/pt", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/pt/denuncias", icon: AlertTriangle, label: "Denúncias" },
  { path: "/pt/minhas-decisoes", icon: CheckSquare, label: "Minhas Decisões" },
  { path: "/pt/perfil", icon: User, label: "Perfil" },
];

export default function PTLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1E40AF] text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-blue-800">
          <h1 className="text-xl font-bold">SGDIT</h1>
          <p className="text-sm text-blue-200">Polícia de Trânsito</p>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === "/pt"
              ? location.pathname === "/pt"
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
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg mt-4 text-blue-100 hover:bg-blue-800 transition-colors w-full">
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="font-semibold">PT</span>
            </div>
            <div>
              <p className="font-medium">António Costa</p>
              <p className="text-xs text-blue-200">PT-2145</p>
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
