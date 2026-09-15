import { useEffect, useState } from "react";
import { Search, MapPin, Calendar, AlertTriangle, Loader2 } from "lucide-react";
import { superAdminService } from "../../api/superAdminService";
import type { DenunciaDetalhada } from "../../api/denunciaService";
import Paginacao from "../../components/Paginacao";
import { CARD, INPUT, BUTTON_PRIMARY, BADGE, STATUS_TONES } from "../../utils/uiClasses";

const TAMANHO_PAGINA = 20;

const ESTADOS = ["Todos", "PENDENTE", "VALIDADA", "APROVADA", "REJEITADA", "ARQUIVADA"] as const;

const ESTADO_LABEL: Record<string, string> = {
  PENDENTE: "Pendente",
  VALIDADA: "Validada",
  APROVADA: "Aprovada",
  REJEITADA: "Rejeitada",
  ARQUIVADA: "Arquivada",
};

const ESTADO_TONE: Record<string, string> = {
  PENDENTE: STATUS_TONES.amber,
  VALIDADA: STATUS_TONES.blue,
  APROVADA: STATUS_TONES.emerald,
  REJEITADA: STATUS_TONES.rose,
  ARQUIVADA: STATUS_TONES.gray,
};

export default function Denuncias() {
  const [denuncias, setDenuncias] = useState<DenunciaDetalhada[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("Todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalItens, setTotalItens] = useState(0);

  useEffect(() => {
    carregarDenuncias(paginaAtual);
  }, [paginaAtual]);

  const carregarDenuncias = async (pagina: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await superAdminService.listarDenuncias(pagina);
      setDenuncias(data.results);
      setTotalItens(data.count);
    } catch (err) {
      setError("Erro ao carregar denúncias.");
    } finally {
      setLoading(false);
    }
  };

  const filteredDenuncias = denuncias.filter(denuncia => {
    const matchesSearch =
      denuncia.matricula?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      denuncia.localizacao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "Todos" || denuncia.estado === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusCount = {
    Pendente: denuncias.filter(d => d.estado === "PENDENTE").length,
    Validada: denuncias.filter(d => d.estado === "VALIDADA").length,
    Aprovada: denuncias.filter(d => d.estado === "APROVADA").length,
    Rejeitada: denuncias.filter(d => d.estado === "REJEITADA").length,
  };

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
            onClick={() => carregarDenuncias(paginaAtual)}
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
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Denúncias</h1>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(statusCount).map(([status, count]) => (
          <div key={status} className={`${CARD} p-4`}>
            <p className="text-sm text-gray-500 mb-1">{status}</p>
            <p className="text-2xl font-semibold text-gray-900">{count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`${CARD} p-4 mb-6`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por matrícula ou localização..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${INPUT} pl-10`}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={INPUT}
          >
            {ESTADOS.map(estado => (
              <option key={estado} value={estado}>
                {estado === "Todos" ? "Todos os Status" : ESTADO_LABEL[estado]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Denuncias List */}
      <div className="space-y-4">
        {filteredDenuncias.length === 0 ? (
          <div className={`${CARD} p-8 text-center text-gray-500`}>
            Nenhuma denúncia encontrada
          </div>
        ) : (
          filteredDenuncias.map((denuncia) => (
            <div key={denuncia.id} className={`${CARD} p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    {denuncia.matricula} — {denuncia.tipo_infracao}
                  </h3>
                  <p className="text-gray-600 mb-3">{denuncia.descricao}</p>
                </div>
                <span className={`${BADGE} ${ESTADO_TONE[denuncia.estado] ?? STATUS_TONES.gray}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                  {ESTADO_LABEL[denuncia.estado] || denuncia.estado}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  <span>{denuncia.localizacao}</span>
                </div>
                {denuncia.data_captura && (
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>{denuncia.data_captura}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {totalItens > TAMANHO_PAGINA && (
        <div className={`${CARD} mt-4`}>
          <Paginacao
            paginaAtual={paginaAtual}
            totalItens={totalItens}
            tamanhoPagina={TAMANHO_PAGINA}
            onMudarPagina={setPaginaAtual}
            disabled={loading}
          />
        </div>
      )}
    </div>
  );
}
