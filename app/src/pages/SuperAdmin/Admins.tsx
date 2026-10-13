import TelefoneInput from "../../components/TelefoneInput";
import { useState, useEffect } from "react";



import { Plus, Pencil, Trash2, Loader2 } from "../../components/icons";

import { adminService } from "../../api/superAdminService";



import type {
  CreateAdminData,
  UpdateAdminData,
  Admin
} from "../../api/superAdminService";
import { REGEX } from "../../utils/validationSchemas";



import { POSTOS_MAPUTO } from "../../utils/postosMaputo";



import Paginacao from "../../components/Paginacao";
import { INPUT, LABEL, BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_DANGER, BADGE, TABLE_HEAD_CELL, TABLE_ROW_HOVER, MODAL_OVERLAY, MODAL_CARD, PAGE, TOOLBAR, CARD_ATTACHED, MODAL_TITLE, MODAL_TEXT, ICON_BUTTON, ICON_BUTTON_DANGER, MODAL_FOOTER } from "../../utils/uiClasses";


import { mostrarErro, mostrarSucesso } from "../../utils/mensagens";



import PageHeader from "../../components/app/PageHeader";
import { PaginaEsqueleto } from "../../components/app/Carregando";



import { ErroPagina, CampoPesquisa, LinhaVazia } from "../../components/app/Lista";



import { formatarDataHora } from "../../utils/datas";




const OUTRO_POSTO = "__OUTRO__";
const TAMANHO_PAGINA = 10;




export default function Admins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [loading, setLoading]= useState(true);
  const [submitting, setSubmitting]= useState(false);
  const [error, setError]= useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalItens, setTotalItens] = useState(0);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    posto: "",
    numero: "",
    status: "Ativo" as "Ativo" | "Inativo"
  });
  const [fieldErrors, setFieldErrors] = useState<{
    nome?: string;
    email?: string;
    senha?: string;
    posto?: string;
    numero?: string;
  }>({});

  const validate = (isCreate: boolean) => {
    const errors: typeof fieldErrors = {};

    if (!REGEX.nome.test(formData.nome)) {
      errors.nome = "O nome deve conter apenas letras e espaços (2-100 caracteres)";
    }

    if (isCreate && !REGEX.email.test(formData.email)) {
      errors.email = "Indique um email válido";
    }

    if (isCreate && !REGEX.password.test(formData.senha)) {
      errors.senha = "A senha deve ter no mínimo 8 caracteres, com maiúscula, minúscula e número";
    }

    if (!REGEX.posto.test(formData.posto)) {
      errors.posto = "Indique o nome do posto (2-100 caracteres)";
    }

    // Obrigatório: é para este número que vai o SMS de acidente na
    // jurisdição do posto - sem ele o Admin nunca é avisado.
    if (!REGEX.telefone.test(formData.numero)) {
      errors.numero = "Indique um número válido (9 dígitos, começado por 8)";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() =>{
    carregarAdmins(paginaAtual);
  }, [paginaAtual]);


  const carregarAdmins= async(pagina: number = paginaAtual) =>{
    try{
      setLoading(true);
      setError(null);
      const data= await adminService.listarAdmins(pagina, TAMANHO_PAGINA);
      setAdmins(data.results);
      setTotalItens(data.count);
    }
    catch(error: any){
      console.error("Erro ao carregar administradores: ", error);
      setError(error.response?.data?.message || "Erro ao carregar administradores");

    }
    finally{
      setLoading(false);
    }
  }

  const filteredAdmins = admins.filter(admin =>
    admin.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async() => {
    if (!validate(true)) return;

    try{
      setSubmitting(true);

      const createData: CreateAdminData = {
        nome: formData.nome,
        email: formData.email,
        password: formData.senha,
        posto: formData.posto,
        numero: formData.numero,
      };


      await adminService.criarAdmin(createData);
      mostrarSucesso("Administrador criado.");
      await carregarAdmins();
      setShowCreateModal(false);
      resetForm();

  }catch(error){
      console.error("Erro ao criar administrador: ", error);

      let errorMessage = "Erro ao criar administrador";
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      mostrarErro(error, errorMessage);

  }
  finally{
    setSubmitting(false);
  }
  };

  const handleEdit = (admin: Admin) => {
    setSelectedAdmin(admin);
    setFormData({
      nome: admin.nome,
      email: admin.email,
      senha: "",
      posto: admin.posto,
      numero: admin.numero || "",
      status: (admin.status ==="Inativo" ? "Inativo" : "Ativo") as "Ativo" | "Inativo"
    });
    setShowCreateModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedAdmin) return;
    if (!validate(false)) return;

    try{
      setSubmitting(true);

      const updateData: UpdateAdminData={
        admin_id: selectedAdmin.id,
        nome: formData.nome,
        posto: formData.posto,
        numero: formData.numero,
      }

      await adminService.atualizarAdmin(updateData);
      mostrarSucesso("Administrador atualizado.");
      await carregarAdmins();
      setShowCreateModal(false);
      setSelectedAdmin(null);
      resetForm();

    }
    catch(error: any){
      console.error("Erro ao atualizar administrador: ", error);
      mostrarErro(error, "Erro ao atualizar o administrador");

    }
    finally{
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAdmin) return;

    try{
      setSubmitting(true);
      await adminService.apagarAdmin(selectedAdmin.id);
      mostrarSucesso("Administrador eliminado.");
      await carregarAdmins();
      setShowDeleteModal(false);
      setSelectedAdmin(null);
    }catch(error: any){
      console.error("Erro ao excluir administrador: ", error);
      mostrarErro(error, "Erro ao eliminar o administrador");
    }
    finally{
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      senha: "",
      posto: "",
      numero: "",
      status: "Ativo"
    });
    setFieldErrors({});
  };

  if (loading) return <PaginaEsqueleto />;

  if (error) return <ErroPagina mensagem={error} onTentar={() => carregarAdmins(paginaAtual)} />;

  return (
    <div className={PAGE}>
      <PageHeader
        titulo="Administradores"
        texto="Cada administrador gere um posto policial: os seus agentes e os acidentes da sua jurisdição."
        acoes={
          <button
            onClick={() => {
              setSelectedAdmin(null);
              resetForm();
              setShowCreateModal(true);
            }}
            className={BUTTON_PRIMARY}
          >
            <Plus size={14} />
            Novo administrador
          </button>
        }
      />

      {/* Search Bar */}
      <div className={TOOLBAR}>
        <CampoPesquisa valor={searchTerm} onMudar={setSearchTerm} rotulo="Pesquisar por nome ou email" />
      </div>

      {/* Table */}
      <div className={`${CARD_ATTACHED} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                  <th className={TABLE_HEAD_CELL}>Nome</th>
                <th className={TABLE_HEAD_CELL}>Email</th>
                <th className={TABLE_HEAD_CELL}>Posto</th>
                <th className={TABLE_HEAD_CELL}>Telemóvel</th>
                <th className={TABLE_HEAD_CELL}>Criado em</th>
                <th className={TABLE_HEAD_CELL}>Estado</th>
                <th className={TABLE_HEAD_CELL}><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAdmins.length === 0 ? (
                <LinhaVazia colunas={7}>
                    Nenhum administrador encontrado
                  </LinhaVazia>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id} className={TABLE_ROW_HOVER}>
                    <td className="px-6 py-3.5 whitespace-nowrap text-sm font-medium text-gray-900">{admin.nome}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-600">{admin.email}</td>
                    <td className="px-6 py-3.5 text-sm text-gray-600">{admin.posto}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-600">
                      {admin.numero || <span className="text-gray-500" title="Este posto não recebe os acidentes por SMS">Sem número</span>}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-500">{formatarDataHora(admin.dataCriacao)}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className={`${BADGE} ${admin.status === "Ativo" ? "bg-blue-50 text-blue-800" : "bg-gray-100 text-gray-500"}`}>
                        {admin.status || "Ativo"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEdit(admin)}
                        className={`${ICON_BUTTON} mr-1`} aria-label="Editar" title="Editar"
                        disabled={submitting}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAdmin(admin);
                          setShowDeleteModal(true);
                        }}
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

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className={MODAL_OVERLAY}>
          <div className={MODAL_CARD}>
            <h2 className={MODAL_TITLE}>
              {selectedAdmin ? "Editar administrador" : "Novo administrador"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className={LABEL}>Nome Completo</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className={INPUT}
                  disabled={submitting}
                />
                {fieldErrors.nome && (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.nome}</p>
                )}
              </div>

              <div>
                <label className={LABEL}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={INPUT}
                  disabled={submitting || !!selectedAdmin}
                />
                {selectedAdmin && (
                  <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
                )}
                {fieldErrors.email && (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.email}</p>
                )}
              </div>

              {!selectedAdmin && (
                <div>
                  <label className={LABEL}>Senha</label>
                  <input
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    className={INPUT}
                    disabled={submitting}
                  />
                  {fieldErrors.senha && (
                    <p className="text-xs text-rose-600 mt-1">{fieldErrors.senha}</p>
                  )}
                </div>
              )}

              <div>
                <label className={LABEL}>Posto</label>
                {(() => {
                  const postoEhConhecido = POSTOS_MAPUTO.includes(formData.posto);
                  const valorSelect = postoEhConhecido ? formData.posto : (formData.posto ? OUTRO_POSTO : "");

                  return (
                    <>
                      <select
                        value={valorSelect}
                        onChange={(e) => {
                          const valor = e.target.value;
                          setFormData({
                            ...formData,
                            posto: valor === OUTRO_POSTO ? (postoEhConhecido ? "" : formData.posto) : valor,
                          });
                        }}
                        className={INPUT}
                        disabled={submitting}
                      >
                        <option value="">Selecione o posto...</option>
                        {POSTOS_MAPUTO.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                        <option value={OUTRO_POSTO}>Outro (não está na lista)</option>
                      </select>

                      {valorSelect === OUTRO_POSTO && (
                        <input
                          type="text"
                          value={formData.posto}
                          onChange={(e) => setFormData({ ...formData, posto: e.target.value })}
                          placeholder="Ex: Posto Policial de..."
                          className={`${INPUT} mt-2`}
                          disabled={submitting}
                        />
                      )}
                    </>
                  );
                })()}
                {fieldErrors.posto && (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.posto}</p>
                )}
              </div>

              <div>
                <label className={LABEL}>Telemóvel</label>
                <TelefoneInput
                  value={formData.numero}
                  onChange={(numero) => setFormData({ ...formData, numero })}
                  disabled={submitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recebe por SMS os acidentes reportados na jurisdição deste posto.
                </p>
                {fieldErrors.numero && (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.numero}</p>
                )}
              </div>

              <div>
                <label className={`${LABEL} mb-2`}>Estado</label>
                <div className="flex gap-4">
                  <label className="flex items-center text-sm text-gray-700">
                    <input
                      type="radio"
                      value="Ativo"
                      checked={formData.status === "Ativo"}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as "Ativo" })}
                      className="mr-2"
                      disabled={submitting}
                    />
                    Ativo
                  </label>

                  <label className="flex items-center text-sm text-gray-700">
                    <input
                      type="radio"
                      value="Inativo"
                      checked={formData.status === "Inativo"}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as "Inativo" })}
                      className="mr-2"
                      disabled={submitting}
                    />
                    Inativo
                  </label>
                </div>
              </div>
            </div>

            <div className={MODAL_FOOTER}>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedAdmin(null);
                  resetForm();
                }}
                className={BUTTON_SECONDARY}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                onClick={selectedAdmin ? handleUpdate : handleCreate}
                className={BUTTON_PRIMARY}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Guardar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedAdmin && (
        <div className={MODAL_OVERLAY}>
          <div className={MODAL_CARD}>

            <h2 className={MODAL_TITLE}>Eliminar administrador</h2>
            <p className={MODAL_TEXT}>
              Tem a certeza de que quer eliminar o administrador <strong>{selectedAdmin.nome}</strong>?
            </p>

            <div className={MODAL_FOOTER}>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedAdmin(null);
                }}
                className={BUTTON_SECONDARY}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className={BUTTON_DANGER}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Eliminar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
