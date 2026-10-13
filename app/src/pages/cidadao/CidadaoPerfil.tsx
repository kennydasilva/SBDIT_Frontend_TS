import { useEffect, useState } from "react";
import AlterarSenhaModal from "../../components/AlterarSenhaModal";
import TelefoneInput from "../../components/TelefoneInput";
import { Calendar, FileText, KeyRound, Loader2, Save, Trophy, User } from "../../components/icons";
import { useAuth } from "../../hooks/useAuth";
import { cidadaoService, type cidadaoResponse } from "../../api/cidadaoService";
import { REGEX } from "../../utils/validationSchemas";
import PageHeader from "../../components/app/PageHeader";
import Campo from "../../components/app/Campo";
import { BlocoPerfil, CartaoIdentidade } from "../../components/app/Perfil";
import { PaginaEsqueleto } from "../../components/app/Carregando";
import { ErroPagina } from "../../components/app/Lista";
import { formatarData } from "../../utils/datas";
import { mostrarErro, mostrarSucesso } from "../../utils/mensagens";
import { PAGE, INPUT, BUTTON_PRIMARY, BUTTON_SECONDARY, BOTAO_GRANDE } from "../../utils/uiClasses";

export default function CidadaoPerfil() {
  const [aAlterarSenha, setAAlterarSenha] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [aGuardar, setAGuardar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cidadao, setCidadao] = useState<cidadaoResponse | null>(null);
  // O que está guardado no servidor, para saber se há alterações por guardar.
  const [guardado, setGuardado] = useState<{ nome: string; numero: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ nome?: string; telefone?: string }>({});

  useEffect(() => {
    if (!authLoading && user) {
      carregar();
    }
  }, [authLoading, user]);

  const carregar = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      const data = await cidadaoService.getCidadaoId(user.id);
      setCidadao(data);
      setGuardado({ nome: data.nome ?? "", numero: data.numero ?? "" });
    } catch (err) {
      setError("Erro ao carregar o perfil.");
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errors: { nome?: string; telefone?: string } = {};

    if (!cidadao?.nome || !REGEX.nome.test(cidadao.nome)) {
      errors.nome = "O nome deve conter apenas letras e espaços (2-100 caracteres)";
    }

    if (!cidadao?.numero || !REGEX.telefone.test(cidadao.numero)) {
      errors.telefone = "Indique um número válido (9 dígitos, começado por 8)";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cidadao || !user) return;
    if (!validate()) return;

    try {
      setAGuardar(true);
      await cidadaoService.updateCidadao({
        id: cidadao.id,
        nome: cidadao.nome,
        email: cidadao.email,
        data_registo: cidadao.data_registo,
        numero: cidadao.numero,
      }, user.id);
      setGuardado({ nome: cidadao.nome ?? "", numero: cidadao.numero ?? "" });
      mostrarSucesso("Perfil actualizado.");
    } catch (err) {
      mostrarErro(err, "Erro ao actualizar o perfil");
    } finally {
      setAGuardar(false);
    }
  };

  const repor = () => {
    if (!guardado) return;
    setCidadao((prev) => (prev ? { ...prev, ...guardado } : prev));
    setFieldErrors({});
  };

  if (loading) return <PaginaEsqueleto />;

  if (error) return <ErroPagina mensagem={error} onTentar={carregar} />;

  const alterado = !!guardado && (guardado.nome !== (cidadao?.nome ?? "") || guardado.numero !== (cidadao?.numero ?? ""));

  return (
    <div className={PAGE}>
      <PageHeader titulo="Perfil" texto="Os seus dados de cidadão e a senha de acesso." />

      <div className="grid items-start gap-5 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <CartaoIdentidade
          nome={guardado?.nome}
          papel="Cidadão"
          email={cidadao?.email}
          itens={[
            { icon: FileText, rotulo: "Denúncias enviadas", valor: String(cidadao?.numero_denuncias ?? 0) },
            { icon: Trophy, rotulo: "Código no ranking", valor: cidadao?.codigo_ranking },
            { icon: Calendar, rotulo: "Registado em", valor: formatarData(cidadao?.data_registo) },
          ]}
        />

        <div className="space-y-5">
          <BlocoPerfil
            icon={User}
            titulo="Dados pessoais"
            texto="O telemóvel é usado para o posto policial o contactar sobre uma denúncia, se for preciso."
          >
            <form onSubmit={handleSave} noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <Campo rotulo="Nome completo" erro={fieldErrors.nome}>
                  <input
                    type="text"
                    name="nome"
                    autoComplete="name"
                    value={cidadao?.nome ?? ""}
                    onChange={(e) => setCidadao((prev) => (prev ? { ...prev, nome: e.target.value } : prev))}
                    disabled={aGuardar}
                    className={INPUT}
                  />
                </Campo>

                <Campo rotulo="Telemóvel" erro={fieldErrors.telefone}>
                  <TelefoneInput
                    name="telefone"
                    value={cidadao?.numero}
                    onChange={(numero) => setCidadao((prev) => (prev ? { ...prev, numero } : prev))}
                    disabled={aGuardar}
                  />
                </Campo>

                <Campo rotulo="Email" ajuda="Identifica a sua conta e não pode ser alterado." className="sm:col-span-2">
                  <input type="email" value={cidadao?.email ?? ""} readOnly disabled className={INPUT} />
                </Campo>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 border-t border-blue-100 pt-6">
                <button type="submit" disabled={!alterado || aGuardar} className={`${BUTTON_PRIMARY} ${BOTAO_GRANDE}`}>
                  {aGuardar ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Guardar alterações
                </button>
                {alterado && (
                  <button type="button" onClick={repor} disabled={aGuardar} className={`${BUTTON_SECONDARY} ${BOTAO_GRANDE}`}>
                    Desfazer
                  </button>
                )}
              </div>
            </form>
          </BlocoPerfil>

          <BlocoPerfil icon={KeyRound} titulo="Segurança" texto="Altere a senha com que entra no sistema.">
            <button type="button" className={`${BUTTON_SECONDARY} ${BOTAO_GRANDE}`} onClick={() => setAAlterarSenha(true)}>
              Alterar senha
            </button>
          </BlocoPerfil>
        </div>
      </div>

      {aAlterarSenha && <AlterarSenhaModal onFechar={() => setAAlterarSenha(false)} />}
    </div>
  );
}
