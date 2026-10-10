"use client";

import type { Route } from "next";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ds/Button";
import { Drawer } from "@/components/ds/Drawer";
import { type ItemNavegacao, NavegacaoLateral } from "@/components/ds/NavegacaoLateral";

interface Contagens {
  artigos: number;
  videos: number;
  fontes: number;
}

/*
 * Seções da curadoria. Fora desta etapa, cada uma entra aqui quando existir:
 * TODO(admin-salas): "Salas e temas" (edição de Salas e temas).
 * TODO(admin-glossario): "Glossário" (RF-14).
 * TODO(admin-usuarios): "Usuários e papéis" (RF-08), sem ranking nem pontuação de pessoas (RNF-DOM-05).
 * TODO(admin-moderacao): "Moderação" de comentários (RF-32 a RF-36).
 * TODO(admin-comparacoes): "Comparações e assistente" (edição da grade e das respostas curadas).
 */
function itens(caminho: string, c: Contagens): ItemNavegacao[] {
  const em = (base: string) => caminho === base || caminho.startsWith(`${base}/`);
  return [
    { href: "/admin" as Route, rotulo: "Painel", icone: "grade", ativo: caminho === "/admin" },
    {
      href: "/admin/artigos" as Route,
      rotulo: "Artigos",
      icone: "artigo",
      ativo: em("/admin/artigos"),
      contagem: c.artigos,
    },
    {
      href: "/admin/videos" as Route,
      rotulo: "Vídeos",
      icone: "video",
      ativo: em("/admin/videos"),
      contagem: c.videos,
    },
    {
      href: "/admin/fontes" as Route,
      rotulo: "Fontes",
      icone: "fontePrimaria",
      ativo: em("/admin/fontes"),
      contagem: c.fontes,
    },
    {
      href: "/admin/destaques" as Route,
      rotulo: "Destaques",
      icone: "destaques",
      ativo: em("/admin/destaques"),
    },
    {
      href: "/admin/historico" as Route,
      rotulo: "Histórico",
      icone: "relogio",
      ativo: em("/admin/historico"),
      separarAntes: true,
    },
  ];
}

/** Área de trabalho da curadoria: navegação lateral recolhível; no celular, Drawer. */
export function CascaCuradoria({ contagens, children }: { contagens: Contagens; children: ReactNode }) {
  const caminho = usePathname();
  const [recolhida, setRecolhida] = useState(false);
  const [gaveta, setGaveta] = useState(false);
  const lista = itens(caminho, contagens);

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start">
      <div className="hidden lg:sticky lg:top-6 lg:block">
        <NavegacaoLateral
          titulo="Curadoria"
          itens={lista}
          recolhida={recolhida}
          onAlternar={() => setRecolhida((r) => !r)}
        />
      </div>
      <div className="lg:hidden">
        <Button variant="glass" icon="grade" onClick={() => setGaveta(true)}>
          Menu da curadoria
        </Button>
      </div>
      <Drawer open={gaveta} onClose={() => setGaveta(false)} title="Curadoria">
        <NavegacaoLateral titulo="Curadoria" itens={lista} sheet onNavegar={() => setGaveta(false)} />
      </Drawer>
      <div className="flex min-w-0 flex-col gap-6">{children}</div>
    </div>
  );
}
