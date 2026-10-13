import { useEffect, useState } from "react";
import AlterarSenhaModal from "../../components/AlterarSenhaModal";
import { ptService, type PTUserResponse } from "../../api/ptService";
import { denunciaService } from "../../api/denunciaService";
import { useAuth } from "../../hooks/useAuth";
import PageHeader from "../../components/app/PageHeader";
import { Dados, SeccaoFormulario } from "../../components/app/Campo";
import { PaginaEsqueleto } from "../../components/app/Carregando";
import { ErroPagina } from "../../components/app/Lista";
import { formatarData } from "../../utils/datas";
import { PAGE, CARD, BUTTON_SECONDARY } from "../../utils/uiClasses";

// Perfil do agente: só de leitura. Os dados do agente são geridos pelo
// Admin do posto; aqui o agente só altera a própria senha.
export default function PerfilPt() {
  const [aAlterarSenha, setAAlterarSenha] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const [pt, setPt] = useState<PTUserResponse | null>(null);
  const [decisoes, setDecisoes] = useState<{ total: number; aprovadas: number; arquivadas: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      carregarPT();
    }
  }, [authLoading, user]);

  const carregarPT = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const data = await ptService.getPtyId(user.id);
      setPt(data);

      // Números reais do agente, a partir das denúncias que decidiu.
      denunciaService
        .listarPorPt(user.id, 1, 100)
        .then((r) =>
          setDecisoes({
            total: r.count,
            aprovadas: r.results.filter((d) => d.estado === "APROVADA").length,
            arquivadas: r.results.filter((d) => d.estado === "ARQUIVADA").length,
          })
        )
        .catch(() => {});
    } catch (err) {
      setError("Erro ao carregar o perfil.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PaginaEsqueleto />;

  if (error) return <ErroPagina mensagem={error} onTentar={carregarPT} />;

  return (
    <div className={PAGE}>
      <PageHeader titulo="Perfil" texto="Os seus dados de agente e a senha de acesso." />

      <div className={`${CARD} max-w-4xl p-6`}>
        <SeccaoFormulario
          titulo="Identificação"
          texto="Estes dados são geridos pelo administrador do seu posto. Se algum estiver errado, peça-lhe para o corrigir."
        >
          <Dados
            itens={[
              { rotulo: "Nome", valor: pt?.nome },
              { rotulo: "N.º de agente", valor: pt?.numero_agente },
              { rotulo: "Email", valor: pt?.email },
              { rotulo: "Telemóvel", valor: pt?.numero },
              { rotulo: "Registado em", valor: formatarData(pt?.data_registo) },
            ]}
          />
        </SeccaoFormulario>

        {decisoes && (
          <SeccaoFormulario titulo="Actividade" texto="As denúncias que já decidiu.">
            <Dados
              itens={[
                { rotulo: "Denúncias decididas", valor: String(decisoes.total) },
                { rotulo: "Aprovadas", valor: String(decisoes.aprovadas) },
                { rotulo: "Arquivadas", valor: String(decisoes.arquivadas) },
              ]}
            />
          </SeccaoFormulario>
        )}

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
