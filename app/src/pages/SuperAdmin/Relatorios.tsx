import { FileDown, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const denunciasPorMes = [
  { mes: "Jan", total: 45 },
  { mes: "Fev", total: 62 },
  { mes: "Mar", total: 89 },
];

const denunciasPorStatus = [
  { name: "Pendente", value: 125, color: "#FCD34D" },
  { name: "Em Análise", value: 98, color: "#3B82F6" },
  { name: "Resolvida", value: 234, color: "#10B981" },
  { name: "Rejeitada", value: 43, color: "#EF4444" },
];

export default function Relatorios() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <FileDown size={20} />
            Exportar PDF
          </button>
          <button className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg hover:bg-[#1E40AF] transition-colors">
            <FileDown size={20} />
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-1">Total de Denúncias</h3>
          <p className="text-3xl font-bold text-gray-900">567</p>
          <p className="text-sm text-green-600 mt-2">+12% em relação ao mês anterior</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-1">Taxa de Resolução</h3>
          <p className="text-3xl font-bold text-gray-900">68%</p>
          <p className="text-sm text-green-600 mt-2">+5% em relação ao mês anterior</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-1">Tempo Médio de Resposta</h3>
          <p className="text-3xl font-bold text-gray-900">2.5 dias</p>
          <p className="text-sm text-red-600 mt-2">+0.3 dias em relação ao mês anterior</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="text-[#2563EB]" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Denúncias por Mês</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={denunciasPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#2563EB" name="Total de Denúncias" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="text-[#2563EB]" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Denúncias por Status</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={denunciasPorStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => {
                  const percentage = percent ? (percent * 100).toFixed(0) : 0;
                  return `${name}: ${percentage}%`;
                }}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {denunciasPorStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Relatório Detalhado</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pendente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Em Análise</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolvida</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rejeitada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Janeiro 2024</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">45</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">12</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">8</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">20</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">5</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Fevereiro 2024</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">62</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">18</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">15</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">24</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">5</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Março 2024</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">89</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">25</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">22</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">35</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">7</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}