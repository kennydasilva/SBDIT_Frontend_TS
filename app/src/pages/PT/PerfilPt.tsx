import { useEffect, useState } from "react";
import { User, Mail, Shield, Phone, MapPin, Calendar, Save } from "lucide-react";
import { toast } from "sonner";
import { ptService, type PTUserResponse } from "../../api/ptService";
import { useAuth } from "../../hooks/useAuth";
import { CARD, INPUT, LABEL, BUTTON_PRIMARY, BUTTON_SECONDARY } from "../../utils/uiClasses";

export default function PerfilPt() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: "António Costa",
    email: "antonio.costa@pt.gov.mz",
    telefone: "+258 84 123 4567",
    numeroAgente: "PT-2145",
    divisao: "Maputo Central",
    dataCadastro: "2024-01-15",
  });

   const { user, loading: authLoading } = useAuth();
    const [pt, setPt] = useState<PTUserResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const[error, setError]= useState<string | null>(null);
   
  
    
    
    useEffect(() => {
            if (!authLoading && user) {
              carregarPT();
              
             
            }
    }, [authLoading, user]);
          
        
        
    const carregarPT = async () => {
          if (!user) return;
      
          try{
            setLoading(true);
      
            const data= await ptService.getPtyId(user.id);
            setPt(data);
         
        } catch (error) {
            setError("Erro ao carregar PT.");
        } finally {
            setLoading(false);
        }
    }

  const handleSave = () => {
    
    toast.success("Perfil atualizado com sucesso!");
    setIsEditing(false);
  };

  const stats = [
    { label: "Denúncias Analisadas", value: "127" },
    { label: "Taxa de Aprovação", value: "85%" },
    { label: "Tempo Médio de Análise", value: "8 min" },
  ];

  return (
    <div className="p-8 bg-gray-50/50 min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Perfil</h1>
        <p className="text-gray-500 mt-1">Gerir informações do seu perfil</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="space-y-6">
          {/* Avatar and Basic Info */}
          <div className={`${CARD} p-6`}>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold mb-4">
                PT
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {pt?.nome}
              </h2>
              <p className="text-gray-500 text-sm">{pt?.numero_agente}</p>
              <div className="mt-4 flex items-center gap-2 text-gray-600">
                <Shield size={16} />
                <span className="text-sm">{pt?.localizacao}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className={`${CARD} p-6`}>
            <h3 className="font-semibold text-gray-900 mb-4">Estatísticas</h3>
            <div className="space-y-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="lg:col-span-2">
          <div className={`${CARD} p-6`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Informações Pessoais
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className={BUTTON_PRIMARY}
                >
                  Editar Perfil
                </button>
              ) : null}
            </div>

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
                  value={pt?.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  disabled={!isEditing}
                  className={`${INPUT} disabled:bg-gray-50 disabled:text-gray-500`}
                />
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
                  value={pt?.email}
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
                  value={pt?.numero}
                  onChange={(e) =>
                    setFormData({ ...formData, telefone: e.target.value })
                  }
                  disabled={!isEditing}
                  className={`${INPUT} disabled:bg-gray-50 disabled:text-gray-500`}
                />
              </div>

              {/* Número de Agente */}
              <div>
                <label className={LABEL}>
                  <div className="flex items-center gap-2">
                    <Shield size={16} />
                    Número de Agente
                  </div>
                </label>
                <input
                  type="text"
                  value={pt?.numero_agente}
                  disabled
                  className={`${INPUT} disabled:bg-gray-50 disabled:text-gray-500`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este campo não pode ser alterado
                </p>
              </div>

              {/* Divisão */}
              <div>
                <label className={LABEL}>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    Divisão
                  </div>
                </label>
                <select
                  value={pt?.localizacao}
                  onChange={(e) =>
                    setFormData({ ...formData, divisao: e.target.value })
                  }
                  disabled={!isEditing}
                  className={`${INPUT} disabled:bg-gray-50 disabled:text-gray-500`}
                >
                  <option value="Maputo Central">Maputo Central</option>
                  <option value="Maputo Norte">Maputo Norte</option>
                  <option value="Maputo Sul">Maputo Sul</option>
                  <option value="Matola">Matola</option>
                </select>
              </div>

              {/* Data de Cadastro */}
              <div>
                <label className={LABEL}>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    Data de Cadastro
                  </div>
                </label>
                <input
                  type="text"
                  value={pt?.data_registo}
                  disabled
                  className={`${INPUT} disabled:bg-gray-50 disabled:text-gray-500`}
                />
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    className={`${BUTTON_PRIMARY} flex-1`}
                  >
                    <Save size={18} />
                    Salvar Alterações
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className={BUTTON_SECONDARY}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Security Section */}
          <div className={`${CARD} p-6 mt-6`}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Segurança</h2>
            <button className={BUTTON_SECONDARY}>
              Alterar Senha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
