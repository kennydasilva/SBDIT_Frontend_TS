import { useState, useEffect } from "react";
import { Search, Plus, Pencil, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { ptService} from "../../api/ptService";
import type { 
  CreatePTData,
  UpdatePTData,
  PT
} from "../../api/ptService";
import { set } from "zod";
import { useAuth } from "../../hooks/useAuth";




export default function PTs() {

  const { user, loading: authLoading } = useAuth();
  const [pts, setPts] = useState<PT[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPt, setSelectedPt] = useState<PT | null>(null);
  const [loading, setLoading]= useState(true);
  const [submitting, setSubmitting]= useState(false);
  const [error, setError]= useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    numero_agente: "",
    localizacao: "Maputo"
  });
  

  useEffect(() => {
    if (!authLoading && user) {
      carregarPts();
    }
  }, [authLoading, user]);


  const carregarPts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const data = await ptService.listarPT(user.id);
      setPts(data);

    } catch (error: any) {
      console.error("Erro ao carregar Policias:", error);
      setError(error.response?.data?.message || "Erro ao carregar Policias");
    } finally {
      setLoading(false);
    }
  };

  const filteredPoliciais = pts.filter(pts =>
    pts.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pts.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async() => {
    if (!user) {
        alert("Usuário não autenticado.");
        return;
    }

    try{

      
        setSubmitting(true);

        const createData: CreatePTData = {
          nome: formData.nome,
          email: formData.email,
          password: formData.senha,
          numero_agente: formData.numero_agente,
          localizacao: formData.localizacao,
          admin_id: user.id
      
        };


        await ptService.criarPT(createData);
        await carregarPts();
        setShowCreateModal(false);
        resetForm();
    
  
  }catch(error){
      console.error("Erro ao criar Policia: ", error);
      
      let errorMessage = "Erro ao criar policia";
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

  const handleEdit = (pt: PT) => {
    setSelectedPt(pt);
    setFormData({
      nome: pt.nome,
      email: pt.email,
      senha: "",
      numero_agente: pt.numero_agente,
      localizacao:pt.localizacao,
    });
    setShowCreateModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedPt) return;

    try{
      setSubmitting(true);

      const updateData: UpdatePTData={
        pt_id: selectedPt.id,
        nome: formData.nome,
        numero_agente: formData.numero_agente,
        localizacao: formData.localizacao,
      }

      ptService.atualizarPT(updateData);
      await carregarPts();
      setShowCreateModal(false);
      setSelectedPt(null);
      resetForm();

    }
    catch(error: any){
      console.error("Erro ao atualizar Policia: ", error);
      alert(error.response?.data?.message || "Erro ao atualizar Policia");

    }
    finally{
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPt) return;

    try{
      setSubmitting(true);
      await ptService.apagarPT(selectedPt.id);
      await carregarPts();
      setShowDeleteModal(false);
      setSelectedPt(null);
    }catch(error: any){
      console.error("Erro ao excluir Policia: ", error);
      alert(error.response?.data?.message || "Erro ao excluir Policia");
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
      numero_agente:"",
      localizacao:"Maputo"
    });
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
            onClick={carregarPts}
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
        <h1 className="text-3xl font-bold text-gray-900">Gestão de Policias</h1>
        <button
          onClick={() => {
            setSelectedPt(null);
            resetForm();
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg hover:bg-[#1E40AF] transition-colors"
        >
          <Plus size={20} />
          Novo Policia
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numero do Agente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localizacao</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPoliciais.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Nenhum policia encontrado
                </td>
              </tr>
            ) : (
              filteredPoliciais.map((pts) => (
                <tr key={pts.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pts.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pts.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{pts.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{pts.numero_agente}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{pts.localizacao}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(pts)}
                      className="text-[#2563EB] hover:text-[#1E40AF] mr-3"
                      disabled={submitting}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPt(pts);
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
              {selectedPt ? "Editar Administrador" : "Criar Novo Administrador"}
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={submitting || !!selectedPt}
                />
                {selectedPt && (
                  <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
                )}
              </div>

              {!selectedPt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                  <input
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numero do agente</label>
                <input
                  type="text"
                  value={formData.numero_agente}
                  onChange={(e) => setFormData({ ...formData, numero_agente: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                <select
                  value={formData.localizacao}
                  onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={submitting}
                >
                  <option value="Comando Geral">Comando Geral</option>
                  <option value="Regional">Regional</option>
                  <option value="Municipal">Municipal</option>
                </select>
              </div>

             
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedPt(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                onClick={selectedPt ? handleUpdate : handleCreate}
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
      {showDeleteModal && selectedPt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <AlertTriangle className="text-red-600" size={24} />
            </div>

            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Confirmar Exclusão</h2>
            <p className="text-gray-600 text-center mb-6">
              Tem certeza que deseja excluir o policia <strong>{selectedPt.nome}</strong>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPt(null);
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
