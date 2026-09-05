import { useState } from "react";
import { Upload, X, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { denunciaService } from "../../api/denunciaService";
import { useAuth } from "../../hooks/useAuth";
import { REGEX } from "../../utils/validationSchemas";
import LocationPicker from "../../components/LocationPicker";


export default function CriarDenuncia() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    matricula: "",
    tipoInfracao: "",
    sentidoPermitido: "",
    localizacao: "",
    descricao: "",
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();
  const [fieldErrors, setFieldErrors] = useState<{
    matricula?: string;
    localizacao?: string;
    descricao?: string;
  }>({});
  const [coordenadas, setCoordenadas] = useState<{ lat: number; lng: number } | null>(null);

  const mapTipoInfracao = (tipo: string) => {
  switch (tipo) {
    case "Contramão":
      return "CONTRAMAO";
    case "Veículo Parado":
      return "PARADO";
    case "Excesso de Velocidade":
      return "VELOCIDADE";
    default:
      return "";
  }
};

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const VIDEO_MAX_SIZE_MB = 100;

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > VIDEO_MAX_SIZE_MB * 1024 * 1024) {
      alert(`Vídeo demasiado grande (máximo ${VIDEO_MAX_SIZE_MB}MB). Reduza a duração ou a qualidade do vídeo.`);
      e.target.value = "";
      return;
    }

    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview(null);
  };

  const validate = () => {
    const errors: { matricula?: string; localizacao?: string; descricao?: string } = {};

    if (!REGEX.matricula.test(formData.matricula)) {
      errors.matricula = "Digite uma matrícula válida no formato AB-12-CD";
    }

    if (!REGEX.localizacao.test(formData.localizacao)) {
      errors.localizacao = "A localização deve ter entre 3 e 200 caracteres";
    }

    if (formData.descricao && !REGEX.descricao.test(formData.descricao)) {
      errors.descricao = "A descrição deve ter entre 5 e 1000 caracteres";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    if (!videoFile){
      alert("Por favor, faça upload de um vídeo da infração.");
      return;
    }

    if (!user) {
      alert("Usuário não autenticado");
      return;
    }

    try{
      setIsLoading(true);

      await denunciaService.criar({
        cidadao_id: user.id,
        matricula: formData.matricula,
        descricao: formData.descricao,
        tipo_infracao: mapTipoInfracao(formData.tipoInfracao),
        localizacao: formData.localizacao,
        sentido_direccao:
          formData.tipoInfracao === "Contramão" 
          ? formData.sentidoPermitido 
          : "",
        caminho_ficheiro: videoFile,
        latitude: coordenadas?.lat ?? null,
        longitude: coordenadas?.lng ?? null,
      });

      setShowSuccess(true);
      setTimeout(() => {
        navigate("/cidadao/minhas-denuncias");
      }, 2000);

    }
    catch(error){
      console.error(error);
      alert("Erro ao enviar denúncia");

    }
    finally{
      setIsLoading(false);
    }
    
  };

  const handleCancel = () => {
    navigate("/cidadao");
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Criar Denúncia</h1>
        <p className="text-gray-600 mt-2">
          Preencha os dados da infração de trânsito
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="text-green-600" size={24} />
          <div>
            <p className="text-green-800 font-medium">
              Denúncia enviada com sucesso!
            </p>
            <p className="text-green-700 text-sm">
              Você será redirecionado para suas denúncias...
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit}>
          {/* Matrícula */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Matrícula do Veículo *
            </label>
            <input
              type="text"
              name="matricula"
              value={formData.matricula}
              onChange={handleInputChange}
              placeholder="Ex: AB-12-CD"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {fieldErrors.matricula && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.matricula}</p>
            )}
          </div>

          {/* Tipo de Infração */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Infração *
            </label>
            <select
              name="tipoInfracao"
              value={formData.tipoInfracao}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Selecione o tipo</option>
              <option value="Contramão">Contramão</option>
              <option value="Veículo Parado">Veículo Parado</option>
              <option value="Excesso de Velocidade">
                Excesso de Velocidade
              </option>
            </select>
          </div>

          {/* Sentido Permitido - Apenas se Contramão */}
          {formData.tipoInfracao === "Contramão" && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Sentido Permitido da Via *
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sentidoPermitido"
                    value="Esquerda"
                    checked={formData.sentidoPermitido === "Esquerda"}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600"
                    required
                  />
                  <span className="text-gray-700">Esquerda</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sentidoPermitido"
                    value="Direita"
                    checked={formData.sentidoPermitido === "Direita"}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600"
                    required
                  />
                  <span className="text-gray-700">Direita</span>
                </label>
              </div>
            </div>
          )}

          {/* Localização */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Localização *
            </label>
            <input
              type="text"
              name="localizacao"
              value={formData.localizacao}
              onChange={handleInputChange}
              placeholder="Ex: Rua Principal, próximo ao mercado"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {fieldErrors.localizacao && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.localizacao}</p>
            )}
          </div>

          {/* Local no mapa (opcional, mas recomendado) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marcar local no mapa
            </label>
            <LocationPicker
              onChange={(lat, lng) => setCoordenadas({ lat, lng })}
            />
          </div>

          {/* Descrição */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              placeholder="Descreva a situação..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            {fieldErrors.descricao && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.descricao}</p>
            )}
          </div>

          {/* Upload de Vídeo */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vídeo da Infração *
            </label>

            {!videoFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  id="video-upload"
                  accept=".mp4,.avi,.mov"
                  onChange={handleVideoUpload}
                  className="hidden"
                  required
                />
                <label
                  htmlFor="video-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600 font-medium mb-2">
                    Clique para fazer upload ou arraste o arquivo
                  </p>
                  <p className="text-gray-500 text-sm">
                    Formatos aceitos: MP4, AVI, MOV
                  </p>
                </label>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                      <Upload className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {videoFile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                {videoPreview && (
                  <video
                    src={videoPreview}
                    controls
                    className="w-full rounded-lg"
                  />
                )}
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Denúncia"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
