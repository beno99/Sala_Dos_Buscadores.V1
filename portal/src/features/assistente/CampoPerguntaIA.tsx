"use client";

import { type FormEvent, type KeyboardEvent, useEffect, useId, useRef } from "react";
import { Chip } from "@/components/ds/Chip";
import { Icon } from "@/components/ds/Icon";
import { Menu } from "@/components/ds/Menu";
import { todasAsSalas } from "@/data/catalogo";
import { cx } from "@/lib/cx";
import type { Escopo } from "./motor";

const LIMITE = 2000;

interface CampoPerguntaIAProps {
  valor: string;
  onChange: (valor: string) => void;
  onEnviar: () => void;
  onInterromper: () => void;
  gerando: boolean;
  erro?: boolean;
  escopo: Escopo;
  onEscopo: (escopo: Escopo) => void;
  sugestoes: string[];
  estado: string;
}

/**
 * Campo de pergunta ao assistente (CampoPerguntaIA): cresce com o texto,
 * oferece sugestões em chips (preenchem sem enviar), escolhe o escopo e
 * alterna entre Enviar e Interromper no mesmo lugar.
 */
export function CampoPerguntaIA({
  valor,
  onChange,
  onEnviar,
  onInterromper,
  gerando,
  erro,
  escopo,
  onEscopo,
  sugestoes,
  estado,
}: CampoPerguntaIAProps) {
  const id = useId();
  const area = useRef<HTMLTextAreaElement>(null);

  // Cresce de 1 a ~8 linhas e depois rola (data-autogrow da biblioteca).
  // biome-ignore lint/correctness/useExhaustiveDependencies: o tamanho depende do texto atual.
  useEffect(() => {
    const t = area.current;
    if (!t) return;
    t.style.height = "auto";
    t.style.height = `${Math.min(t.scrollHeight, 220)}px`;
  }, [valor]);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (gerando) onInterromper();
    else if (valor.trim()) onEnviar();
  };

  const teclas = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (!gerando && valor.trim()) onEnviar();
    }
  };

  const salas = todasAsSalas();
  const nomeEscopo =
    escopo === "todo" ? "Todo o acervo" : (salas.find((s) => s.slug === escopo)?.nome ?? "Todo o acervo");

  return (
    <div className="sdb-col" style={{ gap: 12 }}>
      <div className="sdb-ask__suggest" role="group" aria-label="Sugestões de pergunta">
        {sugestoes.map((s) => (
          <Chip
            key={s}
            small
            disabled={gerando}
            onClick={() => {
              onChange(s);
              area.current?.focus();
            }}
          >
            {s}
          </Chip>
        ))}
      </div>
      <form className={cx("sdb-ask", erro && "is-error")} noValidate onSubmit={enviar}>
        <label htmlFor={id} className="sdb-sr">
          Pergunta ao assistente
        </label>
        <textarea
          id={id}
          ref={area}
          rows={1}
          maxLength={LIMITE}
          value={valor}
          readOnly={gerando}
          aria-describedby={`${id}-estado`}
          placeholder="Pergunte ao acervo. Ex.: como a alma é descrita no Corpus Hermeticum?"
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={teclas}
        />
        <div className="sdb-ask__bar">
          <Menu
            up
            titulo="Consultar em"
            triggerLabel={`Escopo da consulta: ${nomeEscopo}`}
            trigger={
              <>
                <Icon name="salas" size="sm" />
                <span>{nomeEscopo}</span>
                <Icon name="chevronDuplo" size="sm" />
              </>
            }
            items={[
              { label: "Todo o acervo", checked: escopo === "todo", onSelect: () => onEscopo("todo") },
              ...salas.map((s) => ({
                label: `Só ${s.nome}`,
                checked: escopo === s.slug,
                onSelect: () => onEscopo(s.slug),
              })),
            ]}
          />
          <span className="sdb-counter" aria-hidden="true">
            {valor.length.toLocaleString("pt-BR")} / {LIMITE.toLocaleString("pt-BR")}
          </span>
          <button
            type="submit"
            className="sdb-btn sdb-btn--icon sdb-btn--primary"
            aria-label={gerando ? "Interromper consulta" : "Enviar pergunta"}
            disabled={!gerando && !valor.trim()}
          >
            <Icon name={gerando ? "parar" : "enviar"} />
          </button>
        </div>
      </form>
      <p id={`${id}-estado`} className="sdb-hint px-2" aria-live="polite">
        {estado}
      </p>
    </div>
  );
}
