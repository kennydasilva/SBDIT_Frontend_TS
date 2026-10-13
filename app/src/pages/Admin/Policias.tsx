import { useState, useEffect } from "react";





import { Plus, Pencil, Trash2, Loader2 } from "../../components/icons";



import { ptService } from "../../api/ptService";





import type { CreatePTData, UpdatePTData, PT } from "../../api/ptService";
import { useAuth } from "../../hooks/useAuth";





import { REGEX } from "../../utils/validationSchemas";





import Paginacao from "../../components/Paginacao";
import { mostrarSucesso, mensagemDeErro } from "../../utils/mensagens";





import { PAGE, INPUT, LABEL, FIELD_ERROR, FIELD_HINT, BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_DANGER, ALERT_ERROR, TABLE_HEAD_CELL, TABLE_ROW_HOVER, MODAL_OVERLAY, MODAL_CARD, TOOLBAR, CARD_ATTACHED, MODAL_TITLE, MODAL_TEXT, MODAL_FOOTER, ICON_BUTTON, ICON_BUTTON_DANGER } from "../../utils/uiClasses";


import PageHeader from "../../components/app/PageHeader";
import { ErroPagina, CampoPesquisa, LinhaVazia } from "../../components/app/Lista";





import { LinhasEsqueleto } from "../../components/app/Carregando";






const TAMANHO_PAGINA = 10;

const FORM_VAZIO = { nome: "", email: "", senha: "", numero_agente: "" };

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
      const data = await ptService.listarPT(user.id, pagina, TAMANHO_PAGINA);
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
    setFormData({ nome: pt.nome, email: pt.email, senha: "", numero_agente: pt.numero_agente });
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
          localizacao: selectedPt.localizacao,
        };
        await ptService.atualizarPT(updateData);
        mostrarSucesso("Agente atualizado.");
      } else {
        const createData: CreatePTData = {
          nome: formData.nome,
          email: formData.email,
          password: formData.senha,
          numero_agente: formData.numero_agente,
          // O agente pertence ao posto do Admin; já não tem zona própria.
          localizacao: "",
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

  if (error) return <ErroPagina mensagem={error} onTentar={() => carregarPts(paginaAtual)} />;

  return (
    <div className={PAGE}>
      <PageHeader
        titulo="Agentes do posto" texto="Agentes de trânsito que respondem pela jurisdição do seu posto"
        acoes={
          <button onClick={abrirCriar} className={BUTTON_PRIMARY}>
            <Plus size={14} />
            Novo agente
          </button>
        }
      />

      <div className={TOOLBAR}>
        <CampoPesquisa valor={searchTerm} onMudar={setSearchTerm} rotulo="Pesquisar por nome ou email" />
      </div>

      <div className={`${CARD_ATTACHED} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className={TABLE_HEAD_CELL}>Nome</th>
                <th className={TABLE_HEAD_CELL}>Email</th>
                <th className={TABLE_HEAD_CELL}>N.º de agente</th>
                <th className={TABLE_HEAD_CELL}><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <LinhasEsqueleto colunas={4} />
              ) : filtrados.length === 0 ? (
                <LinhaVazia colunas={4}>
                    {searchTerm ? "Nenhum agente corresponde à pesquisa" : "Ainda não há agentes neste posto"}
                  </LinhaVazia>
              ) : (
                filtrados.map((pt) => (
                  <tr key={pt.id} className={TABLE_ROW_HOVER}>
                    <td className="px-6 py-3.5 whitespace-nowrap text-sm font-medium text-gray-900">{pt.nome}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-600">{pt.email}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-600">{pt.numero_agente}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-sm text-right">
                      <button
                        onClick={() => abrirEditar(pt)}
                        className={ICON_BUTTON} aria-label="Editar" title="Editar"
                        disabled={submitting}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => { setSelectedPt(pt); setErroModal(null); setShowDeleteModal(true); }}
                        className={ICON_BUTTON_DANGER} aria-label="Eliminar" title="Eliminar"
                        disabled={submitting}
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
            <h2 className={MODAL_TITLE}>
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
            </div>

            <div className={MODAL_FOOTER}>
              <button onClick={fecharModal} className={BUTTON_SECONDARY} disabled={submitting}>
                Cancelar
              </button>
              <button onClick={handleGuardar} className={BUTTON_PRIMARY} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedPt && (
        <div className={MODAL_OVERLAY}>
          <div className={MODAL_CARD}>
            <h2 className={MODAL_TITLE}>Eliminar agente</h2>
            <p className={MODAL_TEXT}>
              Tem a certeza de que quer eliminar <strong>{selectedPt.nome}</strong>? Esta ação não pode ser desfeita.
            </p>
            {erroModal && <div className={`${ALERT_ERROR} mb-4`}>{erroModal}</div>}
            <div className={MODAL_FOOTER}>
              <button
                onClick={() => { setShowDeleteModal(false); setSelectedPt(null); }}
                className={BUTTON_SECONDARY}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button onClick={handleDelete} className={BUTTON_DANGER} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
