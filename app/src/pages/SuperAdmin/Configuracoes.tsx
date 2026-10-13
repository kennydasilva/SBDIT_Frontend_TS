import { useEffect, useState } from "react";

import { Plus, Trash2, Loader2, KeyRound } from "../../components/icons";
import { configService, type ConfigEntry } from "../../api/configService";

import {
  CARD, INPUT, LABEL, BUTTON_PRIMARY, BUTTON_SECONDARY,
  BADGE, TABLE_HEAD_CELL, TABLE_ROW_HOVER, MODAL_OVERLAY, MODAL_CARD, PAGE, MODAL_TITLE, ALERT_INFO, ICON_BUTTON_DANGER, MODAL_FOOTER } from "../../utils/uiClasses";

import { mostrarAviso, mostrarErro } from "../../utils/mensagens";

import PageHeader from "../../components/app/PageHeader";
import { PaginaEsqueleto } from "../../components/app/Carregando";

import { ErroPagina, LinhaVazia } from "../../components/app/Lista";


const CHAVES_CONHECIDAS = [
  { chave: "GOOGLE_MAPS_API_KEY", descricao: "Chave JS do Google Maps (pública)", publica: true },
  { chave: "MOZESMS_API_KEY", descricao: "API Key da MozeSMS - SMS de acidentes (privada)", publica: false },
  { chave: "MOZESMS_API_SECRET", descricao: "API Secret da MozeSMS - SMS de acidentes (privada)", publica: false },
  { chave: "MOZESMS_SENDER_ID", descricao: "Nome de remetente aprovado na MozeSMS (opcional)", publica: false },
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
      mostrarAviso("A chave e o valor são obrigatórios.");
      return;
    }

    try {
      setSubmitting(true);
      await configService.definir(formData);
      await carregarConfigs();
      setShowModal(false);
      resetForm();
    } catch (err) {
      mostrarErro(err, "Erro ao guardar a configuração");
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
      mostrarErro(err, "Erro ao apagar a configuração");
    }
  };

  if (loading) return <PaginaEsqueleto />;

  if (error) return <ErroPagina mensagem={error} onTentar={carregarConfigs} />;

  return (
    <div className={PAGE}>
      <PageHeader
        titulo="Configurações" texto="Credenciais de integrações externas (Google Maps, MozeSMS, etc.)"
        acoes={
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className={BUTTON_PRIMARY}
          >
            <Plus size={14} />
            Nova credencial
          </button>
        }
      />

      <div className={`${ALERT_INFO} mb-6`}>
        <strong>Público</strong> = seguro para expor ao browser (ex: chave JS do Google Maps,
        protegida por restrição de domínio na Google Cloud Console). Nunca marques como
        pública uma credencial de servidor (ex: API Secret da MozeSMS).
      </div>

      <div className={`${CARD} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className={TABLE_HEAD_CELL}>Chave</th>
                <th className={TABLE_HEAD_CELL}>Valor</th>
                <th className={TABLE_HEAD_CELL}>Descrição</th>
                <th className={TABLE_HEAD_CELL}>Visibilidade</th>
                <th className={TABLE_HEAD_CELL}><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {configs.length === 0 ? (
                <LinhaVazia colunas={5}>
                    Nenhuma credencial configurada
                  </LinhaVazia>
              ) : (
                configs.map((c) => (
                  <tr key={c.chave} className={TABLE_ROW_HOVER}>
                    <td className="px-6 py-3.5 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <KeyRound size={14} className="text-gray-500" />
                        {c.chave}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-600 font-mono">{c.valor_mascarado}</td>
                    <td className="px-6 py-3.5 text-sm text-gray-600">{c.descricao || "—"}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className={`${BADGE} ${c.publica ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                        {c.publica ? "Pública" : "Privada"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleApagar(c.chave)}
                        className={ICON_BUTTON_DANGER} aria-label="Eliminar" title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className={MODAL_OVERLAY}>
          <div className={`${MODAL_CARD} max-w-lg`}>
            <h2 className={MODAL_TITLE}>Nova credencial</h2>

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
                  placeholder="Cola aqui a chave/segredo (ex: API Key ou API Secret da MozeSMS)"
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

            <div className={MODAL_FOOTER}>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className={BUTTON_SECONDARY}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                className={BUTTON_PRIMARY}
                disabled={submitting}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
