import { useEffect, useState } from "react";
import AlterarSenhaModal from "../../components/AlterarSenhaModal";
import TelefoneInput from "../../components/TelefoneInput";
import { Loader2 } from "../../components/icons";
import { useAuth } from "../../hooks/useAuth";
import { cidadaoService, type cidadaoResponse } from "../../api/cidadaoService";
import { REGEX } from "../../utils/validationSchemas";
import PageHeader from "../../components/app/PageHeader";
import Campo, { Dados, SeccaoFormulario } from "../../components/app/Campo";
import { PaginaEsqueleto } from "../../components/app/Carregando";
import { ErroPagina } from "../../components/app/Lista";
import { formatarData } from "../../utils/datas";
import { mostrarErro, mostrarSucesso } from "../../utils/mensagens";
import { PAGE, CARD, INPUT, BUTTON_PRIMARY, BUTTON_SECONDARY } from "../../utils/uiClasses";

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

      <div className={`${CARD} max-w-4xl p-6`}>
        <SeccaoFormulario
          titulo="Dados pessoais"
          texto="O telemóvel é usado para o posto policial o contactar sobre uma denúncia, se for preciso."
        >
          <form onSubmit={handleSave} className="space-y-5" noValidate>
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

            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={!alterado || aGuardar} className={BUTTON_PRIMARY}>
                {aGuardar && <Loader2 size={14} className="animate-spin" />}
                Guardar alterações
              </button>
              {alterado && (
                <button type="button" onClick={repor} disabled={aGuardar} className={BUTTON_SECONDARY}>
                  Desfazer
                </button>
              )}
            </div>
          </form>
        </SeccaoFormulario>

        <SeccaoFormulario titulo="Conta" texto="O email identifica a sua conta e não pode ser alterado.">
          <Dados
            itens={[
              { rotulo: "Email", valor: cidadao?.email },
              { rotulo: "Registado em", valor: formatarData(cidadao?.data_registo) },
              { rotulo: "Denúncias enviadas", valor: String(cidadao?.numero_denuncias ?? 0) },
              { rotulo: "Código no ranking", valor: cidadao?.codigo_ranking },
            ]}
          />
        </SeccaoFormulario>

        <SeccaoFormulario titulo="Segurança" texto="Altere a senha com que entra no sistema.">
          <div>
            <button type="button" className={BUTTON_SECONDARY} onClick={() => setAAlterarSenha(true)}>
              Alterar senha
            </button>
          </div>
        </SeccaoFormulario>
      </div>

      {aAlterarSenha && <AlterarSenhaModal onFechar={() => setAAlterarSenha(false)} />}
    </div>
  );
}
