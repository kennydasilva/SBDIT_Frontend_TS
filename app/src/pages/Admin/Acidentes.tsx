import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Siren, AlertTriangle, Loader2, MapPin, CheckCircle, Paperclip } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { ptService, type PT } from "../../api/ptService";
import { denunciaService, type DenunciaDetalhada } from "../../api/denunciaService";
import Paginacao from "../../components/Paginacao";
import {
  CARD, INPUT, BUTTON_PRIMARY, BADGE, STATUS_TONES, TABLE_HEAD_CELL, TABLE_ROW_HOVER,
} from "../../utils/uiClasses";

const TAMANHO_PAGINA = 20;
const BASE_URL = "http://127.0.0.1:8000";

// Acidentes reportados na jurisdição do posto deste Admin. O Admin é o
// único avisado (por SMS) e é quem decide qual agente do seu posto vai ao
// local - por isso a designação só lista os agentes do próprio posto.
export default function Acidentes() {
  const { user, loading: authLoading } = useAuth();
  const [acidentes, setAcidentes] = useState<DenunciaDetalhada[]>([]);
  const [agentes, setAgentes] = useState<PT[]>([]);
  const [escolhas, setEscolhas] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aDesignar, setADesignar] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalItens, setTotalItens] = useState(0);

  useEffect(() => {
    if (!authLoading && user) {
      carregar(paginaAtual);
    }
  }, [authLoading, user, paginaAtual]);

  const carregar = async (pagina: number) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const [dadosAcidentes, dadosAgentes] = await Promise.all([
        denunciaService.listarAcidentesAdmin(pagina),
        ptService.listarPT(user.id, 1, 100),
      ]);

      setAcidentes(dadosAcidentes.results);
      setTotalItens(dadosAcidentes.count);
      setAgentes(dadosAgentes.results);
    } catch (err: any) {
      console.error("Erro ao carregar acidentes:", err);
      setError(err.response?.data?.error || "Erro ao carregar acidentes");
    } finally {
      setLoading(false);
    }
  };

  const nomeAgente = (ptId?: number | null) => {
    if (!ptId) return null;
    const pt = agentes.find((a) => a.id === ptId);
    return pt ? `${pt.nome} (${pt.numero_agente})` : `Agente #${ptId}`;
  };

  const handleDesignar = async (acidente: DenunciaDetalhada) => {
    const ptId = Number(escolhas[acidente.id]);
    if (!ptId) return;

    try {
      setADesignar(acidente.id);
      setMensagem(null);

      await denunciaService.designarPtAcidente(acidente.id, ptId);

      setAcidentes((lista) =>
        lista.map((a) => (a.id === acidente.id ? { ...a, pt_id: ptId } : a))
      );
      setEscolhas((e) => ({ ...e, [acidente.id]: "" }));
      setMensagem({ tipo: "ok", texto: `${nomeAgente(ptId)} designado para o acidente #${acidente.id}.` });
    } catch (err: any) {
      console.error("Erro ao designar agente:", err);
      setMensagem({ tipo: "erro", texto: err.response?.data?.error || "Erro ao designar agente" });
    } finally {
      setADesignar(null);
    }
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
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <p className="text-rose-600">{error}</p>
          <button onClick={() => carregar(paginaAtual)} className={`${BUTTON_PRIMARY} mt-4`}>
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50/50 min-h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Acidentes de Viação</h1>
        <p className="text-gray-500 mt-1">
          Acidentes reportados na jurisdição do seu posto. Designe o agente que vai ao local.
        </p>
      </div>

      {mensagem && (
        <div
          className={`mb-6 rounded-2xl border p-4 flex items-center gap-3 ${
            mensagem.tipo === "ok"
              ? "border-emerald-100 bg-emerald-50 text-emerald-800"
              : "border-rose-100 bg-rose-50 text-rose-800"
          }`}
        >
          {mensagem.tipo === "ok" ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span className="text-sm">{mensagem.texto}</span>
        </div>
      )}

      {agentes.length === 0 && (
        <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
          O seu posto ainda não tem agentes registados.{" "}
          <Link to="/admin/policiais" className="font-medium underline">Crie um agente</Link> para o poder designar aos acidentes.
        </div>
      )}

      <div className={`${CARD} overflow-hidden`}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className={TABLE_HEAD_CELL}>#</th>
              <th className={TABLE_HEAD_CELL}>Data</th>
              <th className={TABLE_HEAD_CELL}>Local</th>
              <th className={TABLE_HEAD_CELL}>Descrição</th>
              <th className={TABLE_HEAD_CELL}>Agente</th>
              <th className={TABLE_HEAD_CELL}>Designar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {acidentes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  <Siren className="mx-auto mb-2 text-gray-300" size={32} />
                  Nenhum acidente reportado na sua jurisdição
                </td>
              </tr>
            ) : (
              acidentes.map((a) => (
                <tr key={a.id} className={`${TABLE_ROW_HOVER} align-top`}>
                  <td className="px-6 py-4 text-sm text-gray-500">{a.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{a.data_registo || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <p>{a.localizacao}</p>
                    {!!a.total_relacionadas && (
                      <span className={`${BADGE} ${STATUS_TONES.rose} mt-1`}>
                        {a.total_relacionadas + 1} reportes deste acidente
                      </span>
                    )}
                    <div className="flex gap-3 mt-1">
                      {a.latitude != null && a.longitude != null && (
                        <a
                          href={`https://www.google.com/maps?q=${a.latitude},${a.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          <MapPin size={12} /> Ver no mapa
                        </a>
                      )}
                      {a.ficheiro_original && (
                        <a
                          href={`${BASE_URL}${a.ficheiro_original}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          <Paperclip size={12} /> Foto/vídeo
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">{a.descricao || "-"}</td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    {a.pt_id ? (
                      <span className={`${BADGE} ${STATUS_TONES.emerald}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                        {nomeAgente(a.pt_id)}
                      </span>
                    ) : (
                      <span className={`${BADGE} ${STATUS_TONES.amber}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                        Por designar
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {agentes.length === 0 ? (
                      // Sem agentes no posto não há quem designar: em vez de
                      // um combobox vazio e desactivado (parecia avariado),
                      // diz porquê e leva a criar um agente.
                      <div className="min-w-[220px] text-xs text-amber-700">
                        Sem agentes no posto.{" "}
                        <Link to="/admin/policiais" className="font-medium text-blue-600 hover:underline">
                          Criar agente
                        </Link>
                      </div>
                    ) : (
                    <div className="flex gap-2 min-w-[260px]">
                      <select
                        value={escolhas[a.id] ?? ""}
                        onChange={(e) => setEscolhas((s) => ({ ...s, [a.id]: e.target.value }))}
                        className={INPUT}
                        disabled={aDesignar === a.id}
                      >
                        <option value="">{a.pt_id ? "Trocar agente..." : "Escolher agente..."}</option>
                        {agentes.map((pt) => (
                          <option key={pt.id} value={pt.id}>
                            {pt.nome} ({pt.numero_agente})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleDesignar(a)}
                        className={BUTTON_PRIMARY}
                        disabled={!escolhas[a.id] || aDesignar === a.id}
                      >
                        {aDesignar === a.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Designar"}
                      </button>
                    </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Paginacao
          paginaAtual={paginaAtual}
          totalItens={totalItens}
          tamanhoPagina={TAMANHO_PAGINA}
          onMudarPagina={setPaginaAtual}
          disabled={loading}
        />
      </div>
    </div>
  );
}
