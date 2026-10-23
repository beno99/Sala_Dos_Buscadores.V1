import { redirecionarRotaAntiga } from "@/server/admin/rotas";

/** Ninguém cria artigo sem escolher a Sala: "Novo artigo" fica dentro de cada Sala (308). */
export const GET = (pedido: Request) => redirecionarRotaAntiga(pedido, () => "/admin/salas");
