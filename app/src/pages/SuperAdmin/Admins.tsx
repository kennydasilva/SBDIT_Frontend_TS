import { useState, useEffect } from "react";
import { Search, Plus, Pencil, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { adminService } from "../../api/superAdminService";
import type {
  CreateAdminData,
  UpdateAdminData,
  Admin
} from "../../api/superAdminService";
import { REGEX } from "../../utils/validationSchemas";
import { POSTOS_MAPUTO } from "../../utils/postosMaputo";
import Paginacao from "../../components/Paginacao";
import {
  CARD, INPUT, LABEL, BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_DANGER,
  BADGE, TABLE_HEAD_CELL, TABLE_ROW_HOVER, MODAL_OVERLAY, MODAL_CARD,
} from "../../utils/uiClasses";

const OUTRO_POSTO = "__OUTRO__";
const TAMANHO_PAGINA = 20;




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
    status: "Ativo" as "Ativo" | "Inativo"
  });
  const [fieldErrors, setFieldErrors] = useState<{
    nome?: string;
    email?: string;
    senha?: string;
    posto?: string;
  }>({});

  const validate = (isCreate: boolean) => {
    const errors: typeof fieldErrors = {};

    if (!REGEX.nome.test(formData.nome)) {
      errors.nome = "O nome deve conter apenas letras e espaços (2-100 caracteres)";
    }

    if (isCreate && !REGEX.email.test(formData.email)) {
      errors.email = "Digite um email válido";
    }

    if (isCreate && !REGEX.password.test(formData.senha)) {
      errors.senha = "A senha deve ter no mínimo 8 caracteres, com maiúscula, minúscula e número";
    }

    if (!REGEX.posto.test(formData.posto)) {
      errors.posto = "Indique o nome do posto (2-100 caracteres)";
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
      const data= await adminService.listarAdmins(pagina);
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

      };


      await adminService.criarAdmin(createData);
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
      alert(errorMessage);

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
      }

      adminService.atualizarAdmin(updateData);
      await carregarAdmins();
      setShowCreateModal(false);
      setSelectedAdmin(null);
      resetForm();

    }
    catch(error: any){
      console.error("Erro ao atualizar administrador: ", error);
      alert(error.response?.data?.message || "Erro ao atualizar administrador");

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
      await carregarAdmins();
      setShowDeleteModal(false);
      setSelectedAdmin(null);
    }catch(error: any){
      console.error("Erro ao excluir administrador: ", error);
      alert(error.response?.data?.message || "Erro ao excluir administrador");
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
      status: "Ativo"
    });
    setFieldErrors({});
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
            onClick={() => carregarAdmins(paginaAtual)}
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
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Gestão de Administradores</h1>
        <button
          onClick={() => {
            setSelectedAdmin(null);
            resetForm();
            setShowCreateModal(true);
          }}
          className={BUTTON_PRIMARY}
        >
          <Plus size={20} />
          Novo Administrador
        </button>
      </div>

      {/* Search Bar */}
      <div className={`${CARD} p-4 mb-6`}>
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
      </div>

      {/* Table */}
      <div className={`${CARD} overflow-hidden`}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className={TABLE_HEAD_CELL}>ID</th>
              <th className={TABLE_HEAD_CELL}>Nome</th>
              <th className={TABLE_HEAD_CELL}>Email</th>
              <th className={TABLE_HEAD_CELL}>Posto</th>
              <th className={TABLE_HEAD_CELL}>Data de Criação</th>
              <th className={TABLE_HEAD_CELL}>Status</th>
              <th className={TABLE_HEAD_CELL}>Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredAdmins.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Nenhum administrador encontrado
                </td>
              </tr>
            ) : (
              filteredAdmins.map((admin) => (
                <tr key={admin.id} className={TABLE_ROW_HOVER}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{admin.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{admin.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{admin.posto}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.dataCriacao || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`${BADGE} ${admin.status === "Ativo" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                      {admin.status || "Ativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(admin)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                      disabled={submitting}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAdmin(admin);
                        setShowDeleteModal(true);
                      }}
                      className="text-rose-600 hover:text-rose-800"
                      disabled={submitting}
                    >
                      <Trash2 size={18} />
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

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className={MODAL_OVERLAY}>
          <div className={MODAL_CARD}>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              {selectedAdmin ? "Editar Administrador" : "Criar Novo Administrador"}
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
                <label className={`${LABEL} mb-2`}>Status</label>
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

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedAdmin(null);
                  resetForm();
                }}
                className={`${BUTTON_SECONDARY} flex-1`}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                onClick={selectedAdmin ? handleUpdate : handleCreate}
                className={`${BUTTON_PRIMARY} flex-1`}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Salvar"
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
            <div className="flex items-center justify-center w-12 h-12 bg-rose-50 rounded-full mx-auto mb-4">
              <AlertTriangle className="text-rose-600" size={24} />
            </div>

            <h2 className="text-lg font-semibold text-gray-900 text-center mb-2">Confirmar Exclusão</h2>
            <p className="text-gray-600 text-center mb-6">
              Tem certeza que deseja excluir o administrador <strong>{selectedAdmin.nome}</strong>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedAdmin(null);
                }}
                className={`${BUTTON_SECONDARY} flex-1`}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className={`${BUTTON_DANGER} flex-1`}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Excluir"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
