import { useState } from "react";
import { Loader2 } from "lucide-react";
import { changePassword } from "../api/authService";
import { REGEX } from "../utils/validationSchemas";
import { mostrarSucesso, mensagemDeErro } from "../utils/mensagens";
import {
  INPUT, LABEL, FIELD_ERROR, FIELD_HINT, BUTTON_PRIMARY, BUTTON_SECONDARY,
  ALERT_ERROR, MODAL_OVERLAY, MODAL_CARD,
} from "../utils/uiClasses";

const VAZIO = { atual: "", nova: "", confirmar: "" };

type Erros = Partial<Record<keyof typeof VAZIO, string>>;

// Partilhado pelos perfis (cidadão e agente): o utilizador autenticado
// altera a própria senha, confirmando a actual.
export default function AlterarSenhaModal({ onFechar }: { onFechar: () => void }) {
  const [form, setForm] = useState(VAZIO);
  const [erros, setErros] = useState<Erros>({});
  const [erro, setErro] = useState<string | null>(null);
  const [aEnviar, setAEnviar] = useState(false);

  const validar = () => {
    const e: Erros = {};
    if (!form.atual) e.atual = "Indique a senha actual";
    if (!REGEX.password.test(form.nova)) e.nova = "Mínimo 8 caracteres, com maiúscula, minúscula e número";
    else if (form.nova === form.atual) e.nova = "A nova senha tem de ser diferente da actual";
    if (form.confirmar !== form.nova) e.confirmar = "As senhas não coincidem";
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const guardar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validar()) return;

    try {
      setAEnviar(true);
      setErro(null);
      await changePassword(form.atual, form.nova);
      mostrarSucesso("Senha alterada.");
      onFechar();
    } catch (err) {
      setErro(mensagemDeErro(err, "Erro ao alterar a senha"));
    } finally {
      setAEnviar(false);
    }
  };

  const campo = (nome: keyof typeof VAZIO, label: string, autoComplete: string, dica?: string) => (
    <div>
      <label className={LABEL}>{label}</label>
      <input
        type="password"
        autoComplete={autoComplete}
        value={form[nome]}
        onChange={(e) => setForm({ ...form, [nome]: e.target.value })}
        disabled={aEnviar}
        className={INPUT}
      />
      {dica && !erros[nome] && <p className={FIELD_HINT}>{dica}</p>}
      {erros[nome] && <p className={FIELD_ERROR}>{erros[nome]}</p>}
    </div>
  );

  return (
    <div className={MODAL_OVERLAY}>
      <form onSubmit={guardar} className={MODAL_CARD}>
        <h2 className="text-lg font-semibold text-gray-900 mb-5">Alterar senha</h2>

        {erro && <div className={`${ALERT_ERROR} mb-4`}>{erro}</div>}

        <div className="space-y-4">
          {campo("atual", "Senha actual", "current-password")}
          {campo("nova", "Nova senha", "new-password", "Mínimo 8 caracteres, com maiúscula, minúscula e número.")}
          {campo("confirmar", "Confirmar nova senha", "new-password")}
        </div>

        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onFechar} className={`${BUTTON_SECONDARY} flex-1`} disabled={aEnviar}>
            Cancelar
          </button>
          <button type="submit" className={`${BUTTON_PRIMARY} flex-1`} disabled={aEnviar}>
            {aEnviar ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
