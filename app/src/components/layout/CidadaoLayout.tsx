import { Link, Outlet, useLocation } from "react-router";
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  User,
  LogOut
} from "lucide-react";

const menuItems = [
  { path: "/cidadao/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/cidadao/criar-denuncia", icon: PlusCircle, label: "Criar Denúncia" },
  { path: "/cidadao/minhas-denuncias", icon: FileText, label: "Minhas Denúncias" },
  { path: "/cidadao/perfil", icon: User, label: "Perfil" },
];

export default function CidadaoLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1E40AF] text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-blue-800">
          <h1 className="text-xl font-bold">SGDIT</h1>
          <p className="text-sm text-blue-200">Portal do Cidadão</p>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === "/cidadao"
              ? location.pathname === "/cidadao"
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
          <Link to="/login">
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg mt-4 text-blue-100 hover:bg-blue-800 transition-colors w-full">
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </Link>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="font-semibold">JD</span>
            </div>
            <div>
              <p className="font-medium">João da Silva</p>
              <p className="text-xs text-blue-200">joao@email.com</p>
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
