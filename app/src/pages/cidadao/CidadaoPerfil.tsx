import { useEffect, useState } from "react";
import { User, Mail, Phone, Save, Loader2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { cidadaoService, type cidadaoResponse } from "../../api/cidadaoService";
import { REGEX } from "../../utils/validationSchemas";
import { CARD, INPUT, LABEL, BUTTON_PRIMARY, BUTTON_SECONDARY } from "../../utils/uiClasses";

export default function CidadaoPerfil() {
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nome: "João da Silva",
    email: "joao@email.com",
    telefone: "+258 84 123 4567",
    endereco: "Luanda, Angola",
    dataNascimento: "1990-05-15",
  });


  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const[error, setError]= useState<string | null>(null);
  const[cidadao, setCidadao]= useState<cidadaoResponse | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ nome?: string; telefone?: string }>({});
  const getInitials = (name?: string | null) => {
    if (!name) return "JD";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "JD";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    const first = parts[0][0] ?? "";
    const last = parts[parts.length - 1][0] ?? "";
    return (first + last).toUpperCase();
  };
      
  
     
    
    
      useEffect(() => {
        if (!authLoading && user) {
          carregarDenuncias();
        }
      }, [authLoading, user]);
    
    
      const carregarDenuncias = async () => {
        if (!user) return;
        try{
          setLoading(true);
          setError(null);
    
          const data= await cidadaoService.getCidadaoId(user.id);
          setCidadao(data);
         
        } catch (err) {
          setError("Erro ao carregar cidadao.");
        } finally {
          setLoading(false);
        }
      };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCidadao((prev) => {
      if (!prev) return prev;
      const field = name === "telefone" ? "numero" : name;
      return { ...prev, [field]: value } as cidadaoResponse;
    });
  };

  const validate = () => {
    const errors: { nome?: string; telefone?: string } = {};

    if (!cidadao?.nome || !REGEX.nome.test(cidadao.nome)) {
      errors.nome = "O nome deve conter apenas letras e espaços (2-100 caracteres)";
    }

    if (!cidadao?.numero || !REGEX.telefone.test(cidadao.numero)) {
      errors.telefone = "Digite um número válido no formato +258 8XX XXX XXX";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cidadao) return;
    if(!user) return;
    if (!validate()) return;

    try {
      setLoading(true);
      setError(null);
      await cidadaoService.updateCidadao({
        id: cidadao.id,
        nome: cidadao.nome,
        email: cidadao.email,
        data_registo: cidadao.data_registo,
        numero: cidadao.numero,
      },user.id);
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError("Erro ao atualizar cidadão.");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Total de Denúncias", value: String(cidadao?.numero_denuncias ?? 0) },
    { label: "O teu código no ranking", value: cidadao?.codigo_ranking ?? "—" },
  ];

  return (
    <div className="p-8 bg-gray-50/50 min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Meu Perfil</h1>
        <p className="text-gray-500 mt-1">
          Gerencie suas informações pessoais
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 flex items-center gap-3">
          <Save className="text-emerald-600 shrink-0" size={24} />
          <p className="text-emerald-800 font-medium">
            Perfil atualizado com sucesso!
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <div className={`${CARD} p-6`}>
            {/* Avatar */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center mb-4">
                <span className="text-4xl font-bold text-white">{getInitials(cidadao?.nome)}</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {cidadao?.nome}
              </h2>
              <p className="text-gray-500 text-sm">{cidadao?.email}</p>
            </div>

            {/* Stats */}
            <div className="space-y-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0"
                >
                  <span className="text-sm text-gray-600">{stat.label}</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Profile Form */}
        <div className="lg:col-span-2">
          <div className={`${CARD} p-6`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Informações Pessoais
              </h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className={BUTTON_PRIMARY}
                >
                  Editar Perfil
                </button>
              )}
            </div>

            <form onSubmit={handleSave}>
              <div className="space-y-6">
                {/* Nome */}
                <div>
                  <label className={LABEL}>
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      Nome Completo
                    </div>
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={cidadao?.nome}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`${INPUT} disabled:bg-gray-50 disabled:text-gray-500`}
                  />
                  {fieldErrors.nome && (
                    <p className="mt-1 text-sm text-rose-600">{fieldErrors.nome}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className={LABEL}>
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      Email
                    </div>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={cidadao?.email}
                    onChange={handleInputChange}
                    disabled
                    className={`${INPUT} disabled:bg-gray-50 disabled:text-gray-500`}
                  />
                  <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
                </div>

                {/* Telefone */}
                <div>
                  <label className={LABEL}>
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      Telefone
                    </div>
                  </label>
                  <input
                    type="tel"
                    name="telefone"
                    value={cidadao?.numero}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`${INPUT} disabled:bg-gray-50 disabled:text-gray-500`}
                  />
                  {fieldErrors.telefone && (
                    <p className="mt-1 text-sm text-rose-600">{fieldErrors.telefone}</p>
                  )}
                </div>
              </div>

              {/* Botões */}
              {isEditing && (
                <div className="flex gap-4 justify-end mt-6 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className={BUTTON_SECONDARY}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={BUTTON_PRIMARY}
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Salvar Alterações
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Alterar Senha */}
          <div className={`${CARD} p-6 mt-8`}>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Segurança
            </h2>
            <button className={BUTTON_SECONDARY}>
              Alterar Senha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
