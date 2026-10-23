"use client";

import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Icon, type IconName } from "./Icon";
import { Menu } from "./Menu";
import {
  ALTERNAVEIS,
  aplicarMarcacao,
  type BlocoTexto,
  citarFonte,
  converterBloco,
  type Edicao,
  jaMarcado,
  limparMarcacoes,
  type Marca,
} from "./marcacao";

export interface FonteCitavel {
  n: number;
  titulo: string;
}
interface BarraFormatacaoProps {
  area: { current: HTMLTextAreaElement | null };
  valor: string;
  onChange: (texto: string) => void;
  alvo: string;
  fontes?: readonly FonteCitavel[];
  desabilitada?: boolean;
  bloco?: BlocoTexto;
  onBloco?: (bloco: BlocoTexto) => void;
  onAviso?: (texto: string) => void;
}
const ICONES: Partial<Record<Marca, IconName>> = {
  negrito: "negrito",
  italico: "italico",
  sublinhado: "sublinhado",
  tachado: "tachado",
  link: "link",
};

/** HTML/CSS da biblioteca; estado e eventos pertencem ao React. */
export function BarraFormatacao({
  area,
  onChange,
  alvo,
  fontes = [],
  desabilitada,
  bloco,
  onBloco,
  onAviso,
}: BarraFormatacaoProps) {
  const barra = useRef<HTMLDivElement>(null);
  const [acesas, setAcesas] = useState<Marca[]>([]);
  const [mod, setMod] = useState("Ctrl+");
  const sincronizar = () => {
    const campo = area.current;
    if (campo)
      setAcesas(
        ALTERNAVEIS.filter((m) => jaMarcado(campo.value, campo.selectionStart, campo.selectionEnd, m)),
      );
  };
  const escrever = (edicao: Edicao, devolverFocoDoMenu = false) => {
    const campo = area.current;
    if (!campo || desabilitada || campo.readOnly || campo.disabled) return;
    campo.focus();
    campo.setSelectionRange(edicao.inicio, edicao.fim);
    let entrada = false;
    const observar = () => {
      entrada = true;
    };
    campo.addEventListener("input", observar);
    try {
      document.execCommand("insertText", false, edicao.trecho);
    } catch {}
    campo.removeEventListener("input", observar);
    if (campo.value !== edicao.texto) {
      // Setter nativo evita o rastreador de value do React; o input chega ao framework.
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set?.call(campo, edicao.texto);
      entrada = false;
    }
    if (!entrada) campo.dispatchEvent(new Event("input", { bubbles: true }));
    // Confirma o valor controlado antes de selecionar. Um quadro atrasado não pode
    // sobrescrever a seleção de uma edição seguinte ou de um desfazer nativo.
    flushSync(() => onChange(edicao.texto));
    campo.setSelectionRange(edicao.cursorInicio, edicao.cursorFim);
    sincronizar();
    if (devolverFocoDoMenu)
      requestAnimationFrame(() => {
        const ativo = document.activeElement;
        if (
          campo.value === edicao.texto &&
          barra.current?.contains(ativo) &&
          ativo?.getAttribute("aria-haspopup") === "menu"
        )
          campo.focus();
      });
  };
  const marcar = (marca: Marca) => {
    const campo = area.current;
    if (campo) escrever(aplicarMarcacao(campo.value, campo.selectionStart, campo.selectionEnd, marca));
  };
  const converter = (estilo: string) => {
    if (!bloco || !onBloco || desabilitada) return;
    const r = converterBloco(bloco, estilo);
    onBloco(r.bloco);
    if (r.aviso) onAviso?.(r.aviso);
    area.current?.focus();
  };
  const controles = () =>
    Array.from(barra.current?.querySelectorAll<HTMLElement>("select,button") ?? []).filter(
      (b) => !b.closest("[role=menu]") && !b.hasAttribute("disabled"),
    );
  const teclado = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[role=menu]")) return;
    const itens = controles(),
      i = itens.indexOf(e.target as HTMLElement);
    if (i < 0 || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    itens[
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? itens.length - 1
          : (i + (e.key === "ArrowRight" ? 1 : -1) + itens.length) % itens.length
    ]?.focus();
  };
  useEffect(() => {
    setMod(/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl+");
  }, []);
  useEffect(() => {
    const itens = controles();
    const atual =
      itens.find((b) => b === document.activeElement) ?? itens.find((b) => b.tabIndex === 0) ?? itens[0];
    itens.forEach((b) => {
      b.tabIndex = b === atual ? 0 : -1;
    });
    const campo = area.current;
    if (!campo) return;
    const selecao = () => {
      if (document.activeElement === campo) sincronizar();
    };
    const atalhos = (e: globalThis.KeyboardEvent) => {
      const m = ({ b: "negrito", i: "italico", u: "sublinhado", k: "link" } as const)[
        e.key.toLowerCase() as "b"
      ];
      if (m && (e.metaKey || e.ctrlKey) && !e.altKey && !desabilitada) {
        e.preventDefault();
        e.stopPropagation();
        marcar(m);
      }
    };
    document.addEventListener("selectionchange", selecao);
    campo.addEventListener("select", selecao);
    campo.addEventListener("keydown", atalhos);
    return () => {
      document.removeEventListener("selectionchange", selecao);
      campo.removeEventListener("select", selecao);
      campo.removeEventListener("keydown", atalhos);
    };
  });
  const botao = (marca: Marca, rotulo: string, atalho?: string) => (
    <button
      type="button"
      className={`sdb-fmt__btn${ICONES[marca] ? " sdb-fmt__btn--icone" : ""}`}
      aria-label={`${rotulo} no ${alvo}`}
      data-tip={`${rotulo} no ${alvo}${atalho ? ` (${mod}${atalho})` : ""}`}
      aria-pressed={acesas.includes(marca)}
      disabled={desabilitada}
      tabIndex={-1}
      onClick={() => marcar(marca)}
    >
      {ICONES[marca] ? <Icon name={ICONES[marca]} size="sm" /> : marca === "termo" ? "Termo" : "Obra"}
    </button>
  );
  const sep = <span className="sdb-fmt__sep" aria-hidden="true" />;
  const listaPermitida = !!onBloco && bloco?.tipo !== "intertitulo";
  const alinhamentoPermitido = !!onBloco && (bloco?.tipo === "paragrafo" || bloco?.tipo === "intertitulo");
  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: toolbar delega teclas e foco dos controles filhos (roving tabindex).
    <div
      ref={barra}
      className="sdb-fmt"
      role="toolbar"
      aria-label={`Formatação do ${alvo}`}
      onKeyDown={teclado}
      onFocusCapture={(e) => {
        const itens = controles();
        if (itens.includes(e.target))
          itens.forEach((b) => {
            b.tabIndex = b === e.target ? 0 : -1;
          });
      }}
    >
      <select
        className="sdb-fmt__estilo"
        tabIndex={-1}
        aria-label={`Estilo do ${alvo}`}
        value={
          bloco?.tipo === "intertitulo"
            ? `titulo-${bloco.nivel ?? 2}`
            : bloco?.tipo === "destaque"
              ? "destaque"
              : bloco?.tipo === "lista"
                ? bloco.ordenada
                  ? "numerada"
                  : "lista"
                : "paragrafo"
        }
        disabled={desabilitada || !onBloco}
        onChange={(e) => converter(e.target.value)}
      >
        <option value="paragrafo">Parágrafo</option>
        <option value="titulo-2">Título</option>
        <option value="titulo-3">Subtítulo</option>
        <option value="destaque">Citação</option>
        <option value="lista">Lista com marcadores</option>
        <option value="numerada">Lista numerada</option>
      </select>
      {sep}
      {botao("negrito", "Negrito", "B")}
      {botao("italico", "Itálico", "I")}
      {botao("sublinhado", "Sublinhado", "U")}
      {botao("tachado", "Tachado")}
      {sep}
      {([false, true] as const).map((ordenada) => (
        <button
          key={String(ordenada)}
          type="button"
          tabIndex={-1}
          className="sdb-fmt__btn sdb-fmt__btn--icone"
          aria-label={`Lista ${ordenada ? "numerada" : "com marcadores"} no ${alvo}`}
          data-tip={
            listaPermitida
              ? `Lista ${ordenada ? "numerada" : "com marcadores"} no ${alvo}`
              : bloco?.tipo === "intertitulo"
                ? "Títulos não têm lista. Escolha Parágrafo primeiro."
                : "Este campo aceita apenas parágrafos."
          }
          aria-disabled={!listaPermitida || desabilitada}
          aria-pressed={bloco?.tipo === "lista" && bloco.ordenada === ordenada}
          onClick={() => {
            if (listaPermitida)
              converter(
                bloco?.tipo === "lista" && bloco.ordenada === ordenada
                  ? "paragrafo"
                  : ordenada
                    ? "numerada"
                    : "lista",
              );
          }}
        >
          <Icon name={ordenada ? "listaNumerada" : "listaMarcadores"} size="sm" />
        </button>
      ))}
      {sep}
      <div className="sdb-fmt__grupo" role="group" aria-label={`Alinhamento do ${alvo}`}>
        {(["esquerda", "centro", "direita"] as const).map((a, i) => (
          <button
            key={a}
            type="button"
            tabIndex={-1}
            className="sdb-fmt__btn sdb-fmt__btn--icone"
            aria-label={`${["Alinhar à esquerda", "Centralizar", "Alinhar à direita"][i]} no ${alvo}`}
            data-tip={
              alinhamentoPermitido
                ? `${["Alinhar à esquerda", "Centralizar", "Alinhar à direita"][i]} no ${alvo}`
                : "Alinhamento disponível em parágrafos e títulos."
            }
            aria-disabled={!alinhamentoPermitido || desabilitada}
            aria-pressed={
              alinhamentoPermitido &&
              ("alinhamento" in (bloco ?? {})
                ? ((bloco as { alinhamento?: string }).alinhamento ?? "esquerda")
                : "esquerda") === a
            }
            onClick={() => {
              if (
                !desabilitada &&
                onBloco &&
                (bloco?.tipo === "paragrafo" || bloco?.tipo === "intertitulo")
              ) {
                onBloco({ ...bloco, alinhamento: a });
                area.current?.focus();
              }
            }}
          >
            <Icon
              name={(["alinharEsquerda", "alinharCentro", "alinharDireita"] as const)[i] ?? "alinharEsquerda"}
              size="sm"
            />
          </button>
        ))}
      </div>
      {sep}
      {botao("link", "Link", "K")}
      {botao("termo", "Marcar termo da tradição")}
      {botao("obra", "Marcar título de obra")}
      {fontes.length && !desabilitada ? (
        <Menu
          trigger="Citar fonte"
          triggerLabel={`Citar fonte no ${alvo}`}
          triggerClassName="sdb-fmt__btn"
          titulo="Obras escolhidas"
          items={fontes.map((f) => ({
            label: `[${f.n}] ${f.titulo}`,
            onSelect: () => {
              const c = area.current;
              if (c) escrever(citarFonte(c.value, c.selectionEnd, f.n), true);
            },
          }))}
        />
      ) : (
        <button
          type="button"
          className="sdb-fmt__btn"
          tabIndex={-1}
          aria-label={`Citar fonte no ${alvo}`}
          aria-disabled="true"
          data-tip="Escolha uma obra em Fontes"
        >
          Citar fonte
        </button>
      )}
      <button
        type="button"
        className="sdb-fmt__btn sdb-fmt__btn--icone"
        tabIndex={-1}
        aria-label={`Limpar formatação do ${alvo}`}
        data-tip={`Limpar formatação do ${alvo}`}
        disabled={desabilitada}
        onClick={() => {
          const c = area.current;
          if (!c) return;
          const edicao = limparMarcacoes(c.value, c.selectionStart, c.selectionEnd);
          escrever(edicao);
          // Uma única atualização de bloco contém o texto limpo e o alinhamento padrão.
          if (onBloco && bloco)
            onBloco(
              bloco.tipo === "lista"
                ? { ...bloco, itens: edicao.texto.split("\n") }
                : {
                    ...bloco,
                    texto: edicao.texto,
                    ...(bloco.tipo === "paragrafo" || bloco.tipo === "intertitulo"
                      ? { alinhamento: "esquerda" as const }
                      : {}),
                  },
            );
        }}
      >
        <Icon name="limparFormato" size="sm" />
      </button>
    </div>
  );
}
