"use client";

import type { Route } from "next";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ds/Button";
import { Drawer } from "@/components/ds/Drawer";
import { type ItemNavegacao, NavegacaoLateral } from "@/components/ds/NavegacaoLateral";

interface Contagens {
  /** Salas (oficiais e de anfitriões). */
  salas: number;
  fontes: number;
  /** Salas e artigos de anfitriões esperando decisão. */
  revisao: number;
}

/*
 * Seções da curadoria. A curadoria trabalha a partir da Sala: artigos e
 * vídeos vivem dentro de cada Sala (/admin/salas/[slug]); não há listas soltas.
 * Fora desta etapa, cada seção entra aqui quando existir:
 * TODO(admin-glossario): "Glossário" (RF-14).
 * TODO(admin-moderacao): "Moderação" de comentários (RF-32 a RF-36).
 * TODO(admin-comparacoes): "Comparações e assistente" (edição da grade e das respostas curadas).
 */
function itens(caminho: string, c: Contagens): ItemNavegacao[] {
  const em = (base: string) => caminho === base || caminho.startsWith(`${base}/`);
  return [
    { href: "/admin" as Route, rotulo: "Painel", icone: "grade", ativo: caminho === "/admin" },
    {
      href: "/admin/salas" as Route,
      rotulo: "Salas",
      icone: "salas",
      ativo: em("/admin/salas"),
      contagem: c.salas,
    },
    {
      href: "/admin/anfitrioes" as Route,
      rotulo: "Revisão de anfitriões",
      icone: "anfitriao",
      ativo: em("/admin/anfitrioes"),
      contagem: c.revisao || undefined,
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
    { href: "/admin/usuarios" as Route, rotulo: "Usuários", icone: "pessoa", ativo: em("/admin/usuarios") },
    {
      href: "/admin/caixa-saida" as Route,
      rotulo: "Caixa de saída",
      icone: "enviar",
      ativo: em("/admin/caixa-saida"),
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
