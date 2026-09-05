import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  User,
  LogOut
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import { cidadaoService, type cidadaoResponse } from "../../api/cidadaoService";
import { logout } from "../../api/authService";

const menuItems = [
  { path: "/cidadao/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/cidadao/criar-denuncia", icon: PlusCircle, label: "Criar Denúncia" },
  { path: "/cidadao/minhas-denuncias", icon: FileText, label: "Minhas Denúncias" },
  { path: "/cidadao/perfil", icon: User, label: "Perfil" },
];

export default function CidadaoLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const[error, setError]= useState<string | null>(null);
  const[cidadao, setCidadao]= useState<cidadaoResponse  | null>(null);
  const getInitials = (name?: string | null) => {
      if (!name) return "JD";
      const parts = name.trim().split(/\s+/).filter(Boolean);
      if (parts.length === 0) return "JD";
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      const first = parts[0][0] ?? "";
      const last = parts[parts.length - 1][0] ?? "";
      return (first + last).toUpperCase();
    };
        
    
       
      
      
        useEffect(() => {
          if (!authLoading && user) {
            carregar();
          }
        }, [authLoading, user]);
      
      
        const carregar = async () => {
          if (!user) return;
          try{
            setLoading(true);
            setError(null);
      
            const data= await cidadaoService.getCidadaoId(user.id);
            setCidadao(data);
           
          } catch (err) {
            setError("Erro ao carregar cidadao.");
          } finally {
            setLoading(false);
          }
        };
  
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
              <span className="font-semibold">{getInitials(cidadao?.nome)}</span>
            </div>
            <div>
              <p className="font-medium">{cidadao?.nome}</p>
              <p className="text-xs text-blue-200">{user?.email}</p>
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
