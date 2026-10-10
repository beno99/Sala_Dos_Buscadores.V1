import {
  filtrarArtigos,
  filtrarFontes,
  filtrarVideos,
  lerFiltrosArtigos,
  lerFiltrosFontes,
  lerFiltrosVideos,
} from "@/features/admin/listas";
import { COLUNAS_ARTIGOS, COLUNAS_FONTES, COLUNAS_VIDEOS, gerarCsv } from "@/features/admin/regras/csv";
import { listarArtigos, listarFontes, listarVideos, usosDaFonte } from "@/server/admin/consultas";
import { AcessoNegado, exigirAdmin } from "@/server/sessao";

/**
 * Exportação CSV (RF-38), respeitando os filtros da lista (e a seleção, em
 * artigos). Só metadados do acervo: nenhum dado pessoal de membros
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
  let csv: string;
  if (tipo === "artigos") {
    const ids = params.get("ids")?.split(",").filter(Boolean);
    const itens = filtrarArtigos(listarArtigos(), lerFiltrosArtigos(params)).filter(
      (a) => !ids?.length || ids.includes(a.id),
    );
    csv = gerarCsv(COLUNAS_ARTIGOS, itens);
  } else if (tipo === "videos") {
    csv = gerarCsv(COLUNAS_VIDEOS, filtrarVideos(listarVideos(), lerFiltrosVideos(params)));
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
