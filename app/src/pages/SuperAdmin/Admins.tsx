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

const OUTRO_POSTO = "__OUTRO__";




export default function Admins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [loading, setLoading]= useState(true);
  const [submitting, setSubmitting]= useState(false);
  const [error, setError]= useState<string | null>(null);
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
    carregarAdmins();
  }, []);


  const carregarAdmins= async() =>{
    try{
      setLoading(true);
      setError(null);
      const data= await adminService.listarAdmins();
      setAdmins(data);
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
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={carregarAdmins}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestão de Administradores</h1>
        <button
          onClick={() => {
            setSelectedAdmin(null);
            resetForm();
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg hover:bg-[#1E40AF] transition-colors"
        >
          <Plus size={20} />
          Novo Administrador
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Criação</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAdmins.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Nenhum administrador encontrado
                </td>
              </tr>
            ) : (
              filteredAdmins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{admin.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{admin.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{admin.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{admin.posto}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{admin.dataCriacao || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      admin.status === "Ativo"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {admin.status || "Ativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(admin)}
                      className="text-[#2563EB] hover:text-[#1E40AF] mr-3"
                      disabled={submitting}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAdmin(admin);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-600 hover:text-red-800"
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
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {selectedAdmin ? "Editar Administrador" : "Criar Novo Administrador"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={submitting}
                />
                {fieldErrors.nome && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.nome}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={submitting || !!selectedAdmin}
                />
                {selectedAdmin && (
                  <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
                )}
                {fieldErrors.email && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
                )}
              </div>

              {!selectedAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                  <input
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                  />
                  {fieldErrors.senha && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.senha}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Posto</label>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={submitting}
                        />
                      )}
                    </>
                  );
                })()}
                {fieldErrors.posto && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.posto}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
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

                  <label className="flex items-center">
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
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                onClick={selectedAdmin ? handleUpdate : handleCreate}
                className="flex-1 px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1E40AF] transition-colors disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <AlertTriangle className="text-red-600" size={24} />
            </div>

            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Confirmar Exclusão</h2>
            <p className="text-gray-600 text-center mb-6">
              Tem certeza que deseja excluir o administrador <strong>{selectedAdmin.nome}</strong>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedAdmin(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
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
