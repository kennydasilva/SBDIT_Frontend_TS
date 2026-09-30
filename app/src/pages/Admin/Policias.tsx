import { useState, useEffect } from "react";
import { Search, Plus, Pencil, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { ptService } from "../../api/ptService";
import type { CreatePTData, UpdatePTData, PT } from "../../api/ptService";
import { useAuth } from "../../hooks/useAuth";
import { REGEX } from "../../utils/validationSchemas";
import Paginacao from "../../components/Paginacao";
import { mostrarSucesso, mensagemDeErro } from "../../utils/mensagens";
import {
  PAGE, PAGE_TITLE, PAGE_SUBTITLE, CARD, INPUT, LABEL, FIELD_ERROR, FIELD_HINT,
  BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_DANGER, ALERT_ERROR,
  TABLE_HEAD_CELL, TABLE_ROW_HOVER, MODAL_OVERLAY, MODAL_CARD,
} from "../../utils/uiClasses";

const TAMANHO_PAGINA = 20;

const FORM_VAZIO = { nome: "", email: "", senha: "", numero_agente: "", localizacao: "" };

type Erros = Partial<Record<keyof typeof FORM_VAZIO, string>>;

// Agentes (PT) do posto do Admin autenticado.
export default function PTs() {
  const { user, loading: authLoading } = useAuth();
  const [pts, setPts] = useState<PT[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPt, setSelectedPt] = useState<PT | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [erroModal, setErroModal] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalItens, setTotalItens] = useState(0);
  const [formData, setFormData] = useState(FORM_VAZIO);
  const [fieldErrors, setFieldErrors] = useState<Erros>({});

  useEffect(() => {
    if (!authLoading && user) {
      carregarPts(paginaAtual);
    }
  }, [authLoading, user, paginaAtual]);

  const carregarPts = async (pagina: number = paginaAtual) => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await ptService.listarPT(user.id, pagina);
      setPts(data.results);
      setTotalItens(data.count);
    } catch (err) {
      setError(mensagemDeErro(err, "Erro ao carregar os agentes"));
    } finally {
      setLoading(false);
    }
  };

  const validate = (isCreate: boolean) => {
    const errors: Erros = {};
    if (!REGEX.nome.test(formData.nome)) errors.nome = "Apenas letras e espaços (2-100 caracteres)";
    if (isCreate && !REGEX.email.test(formData.email)) errors.email = "Indique um email válido";
    if (isCreate && !REGEX.password.test(formData.senha)) errors.senha = "Mínimo 8 caracteres, com maiúscula, minúscula e número";
    if (!REGEX.numeroAgente.test(formData.numero_agente)) errors.numero_agente = "Apenas letras, números e hífen (2-20)";
    if (!REGEX.localizacao.test(formData.localizacao)) errors.localizacao = "Indique a zona de atuação (3-200 caracteres)";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const abrirCriar = () => {
    setSelectedPt(null);
    setFormData(FORM_VAZIO);
    setFieldErrors({});
    setErroModal(null);
    setShowFormModal(true);
  };

  const abrirEditar = (pt: PT) => {
    setSelectedPt(pt);
    setFormData({ nome: pt.nome, email: pt.email, senha: "", numero_agente: pt.numero_agente, localizacao: pt.localizacao });
    setFieldErrors({});
    setErroModal(null);
    setShowFormModal(true);
  };

  const fecharModal = () => {
    setShowFormModal(false);
    setSelectedPt(null);
  };

  const handleGuardar = async () => {
    if (!user || !validate(!selectedPt)) return;

    try {
      setSubmitting(true);
      setErroModal(null);

      if (selectedPt) {
        const updateData: UpdatePTData = {
          pt_id: selectedPt.id,
          nome: formData.nome,
          numero_agente: formData.numero_agente,
          localizacao: formData.localizacao,
        };
        await ptService.atualizarPT(updateData);
        mostrarSucesso("Agente atualizado.");
      } else {
        const createData: CreatePTData = {
          nome: formData.nome,
          email: formData.email,
          password: formData.senha,
          numero_agente: formData.numero_agente,
          localizacao: formData.localizacao,
          admin_id: user.id,
        };
        await ptService.criarPT(createData);
        mostrarSucesso("Agente criado.");
      }

      fecharModal();
      await carregarPts();
    } catch (err) {
      setErroModal(mensagemDeErro(err, selectedPt ? "Erro ao atualizar o agente" : "Erro ao criar o agente"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPt) return;
    try {
      setSubmitting(true);
      await ptService.apagarPT(selectedPt.id);
      mostrarSucesso("Agente eliminado.");
      setShowDeleteModal(false);
      setSelectedPt(null);
      await carregarPts();
    } catch (err) {
      setErroModal(mensagemDeErro(err, "Erro ao eliminar o agente"));
    } finally {
      setSubmitting(false);
    }
  };

  const filtrados = pts.filter((p) =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const campo = (
    nome: keyof typeof FORM_VAZIO,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
    dica?: string
  ) => (
    <div>
      <label className={LABEL}>{label}</label>
      <input
        value={formData[nome]}
        onChange={(e) => setFormData({ ...formData, [nome]: e.target.value })}
        className={INPUT}
        disabled={submitting}
        {...props}
      />
      {dica && <p className={FIELD_HINT}>{dica}</p>}
      {fieldErrors[nome] && <p className={FIELD_ERROR}>{fieldErrors[nome]}</p>}
    </div>
  );

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <p className="text-rose-600">{error}</p>
          <button onClick={() => carregarPts(paginaAtual)} className={`${BUTTON_PRIMARY} mt-4`}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={PAGE}>
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className={PAGE_TITLE}>Agentes do posto</h1>
          <p className={PAGE_SUBTITLE}>Agentes de trânsito que respondem pela jurisdição do seu posto</p>
        </div>
        <button onClick={abrirCriar} className={BUTTON_PRIMARY}>
          <Plus size={18} />
          Novo agente
        </button>
      </div>

      <div className={`${CARD} p-4 mb-6`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Pesquisar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${INPUT} pl-10`}
          />
        </div>
      </div>

      <div className={`${CARD} overflow-hidden`}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className={TABLE_HEAD_CELL}>Nome</th>
              <th className={TABLE_HEAD_CELL}>Email</th>
              <th className={TABLE_HEAD_CELL}>N.º de agente</th>
              <th className={TABLE_HEAD_CELL}>Zona de atuação</th>
              <th className={`${TABLE_HEAD_CELL} text-right`}>Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                </td>
              </tr>
            ) : filtrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  {searchTerm ? "Nenhum agente corresponde à pesquisa" : "Ainda não há agentes neste posto"}
                </td>
              </tr>
            ) : (
              filtrados.map((pt) => (
                <tr key={pt.id} className={TABLE_ROW_HOVER}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pt.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{pt.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{pt.numero_agente}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{pt.localizacao}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <button
                      onClick={() => abrirEditar(pt)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 mr-1"
                      title="Editar"
                      disabled={submitting}
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      onClick={() => { setSelectedPt(pt); setErroModal(null); setShowDeleteModal(true); }}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50"
                      title="Eliminar"
                      disabled={submitting}
                    >
                      <Trash2 size={17} />
                    </button>
                  </td>
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

      {showFormModal && (
        <div className={MODAL_OVERLAY}>
          <div className={MODAL_CARD}>
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              {selectedPt ? "Editar agente" : "Novo agente"}
            </h2>

            {erroModal && <div className={`${ALERT_ERROR} mb-4`}>{erroModal}</div>}

            <div className="space-y-4">
              {campo("nome", "Nome completo", { placeholder: "Ex: João Cossa" })}
              {campo(
                "email", "Email",
                { type: "email", disabled: submitting || !!selectedPt, placeholder: "nome@exemplo.com" },
                selectedPt ? "O email não pode ser alterado." : undefined
              )}
              {!selectedPt && campo(
                "senha", "Senha inicial",
                { type: "password", autoComplete: "new-password" },
                "Mínimo 8 caracteres, com maiúscula, minúscula e número."
              )}
              {campo("numero_agente", "N.º de agente", { placeholder: "Ex: PT-0452" })}
              {campo("localizacao", "Zona de atuação", { placeholder: "Ex: Av. Julius Nyerere / Mavalane" })}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={fecharModal} className={`${BUTTON_SECONDARY} flex-1`} disabled={submitting}>
                Cancelar
              </button>
              <button onClick={handleGuardar} className={`${BUTTON_PRIMARY} flex-1`} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedPt && (
        <div className={MODAL_OVERLAY}>
          <div className={MODAL_CARD}>
            <div className="flex items-center justify-center w-12 h-12 bg-rose-50 rounded-full mx-auto mb-4">
              <AlertTriangle className="text-rose-600" size={24} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 text-center mb-2">Eliminar agente</h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              Tem a certeza de que quer eliminar <strong>{selectedPt.nome}</strong>? Esta ação não pode ser desfeita.
            </p>
            {erroModal && <div className={`${ALERT_ERROR} mb-4`}>{erroModal}</div>}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setSelectedPt(null); }}
                className={`${BUTTON_SECONDARY} flex-1`}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button onClick={handleDelete} className={`${BUTTON_DANGER} flex-1`} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
