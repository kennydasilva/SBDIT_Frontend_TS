import { useEffect, useState } from "react";
import { Plus, Trash2, AlertTriangle, Loader2, KeyRound } from "lucide-react";
import { configService, type ConfigEntry } from "../../api/configService";
import {
  CARD, INPUT, LABEL, BUTTON_PRIMARY, BUTTON_SECONDARY,
  BADGE, TABLE_HEAD_CELL, TABLE_ROW_HOVER, MODAL_OVERLAY, MODAL_CARD,
} from "../../utils/uiClasses";

const CHAVES_CONHECIDAS = [
  { chave: "GOOGLE_MAPS_API_KEY", descricao: "Chave JS do Google Maps (pública)", publica: true },
  { chave: "FIREBASE_SERVICE_ACCOUNT_JSON", descricao: "JSON do Firebase Admin SDK (privada)", publica: false },
  { chave: "FIREBASE_SERVER_KEY", descricao: "Chave de servidor do Firebase (privada)", publica: false },
];

const OUTRA_CHAVE = "__OUTRA__";

export default function Configuracoes() {
  const [configs, setConfigs] = useState<ConfigEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [chaveSelecionada, setChaveSelecionada] = useState<string>("");
  const [formData, setFormData] = useState({
    chave: "",
    valor: "",
    publica: false,
    descricao: "",
  });

  useEffect(() => {
    carregarConfigs();
  }, []);

  const carregarConfigs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await configService.listar();
      setConfigs(data);
    } catch (err) {
      setError("Erro ao carregar configurações.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ chave: "", valor: "", publica: false, descricao: "" });
    setChaveSelecionada("");
  };

  const handleSelecionarChave = (valor: string) => {
    setChaveSelecionada(valor);

    if (valor === OUTRA_CHAVE || valor === "") {
      setFormData({ ...formData, chave: "" });
      return;
    }

    const conhecida = CHAVES_CONHECIDAS.find((c) => c.chave === valor);
    setFormData({
      ...formData,
      chave: valor,
      publica: conhecida?.publica ?? formData.publica,
      descricao: conhecida?.descricao ?? formData.descricao,
    });
  };

  const handleSalvar = async () => {
    if (!formData.chave.trim() || !formData.valor.trim()) {
      alert("Chave e valor são obrigatórios.");
      return;
    }

    try {
      setSubmitting(true);
      await configService.definir(formData);
      await carregarConfigs();
      setShowModal(false);
      resetForm();
    } catch (err) {
      alert("Erro ao guardar configuração.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApagar = async (chave: string) => {
    if (!confirm(`Apagar a credencial "${chave}"? Qualquer funcionalidade que dependa dela deixa de funcionar.`)) {
      return;
    }

    try {
      await configService.apagar(chave);
      await carregarConfigs();
    } catch (err) {
      alert("Erro ao apagar configuração.");
    }
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
            onClick={carregarConfigs}
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Configurações</h1>
          <p className="text-gray-500 mt-1">
            Credenciais de integrações externas (Google Maps, Firebase, etc.)
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className={BUTTON_PRIMARY}
        >
          <Plus size={20} />
          Nova Credencial
        </button>
      </div>

      <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
        <strong>Público</strong> = seguro para expor ao browser (ex: chave JS do Google Maps,
        protegida por restrição de domínio na Google Cloud Console). Nunca marques como
        pública uma credencial de servidor (ex: chave privada do Firebase Admin SDK).
      </div>

      <div className={`${CARD} overflow-hidden`}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className={TABLE_HEAD_CELL}>Chave</th>
              <th className={TABLE_HEAD_CELL}>Valor</th>
              <th className={TABLE_HEAD_CELL}>Descrição</th>
              <th className={TABLE_HEAD_CELL}>Visibilidade</th>
              <th className={TABLE_HEAD_CELL}>Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {configs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Nenhuma credencial configurada
                </td>
              </tr>
            ) : (
              configs.map((c) => (
                <tr key={c.chave} className={TABLE_ROW_HOVER}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <KeyRound size={14} className="text-gray-400" />
                      {c.chave}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{c.valor_mascarado}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.descricao || "—"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`${BADGE} ${c.publica ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                      {c.publica ? "Pública" : "Privada"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleApagar(c.chave)}
                      className="text-rose-600 hover:text-rose-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className={MODAL_OVERLAY}>
          <div className={`${MODAL_CARD} max-w-lg`}>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Nova Credencial</h2>

            <div className="space-y-4">
              <div>
                <label className={LABEL}>Chave</label>
                <select
                  value={chaveSelecionada}
                  onChange={(e) => handleSelecionarChave(e.target.value)}
                  className={INPUT}
                  disabled={submitting}
                >
                  <option value="">Selecione a credencial...</option>
                  {CHAVES_CONHECIDAS.map((c) => (
                    <option key={c.chave} value={c.chave}>
                      {c.chave}
                    </option>
                  ))}
                  <option value={OUTRA_CHAVE}>Outra (personalizada)</option>
                </select>

                {chaveSelecionada === OUTRA_CHAVE && (
                  <input
                    type="text"
                    value={formData.chave}
                    onChange={(e) => setFormData({ ...formData, chave: e.target.value.toUpperCase().replace(/\s+/g, "_") })}
                    placeholder="Ex: MINHA_CHAVE_PERSONALIZADA"
                    className={`${INPUT} mt-2`}
                    disabled={submitting}
                  />
                )}
              </div>

              <div>
                <label className={LABEL}>Valor</label>
                <textarea
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  placeholder="Cola aqui a chave/segredo (ex: uma chave simples ou um JSON completo do Firebase Admin SDK)"
                  rows={6}
                  className={`${INPUT} font-mono text-sm`}
                  disabled={submitting}
                />
              </div>

              <div>
                <label className={LABEL}>Descrição (opcional)</label>
                <input
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Ex: Chave JS do Google Maps para o mapa de denúncias"
                  className={INPUT}
                  disabled={submitting}
                />
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.publica}
                  onChange={(e) => setFormData({ ...formData, publica: e.target.checked })}
                  className="mt-1"
                  disabled={submitting}
                />
                <span className="text-sm text-gray-700">
                  Esta credencial é <strong>segura para expor ao frontend</strong> (browser).
                  Deixa desmarcado para segredos de servidor.
                </span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className={`${BUTTON_SECONDARY} flex-1`}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                className={`${BUTTON_PRIMARY} flex-1`}
                disabled={submitting}
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
