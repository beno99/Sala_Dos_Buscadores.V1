import {
  filtrarArtigos,
  filtrarFontes,
  filtrarSalas,
  filtrarVideos,
  lerFiltrosArtigos,
  lerFiltrosFontes,
  lerFiltrosSalas,
  lerFiltrosVideos,
} from "@/features/admin/listas";
import { COLUNAS_ARTIGOS, COLUNAS_FONTES, COLUNAS_VIDEOS, gerarCsv } from "@/features/admin/regras/csv";
import { listarFontes, listarTodosOsArtigos, listarVideos, usosDaFonte } from "@/server/admin/consultas";
import { listarSalasAdmin } from "@/server/admin/salas";
import { AcessoNegado, exigirAdmin } from "@/server/sessao";

/**
 * Exportação CSV (RF-38), respeitando os filtros da lista de Salas (origem,
 * status, nome, anfitrião) e os filtros de item (e a seleção, em artigos). Só metadados do acervo: nenhum dado pessoal de membros
 * (RNF-LEG-01/02).
 */
export async function GET(request: Request, ctx: RouteContext<"/admin/exportar/[tipo]">) {
  try {
    await exigirAdmin();
  } catch (e) {
    if (e instanceof AcessoNegado) return new Response("Acesso restrito à curadoria.", { status: 403 });
    throw e;
  }
  const { tipo } = await ctx.params;
  const params = new URL(request.url).searchParams;
  const hoje = new Date().toISOString().slice(0, 10);
  // As Salas que passam pelos filtros da lista de Salas (sem filtro, todas).
  const salas = new Set(filtrarSalas(listarSalasAdmin(), lerFiltrosSalas(params)).map((r) => r.sala.slug));
  let csv: string;
  if (tipo === "artigos") {
    const ids = params.get("ids")?.split(",").filter(Boolean);
    const itens = filtrarArtigos(listarTodosOsArtigos(), lerFiltrosArtigos(params)).filter(
      (a) => salas.has(a.sala) && (!ids?.length || ids.includes(a.id)),
    );
    csv = gerarCsv(COLUNAS_ARTIGOS, itens);
  } else if (tipo === "videos") {
    const itens = filtrarVideos(listarVideos(), lerFiltrosVideos(params)).filter((v) => salas.has(v.sala));
    csv = gerarCsv(COLUNAS_VIDEOS, itens);
  } else if (tipo === "fontes") {
    const itens = filtrarFontes(listarFontes(), lerFiltrosFontes(params)).map((f) => ({
      ...f,
      usos: usosDaFonte(f.id).length,
    }));
    csv = gerarCsv(COLUNAS_FONTES, itens);
  } else {
    return new Response("Tipo de exportação desconhecido. Use artigos, videos ou fontes.", { status: 404 });
  }
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sala-dos-buscadores-${tipo}-${hoje}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
