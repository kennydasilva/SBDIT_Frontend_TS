import { useEffect, useState } from "react";
import AlterarSenhaModal from "../../components/AlterarSenhaModal";
import { ptService, type PTUserResponse } from "../../api/ptService";
import { denunciaService } from "../../api/denunciaService";
import { useAuth } from "../../hooks/useAuth";
import PageHeader from "../../components/app/PageHeader";
import { BlocoPerfil, CartaoIdentidade, GrelhaDados, Numeros } from "../../components/app/Perfil";
import {
  Archive, Calendar, CheckCircle2, ClipboardList, Gavel, KeyRound, Mail, Phone, Shield, User,
} from "../../components/icons";
import { PaginaEsqueleto } from "../../components/app/Carregando";
import { ErroPagina } from "../../components/app/Lista";
import { formatarData } from "../../utils/datas";
import { PAGE, BUTTON_SECONDARY, BOTAO_GRANDE } from "../../utils/uiClasses";

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

      <div className="grid items-start gap-5 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <CartaoIdentidade
          nome={pt?.nome}
          papel="Agente de trânsito"
          email={pt?.email}
          itens={[
            { icon: Shield, rotulo: "N.º de agente", valor: pt?.numero_agente },
            { icon: Calendar, rotulo: "Registado em", valor: formatarData(pt?.data_registo) },
          ]}
        />

        <div className="space-y-5">
          {decisoes && (
            <BlocoPerfil icon={Gavel} titulo="A minha actividade" texto="As denúncias que já decidiu.">
              <Numeros
                itens={[
                  { icon: ClipboardList, rotulo: "Denúncias decididas", valor: decisoes.total },
                  { icon: CheckCircle2, rotulo: "Aprovadas", valor: decisoes.aprovadas },
                  { icon: Archive, rotulo: "Arquivadas", valor: decisoes.arquivadas },
                ]}
              />
            </BlocoPerfil>
          )}

          <BlocoPerfil
            icon={User}
            titulo="Identificação"
            texto="Estes dados são geridos pelo administrador do seu posto. Se algum estiver errado, peça-lhe para o corrigir."
          >
            <GrelhaDados
              itens={[
                { icon: User, rotulo: "Nome completo", valor: pt?.nome },
                { icon: Shield, rotulo: "N.º de agente", valor: pt?.numero_agente },
                { icon: Mail, rotulo: "Email", valor: pt?.email },
                { icon: Phone, rotulo: "Telemóvel", valor: pt?.numero },
              ]}
            />
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
