import { type NextRequest, NextResponse } from "next/server";

/*
 * Cadastro obrigatório: sem cookie de sessão, toda rota vai para /entrar com a
 * volta preservada, menos as de conta. É uma checagem otimista; a que vale
 * acontece no servidor (layout do grupo (app), app/admin/layout.tsx e cada
 * Server Action, em src/server/sessao.ts).
 */
const ROTAS_DE_CONTA = ["/entrar", "/cadastro", "/recuperar-senha"];

export function precisaEntrar(caminho: string): boolean {
  return !ROTAS_DE_CONTA.some((r) => caminho === r || caminho.startsWith(`${r}/`));
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const caminho = `${pathname}${search}`;
  if (precisaEntrar(pathname) && !request.cookies.has("sdb_sessao")) {
    const destino = new URL("/entrar", request.url);
    destino.searchParams.set("voltar", caminho);
    return NextResponse.redirect(destino);
  }
  const cabecalhos = new Headers(request.headers);
  cabecalhos.set("x-sdb-caminho", caminho);
  return NextResponse.next({ request: { headers: cabecalhos } });
}

export const config = {
  // Tudo, menos arquivos do Next, imagens do portal e arquivos com extensão.
  matcher: ["/((?!_next/|imagens/|favicon\\.ico|.*\\.[a-z0-9]+$).*)"],
};
