"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EstadoSalvamento } from "@/components/ds/Curadoria";
import type { StatusEditorial } from "@/data/types";
import type { ModoSalvar, ResultadoAcao } from "@/server/admin/editorial";

export const horaCurta = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

interface Opcoes<F extends { id: string | null }> {
  inicial: F;
  status: StatusEditorial;
  atualizadoEm: string | null;
  /** Caminho base do item, para trocar /novo pelo id sem recarregar a tela. */
  base: string;
  /** Salva sozinho? Padrão: só em rascunho. O anfitrião também salva sozinho o reprovado e o arquivado. */
  automatico?: boolean;
  /** Endereço do item depois de salvo; padrão: `${base}/${id}`. Trocado sem recarregar quando muda. */
  caminho?: (salvo: { id: string; slug?: string }) => string;
  salvar: (f: F, modo: ModoSalvar) => Promise<ResultadoAcao<{ id: string; salvoEm: string; slug?: string }>>;
  /** O mínimo para existir como rascunho (Sala e título). */
  podeSalvar: (f: F) => boolean;
}

/**
 * Estado de edição com salvamento automático só para rascunhos: em item
 * publicado, salvar sozinho mudaria o portal enquanto a pessoa digita, então
 * a edição espera "Salvar alterações".
 */
export function useEdicao<F extends { id: string | null }>({
  inicial,
  status,
  atualizadoEm,
  base,
  salvar,
  podeSalvar,
  automatico: salvaSozinho,
  caminho,
}: Opcoes<F>) {
  const [form, setForm] = useState(inicial);
  const [sujo, setSujo] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [estado, setEstado] = useState<EstadoSalvamento>(atualizadoEm ? "salvo" : "pendente");
  const [hora, setHora] = useState(atualizadoEm ? horaCurta(atualizadoEm) : undefined);
  const idRef = useRef(inicial.id);
  const formRef = useRef(form);
  const emVoo = useRef(false);
  formRef.current = form;

  const automatico = salvaSozinho ?? status === "rascunho";

  /** Altera campos do formulário; `campos` são os ids de erro que a alteração resolve. */
  const mudar = useCallback((parcial: Partial<F>, ...campos: string[]) => {
    setForm((f) => ({ ...f, ...parcial }));
    setSujo(true);
    setEstado("pendente");
    if (campos.length) {
      setErros((e) => {
        if (!campos.some((c) => c in e)) return e;
        const limpo = { ...e };
        for (const c of campos) delete limpo[c];
        return limpo;
      });
    }
  }, []);

  const salvarAgora = useCallback(
    async (modo: ModoSalvar) => {
      if (emVoo.current) return null;
      emVoo.current = true;
      const enviado = { ...formRef.current, id: idRef.current };
      setEstado("salvando");
      try {
        const r = await salvar(enviado, modo);
        if (r.ok) {
          const novo = !idRef.current;
          idRef.current = r.valor.id;
          setForm((f) => ({ ...f, id: r.valor.id, ...(r.valor.slug ? { slug: r.valor.slug } : {}) }));
          const destino = caminho ? caminho(r.valor) : `${base}/${r.valor.id}`;
          if ((novo || caminho) && window.location.pathname !== destino) {
            window.history.replaceState(null, "", destino);
          }
          if (JSON.stringify({ ...formRef.current, id: null }) === JSON.stringify({ ...enviado, id: null })) {
            setSujo(false);
          }
          setEstado("salvo");
          setHora(horaCurta(r.valor.salvoEm));
        } else {
          setEstado("erro");
          if (r.erros) setErros((e) => ({ ...e, ...r.erros }));
        }
        return r;
      } catch {
        setEstado("erro");
        return null;
      } finally {
        emVoo.current = false;
      }
    },
    [salvar, base, caminho],
  );

  // Rascunho: salva 1,2 s depois da última alteração, se já tiver o mínimo.
  useEffect(() => {
    if (!automatico || !sujo || !podeSalvar(form)) return;
    const t = setTimeout(() => void salvarAgora("automatico"), 1200);
    return () => clearTimeout(t);
  }, [automatico, sujo, form, podeSalvar, salvarAgora]);

  return { form, mudar, sujo, setSujo, erros, setErros, estado, hora, salvarAgora, automatico, id: idRef };
}
