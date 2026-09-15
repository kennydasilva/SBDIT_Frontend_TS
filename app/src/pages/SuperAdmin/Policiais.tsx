import { useEffect, useState } from "react";
import { Search, AlertTriangle, Loader2 } from "lucide-react";
import { superAdminService } from "../../api/superAdminService";
import type { PT } from "../../api/ptService";
import Paginacao from "../../components/Paginacao";
import { CARD, INPUT, BUTTON_PRIMARY, TABLE_HEAD_CELL, TABLE_ROW_HOVER } from "../../utils/uiClasses";

const TAMANHO_PAGINA = 20;

export default function Policiais() {
  const [policiais, setPoliciais] = useState<PT[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAdmin, setFilterAdmin] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalItens, setTotalItens] = useState(0);

  useEffect(() => {
    carregarPoliciais(paginaAtual);
  }, [paginaAtual]);

  const carregarPoliciais = async (pagina: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await superAdminService.listarPts(pagina);
      setPoliciais(data.results);
      setTotalItens(data.count);
    } catch (err) {
      setError("Erro ao carregar policiais.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPoliciais = policiais.filter(policial => {
    const matchesSearch =
      policial.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policial.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterAdmin === "Todos" || String(policial.admin_id) === filterAdmin;
    return matchesSearch && matchesFilter;
  });

  const admins = ["Todos", ...Array.from(new Set(policiais.map(p => String(p.admin_id))))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <p className="text-rose-600">{error}</p>
          <button
            onClick={() => carregarPoliciais(paginaAtual)}
            className={`${BUTTON_PRIMARY} mt-4`}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50/50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Gestão de Policiais (PT)</h1>
      </div>

      {/* Filters */}
      <div className={`${CARD} p-4 mb-6`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${INPUT} pl-10`}
            />
          </div>
          <select
            value={filterAdmin}
            onChange={(e) => setFilterAdmin(e.target.value)}
            className={INPUT}
          >
            {admins.map(admin => (
              <option key={admin} value={admin}>
                {admin === "Todos" ? "Todos os Admins" : `Admin #${admin}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={`${CARD} overflow-hidden`}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className={TABLE_HEAD_CELL}>ID</th>
              <th className={TABLE_HEAD_CELL}>Número do Agente</th>
              <th className={TABLE_HEAD_CELL}>Nome</th>
              <th className={TABLE_HEAD_CELL}>Email</th>
              <th className={TABLE_HEAD_CELL}>Localização</th>
              <th className={TABLE_HEAD_CELL}>Admin Responsável</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredPoliciais.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Nenhum policial encontrado
                </td>
              </tr>
            ) : (
              filteredPoliciais.map((policial) => (
                <tr key={policial.id} className={TABLE_ROW_HOVER}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{policial.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{policial.numero_agente}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{policial.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{policial.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{policial.localizacao}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">#{policial.admin_id}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Paginacao
          paginaAtual={paginaAtual}
          totalItens={totalItens}
          tamanhoPagina={TAMANHO_PAGINA}
          onMudarPagina={setPaginaAtual}
          disabled={loading}
        />
      </div>
    </div>
  );
}
