import { asc, eq, inArray } from "drizzle-orm";
import type { banco } from "@/modules/compartilhado/banco/cliente";
import type { Papel } from "@/modules/conta/conta.contratos";
import { usuarios } from "@/modules/conta/conta.schema";
import { ConflitoEditorial } from "./editorial-atomico";

export type OperacaoContaNoLote =
  | {
      tipo: "papel-conta";
      id: string;
      esperado: "membro" | "anfitriao";
      papel: "membro" | "anfitriao";
      atorId: string;
      destinoId?: string;
    }
  | {
      tipo: "excluir-conta";
      id: string;
      esperado: "anfitriao";
      atorId: string;
      destinoId?: string;
    };
type Tx = Parameters<Parameters<ReturnType<typeof banco>["transaction"]>[0]>[0];
export function validarContaNoLote(
  op: OperacaoContaNoLote,
  contas: Map<string, { id: string; papel: Papel }>,
): void {
  const ator = contas.get(op.atorId);
  const alvo = contas.get(op.id);
  if (ator?.papel !== "administrador") throw new Error("Acesso restrito à curadoria.");
  if (op.id === op.atorId || alvo?.papel === "administrador")
    throw new Error("A conta da curadoria não pode ser alterada por esta operação.");
  if (!alvo || alvo.papel !== op.esperado) throw new ConflitoEditorial();
  if (op.tipo === "papel-conta" && op.papel !== "membro" && op.papel !== "anfitriao")
    throw new Error("O papel de administrador não é atribuído por esta operação.");
  if (op.destinoId && (op.destinoId === op.id || contas.get(op.destinoId)?.papel !== "anfitriao"))
    throw new Error("O anfitrião de destino não está disponível.");
}
export async function bloquearContasDoLote(tx: Tx, ops: OperacaoContaNoLote[]): Promise<void> {
  if (!ops.length) return;
  const ids = [
    ...new Set(ops.flatMap((o) => [o.atorId, o.id, ...(o.destinoId ? [o.destinoId] : [])])),
  ].sort();
  await tx.select().from(usuarios).where(inArray(usuarios.id, ids)).orderBy(asc(usuarios.id)).for("update");
}
export async function aplicarContaNoLote(tx: Tx, op: OperacaoContaNoLote): Promise<void> {
  const ids = [op.atorId, op.id, ...(op.destinoId ? [op.destinoId] : [])];
  const linhas = await tx
    .select({ id: usuarios.id, papel: usuarios.papel })
    .from(usuarios)
    .where(inArray(usuarios.id, ids));
  validarContaNoLote(op, new Map(linhas.map((c) => [c.id, c])));
  if (op.tipo === "papel-conta")
    await tx.update(usuarios).set({ papel: op.papel }).where(eq(usuarios.id, op.id));
  else await tx.delete(usuarios).where(eq(usuarios.id, op.id));
}
