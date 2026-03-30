import { Users, Shield, UserCircle, AlertTriangle } from "lucide-react";

const stats = [
  { label: "Total de Administradores", value: "12", icon: Users, color: "bg-blue-500" },
  { label: "Total de Policiais", value: "48", icon: Shield, color: "bg-indigo-500" },
  { label: "Total de Cidadãos", value: "2,345", icon: UserCircle, color: "bg-purple-500" },
  { label: "Total de Denúncias", value: "567", icon: AlertTriangle, color: "bg-orange-500" },
];

export default function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Atividades Recentes</h2>
        <div className="space-y-4">
          {[
            { action: "Nova denúncia registrada", time: "Há 5 minutos", user: "João Silva" },
            { action: "Policial cadastrado", time: "Há 15 minutos", user: "Admin Regional" },
            { action: "Denúncia resolvida", time: "Há 1 hora", user: "PT-123" },
            { action: "Novo administrador criado", time: "Há 2 horas", user: "Super Admin" },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
              <div>
                <p className="font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-500">por {activity.user}</p>
              </div>
              <span className="text-sm text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
