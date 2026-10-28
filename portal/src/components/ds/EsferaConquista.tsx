"use client";

import { useEffect, useRef } from "react";
import { arteDaConquista } from "@/features/conquistas/paletas";

/*
 * Esfera de vidro da Conquista (Conquista 1.1): o desenho é o `solid-orb.js` do
 * design system, usado como está; o comportamento do `badge-motion.js` vem
 * portado para cá. Um relógio compartilhado limita o desenho a 30 fps e DPR 1,5;
 * esferas fora da tela, aba oculta e movimento reduzido ficam paradas.
 */

interface Renderizador {
  resize(largura: number, altura: number): void;
  render(estado: {
    time: number;
    pointer: [number, number];
    hover: number;
    pulse: number;
    dark: boolean;
    reduced: boolean;
    reveal: number;
  }): void;
  dispose(): void;
}

declare global {
  interface Window {
    SDBSolidOrb?: {
      create(
        canvas: HTMLCanvasElement,
        config: { colors: string[]; seed: number; style: number },
      ): Renderizador | null;
    };
  }
}

/** Relógio de 30 fps: cada passo devolve `true` enquanto ainda precisa de quadros. */
const passos = new Set<(dt: number) => boolean>();
let quadro = 0;
let anterior = 0;

function relogio(agora: number) {
  quadro = 0;
  if (document.hidden) return;
  if (agora - anterior < 1000 / 30) {
    quadro = requestAnimationFrame(relogio);
    return;
  }
  const dt = Math.min((agora - anterior) / 1000, 0.05);
  anterior = agora;
  for (const passo of [...passos]) if (!passo(dt)) passos.delete(passo);
  if (passos.size) quadro = requestAnimationFrame(relogio);
}

function agendar(passo: (dt: number) => boolean) {
  passos.add(passo);
  if (quadro || document.hidden) return;
  anterior = performance.now() - 1000 / 30;
  quadro = requestAnimationFrame(relogio);
}

function montar(botao: HTMLButtonElement, id: string, obtida: boolean): () => void {
  const reduzido = matchMedia("(prefers-reduced-motion: reduce)");
  const fino = matchMedia("(hover: hover) and (pointer: fine)");
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  botao.append(canvas);

  const { colors, seed, style } = arteDaConquista(id);
  let renderer: Renderizador | null = null;
  let tentou = false;
  let visivel = false;
  let sujo = true;
  let tempo = 0;
  let hover = 0;
  let alvo = 0;
  let pulso = 0;
  let velocidade = 0;
  let ponteiro: [number, number] = [0, 0];
  let mira: [number, number] = [0, 0];

  const zerar = () => {
    alvo = hover = pulso = velocidade = 0;
    ponteiro = [0, 0];
    mira = [0, 0];
  };
  const dimensionar = () => {
    const lado = Math.min(192, botao.clientWidth);
    const px = Math.round(lado * Math.min(devicePixelRatio || 1, 1.5));
    renderer?.resize(px, px);
    sujo = true;
  };
  const iniciar = () => {
    if (tentou) return;
    tentou = true;
    renderer = window.SDBSolidOrb?.create(canvas, { colors, seed, style }) ?? null;
    botao.dataset.rendered = String(Boolean(renderer));
    dimensionar();
  };
  const passo = (dt: number) => {
    if (!visivel) return false;
    iniciar();
    if (!renderer) return false;
    const animar = obtida && !reduzido.matches;
    if (animar) {
      tempo += dt;
      // Resposta rápida (160 ms) e mola de massa 1, k 100, amortecimento 10.
      const resposta = 1 - Math.exp(-dt / 0.16);
      hover += (alvo - hover) * resposta;
      ponteiro = [
        ponteiro[0] + (mira[0] - ponteiro[0]) * resposta,
        ponteiro[1] + (mira[1] - ponteiro[1]) * resposta,
      ];
      velocidade += (-100 * pulso - 10 * velocidade) * dt;
      pulso += velocidade * dt;
      if (Math.abs(pulso) < 0.001 && Math.abs(velocidade) < 0.01) pulso = velocidade = 0;
    }
    if (sujo || animar) {
      renderer.render({
        time: tempo,
        pointer: ponteiro,
        hover,
        pulse: Math.max(0, Math.min(1, pulso)),
        dark: true,
        reduced: reduzido.matches,
        reveal: obtida ? 1 : 0,
      });
      sujo = false;
    }
    return animar;
  };
  const atualizar = () => {
    if (!obtida || reduzido.matches) zerar();
    sujo = true;
    agendar(passo);
  };

  const pode = (e: PointerEvent) => obtida && fino.matches && e.pointerType !== "touch" && !reduzido.matches;
  const entrar = (e: PointerEvent) => {
    if (pode(e)) {
      alvo = 1;
      agendar(passo);
    }
  };
  const mover = (e: PointerEvent) => {
    if (!pode(e)) return;
    const r = botao.getBoundingClientRect();
    mira = [((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1];
    alvo = 1;
  };
  const sair = () => {
    alvo = 0;
    mira = [0, 0];
  };
  const clicar = () => {
    if (!obtida || reduzido.matches) return;
    // Cliques repetidos somam um impulso limitado a partir da posição atual da mola.
    velocidade = Math.min(12, velocidade + 8);
    agendar(passo);
  };
  const perder = (e: Event) => {
    e.preventDefault();
    renderer?.dispose();
    renderer = null;
    botao.dataset.rendered = "false";
  };
  const restaurar = () => {
    tentou = false;
    atualizar();
  };
  const aba = () => {
    zerar();
    if (!document.hidden) atualizar();
  };

  const visibilidade = new IntersectionObserver(([entrada]) => {
    visivel = Boolean(entrada?.isIntersecting && entrada.intersectionRatio > 0);
    if (!visivel) zerar();
    atualizar();
  });
  const tamanho = new ResizeObserver(() => {
    dimensionar();
    agendar(passo);
  });
  visibilidade.observe(botao);
  tamanho.observe(botao);
  botao.addEventListener("pointerenter", entrar);
  botao.addEventListener("pointermove", mover);
  botao.addEventListener("pointerleave", sair);
  botao.addEventListener("pointercancel", sair);
  botao.addEventListener("blur", sair);
  botao.addEventListener("click", clicar);
  canvas.addEventListener("webglcontextlost", perder);
  canvas.addEventListener("webglcontextrestored", restaurar);
  reduzido.addEventListener("change", atualizar);
  fino.addEventListener("change", atualizar);
  document.addEventListener("visibilitychange", aba);

  return () => {
    passos.delete(passo);
    visibilidade.disconnect();
    tamanho.disconnect();
    botao.removeEventListener("pointerenter", entrar);
    botao.removeEventListener("pointermove", mover);
    botao.removeEventListener("pointerleave", sair);
    botao.removeEventListener("pointercancel", sair);
    botao.removeEventListener("blur", sair);
    botao.removeEventListener("click", clicar);
    canvas.removeEventListener("webglcontextlost", perder);
    canvas.removeEventListener("webglcontextrestored", restaurar);
    reduzido.removeEventListener("change", atualizar);
    fino.removeEventListener("change", atualizar);
    document.removeEventListener("visibilitychange", aba);
    renderer?.dispose();
    canvas.remove();
    delete botao.dataset.rendered;
  };
}

/** Botão da esfera (`.sdb-badge-card__orb`): anima só quando a conquista foi obtida. */
export function EsferaConquista({ id, nome, obtida }: { id: string; nome: string; obtida: boolean }) {
  const botao = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const el = botao.current;
    if (!el) return;
    let cancelado = false;
    let desmontar = () => {};
    // O renderizador toca em `window` ao carregar: só no navegador. É um script
    // clássico, que registra `window.SDBSolidOrb` em vez de exportar.
    // @ts-expect-error o arquivo da biblioteca não é um módulo ES.
    void import("@/design-system/solid-orb.js").then(() => {
      if (!cancelado) desmontar = montar(el, id, obtida);
    });
    return () => {
      cancelado = true;
      desmontar();
    };
  }, [id, obtida]);
  return (
    <button
      ref={botao}
      className="sdb-badge-card__orb"
      type="button"
      aria-label={`Animar esfera de ${nome}`}
      disabled={!obtida}
    >
      <span className="sdb-badge-card__fallback" aria-hidden="true" />
    </button>
  );
}
