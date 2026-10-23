import { redirecionarRotaAntiga } from "@/server/admin/rotas";

/** Ninguém cria vídeo sem escolher a Sala: "Novo vídeo" fica dentro de cada Sala ou artigo (308). */
export const GET = (pedido: Request) => redirecionarRotaAntiga(pedido, () => "/admin/salas");
