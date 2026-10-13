import { useEffect, useState } from "react";

import { Link } from "react-router";

import { AlertTriangle, Loader2, MapPin, CheckCircle, Paperclip } from "../../components/icons";
import { useAuth } from "../../hooks/useAuth";

import { ptService, type PT } from "../../api/ptService";

import { denunciaService, type DenunciaDetalhada } from "../../api/denunciaService";

import Paginacao from "../../components/Paginacao";
import {
  CARD, INPUT, BUTTON_PRIMARY, BADGE, STATUS_TONES, TABLE_HEAD_CELL, TABLE_ROW_HOVER, PAGE, ALERT_INFO, ALERT_SUCCESS, ALERT_ERROR } from "../../utils/uiClasses";

import PageHeader from "../../components/app/PageHeader";
import { PaginaEsqueleto } from "../../components/app/Carregando";

import { ErroPagina, LinhaVazia } from "../../components/app/Lista";

import { formatarDataHora } from "../../utils/datas";


const TAMANHO_PAGINA = 10;
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
        denunciaService.listarAcidentesAdmin(pagina, TAMANHO_PAGINA),
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

  if (loading) return <PaginaEsqueleto />;

  if (error) return <ErroPagina mensagem={error} onTentar={() => carregar(paginaAtual)} />;

  return (
    <div className={PAGE}>
      <PageHeader titulo="Acidentes de viação" texto="Acidentes reportados na jurisdição do seu posto. Designe o agente que vai ao local." />

      {mensagem && (
        <div
          role="status"
          className={`mb-6 flex items-center gap-3 ${mensagem.tipo === "ok" ? ALERT_SUCCESS : ALERT_ERROR}`}
        >
          {mensagem.tipo === "ok" ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          <span className="text-sm">{mensagem.texto}</span>
        </div>
      )}

      {agentes.length === 0 && (
        <div className={`${ALERT_INFO} mb-6`}>
          O seu posto ainda não tem agentes registados.{" "}
          <Link to="/admin/policiais" className="font-medium underline">Crie um agente</Link> para o poder designar aos acidentes.
        </div>
      )}

      <div className={`${CARD} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className={TABLE_HEAD_CELL}>#</th>
                <th className={TABLE_HEAD_CELL}>Data</th>
                <th className={TABLE_HEAD_CELL}>Local</th>
                <th className={TABLE_HEAD_CELL}>Descrição</th>
                <th className={TABLE_HEAD_CELL}>Agente</th>
                <th className={TABLE_HEAD_CELL}>Designar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {acidentes.length === 0 ? (
                <LinhaVazia colunas={6}>
                  Nenhum acidente reportado na jurisdição do seu posto. Quando houver, recebe um SMS e uma notificação.
                </LinhaVazia>
              ) : (
                acidentes.map((a) => (
                  <tr key={a.id} className={`${TABLE_ROW_HOVER} align-top`}>
                    <td className="px-6 py-3.5 text-sm text-gray-500">{a.id}</td>
                    <td className="px-6 py-3.5 text-sm text-gray-600 whitespace-nowrap">{formatarDataHora(a.data_registo)}</td>
                    <td className="px-6 py-3.5 text-sm text-gray-900">
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
                    <td className="px-6 py-3.5 text-sm text-gray-600 max-w-xs">{a.descricao || "-"}</td>
                    <td className="px-6 py-3.5 text-sm whitespace-nowrap">
                      {a.pt_id ? (
                        <span className="flex flex-col items-start gap-1.5">
                          <span className={`${BADGE} ${STATUS_TONES.blue}`}>{nomeAgente(a.pt_id)}</span>
                          {a.estado === "CONCLUIDA" && <span className={`${BADGE} ${STATUS_TONES.emerald}`}>Concluído</span>}
                        </span>
                      ) : (
                        <span className={`${BADGE} ${STATUS_TONES.amber}`}>
                          Por designar
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-sm">
                      {a.estado === "CONCLUIDA" ? (
                        <span className="text-xs text-gray-600">O agente deu o acidente por concluído.</span>
                      ) : agentes.length === 0 ? (
                        // Sem agentes no posto não há quem designar: em vez de
                        // um combobox vazio e desactivado (parecia avariado),
                        // diz porquê e leva a criar um agente.
                        <div className="min-w-[220px] text-xs text-blue-800">
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
        </div>
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
