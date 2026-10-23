import { redirecionarRotaAntiga } from "@/server/admin/rotas";

/** Artigos vivem dentro da Sala: a lista antiga leva à lista de Salas (308). */
export const GET = (pedido: Request) => redirecionarRotaAntiga(pedido, () => "/admin/salas");
