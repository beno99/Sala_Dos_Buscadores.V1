"use client";

import type { Route } from "next";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ds/Button";
import { Drawer } from "@/components/ds/Drawer";
import { type ItemNavegacao, NavegacaoLateral } from "@/components/ds/NavegacaoLateral";

export interface ContagensAnfitriao {
  salas: number;
  videos: number;
  anuncios: number;
  /** Decisões da curadoria ainda não vistas. */
  novidades: number;
}

/*
 * Área de trabalho do anfitrião, na mesma casca da curadoria. Sem as seções
 * que são só da curadoria (revisão de anfitriões, usuários, convites, fontes,
 * destaques, caixa de saída e histórico). Tudo o que se cria aqui vai para a
 * revisão antes de ir ao ar.
 */
function itens(caminho: string, c: ContagensAnfitriao): ItemNavegacao[] {
  const em = (base: string) => caminho === base || caminho.startsWith(`${base}/`);
  const criando = (base: string) => caminho === `${base}/novo` || caminho === `${base}/nova`;
  return [
    {
      href: "/anfitriao" as Route,
      rotulo: "Painel",
      icone: "grade",
      ativo: caminho === "/anfitriao",
      contagem: c.novidades || undefined,
    },
    {
      href: "/anfitriao/salas" as Route,
      rotulo: "Minhas Salas",
      icone: "salas",
      ativo:
        (em("/anfitriao/salas") && !criando("/anfitriao/salas") && !/\/artigos\/novo$/.test(caminho)) ||
        (em("/anfitriao/artigos") && !criando("/anfitriao/artigos")),
      contagem: c.salas,
    },
    {
      href: "/anfitriao/videos" as Route,
      rotulo: "Vídeos",
      icone: "video",
      ativo: em("/anfitriao/videos") && !criando("/anfitriao/videos"),
      contagem: c.videos,
    },
    {
      href: "/anfitriao/publicidade" as Route,
      rotulo: "Publicidade",
      icone: "imagem",
      ativo: em("/anfitriao/publicidade") && !criando("/anfitriao/publicidade"),
      contagem: c.anuncios,
    },
    {
      href: "/anfitriao/salas/nova" as Route,
      rotulo: "Criar Sala",
      icone: "mais",
      ativo: caminho === "/anfitriao/salas/nova",
      separarAntes: true,
    },
    {
      href: "/anfitriao/artigos/novo" as Route,
      rotulo: "Criar artigo",
      icone: "artigo",
      ativo:
        caminho === "/anfitriao/artigos/novo" || /^\/anfitriao\/salas\/[^/]+\/artigos\/novo$/.test(caminho),
    },
    {
      href: "/anfitriao/videos/novo" as Route,
      rotulo: "Criar vídeo",
      icone: "play",
      ativo: caminho === "/anfitriao/videos/novo",
    },
    {
      href: "/anfitriao/publicidade/nova" as Route,
      rotulo: "Criar publicidade",
      icone: "editar",
      ativo: caminho === "/anfitriao/publicidade/nova",
    },
    {
      href: "/anfitriao/conversa" as Route,
      rotulo: "Conversa com a curadoria",
      icone: "comunidade",
      ativo: em("/anfitriao/conversa"),
      separarAntes: true,
    },
    {
      href: "/comunidade" as Route,
      rotulo: "Comunidade",
      icone: "comunidade",
      ativo: false,
    },
    {
      href: "/anfitriao/perfil" as Route,
      rotulo: "Perfil público",
      icone: "pessoa",
      ativo: em("/anfitriao/perfil"),
    },
  ];
}

/** Casca do anfitrião: navegação lateral recolhível; no celular, Drawer. Mesma estrutura da curadoria. */
export function CascaAnfitriao({
  contagens,
  children,
}: {
  contagens: ContagensAnfitriao;
  children: ReactNode;
}) {
  const caminho = usePathname();
  const [recolhida, setRecolhida] = useState(false);
  const [gaveta, setGaveta] = useState(false);
  const lista = itens(caminho, contagens);

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start">
      <div className="hidden lg:sticky lg:top-6 lg:block">
        <NavegacaoLateral
          titulo="Anfitrião"
          itens={lista}
          recolhida={recolhida}
          onAlternar={() => setRecolhida((r) => !r)}
        />
      </div>
      <div className="lg:hidden">
        <Button variant="glass" icon="grade" onClick={() => setGaveta(true)}>
          Menu do anfitrião
        </Button>
      </div>
      <Drawer open={gaveta} onClose={() => setGaveta(false)} title="Anfitrião">
        <NavegacaoLateral titulo="Anfitrião" itens={lista} sheet onNavegar={() => setGaveta(false)} />
      </Drawer>
      <div className="flex min-w-0 flex-col gap-8">{children}</div>
    </div>
  );
}
