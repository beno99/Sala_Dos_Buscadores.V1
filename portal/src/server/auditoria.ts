import "server-only";
import type { RegistroAuditoria } from "@/data/types";
import { auditoriaBruta } from "./store";

/*
 * Histórico de auditoria (RNF-04). A única escrita possível é `registrar`,
 * que acrescenta um registro congelado. Não existe função para editar ou
 * apagar registros, e a leitura devolve cópias.
 */

export type NovoRegistro = Omit<RegistroAuditoria, "id" | "quando">;

export function registrar(novo: NovoRegistro, quando = new Date()): RegistroAuditoria {
  const lista = auditoriaBruta();
  const registro: RegistroAuditoria = Object.freeze({
    ...novo,
    mudancas: novo.mudancas?.map((m) => Object.freeze({ ...m })),
    id: `a-${lista.length + 1}-${quando.getTime().toString(36)}`,
    quando: quando.toISOString(),
  });
  lista.push(registro);
  return { ...registro };
}

/** Registros do mais recente para o mais antigo. */
export function listarAuditoria(filtro?: { itemId?: string }): RegistroAuditoria[] {
  return auditoriaBruta()
    .filter((r) => !filtro?.itemId || r.itemId === filtro.itemId)
    .map((r) => ({ ...r, mudancas: r.mudancas?.map((m) => ({ ...m })) }))
    .reverse();
}
