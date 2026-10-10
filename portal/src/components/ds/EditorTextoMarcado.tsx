"use client";

import { useRef } from "react";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { TextoMarcado } from "./TextoMarcado";

/** Envolve a seleção (ou insere um modelo) com o marcador, sem aceitar HTML. */
export function aplicarMarcacao(
  texto: string,
  inicio: number,
  fim: number,
  marca: "*" | "_",
): { texto: string; cursorInicio: number; cursorFim: number } {
  const selecionado = texto.slice(inicio, fim);
  const miolo = selecionado || (marca === "*" ? "termo" : "obra");
  const novo = `${texto.slice(0, inicio)}${marca}${miolo}${marca}${texto.slice(fim)}`;
  return { texto: novo, cursorInicio: inicio + 1, cursorFim: inicio + 1 + miolo.length };
}

interface EditorTextoMarcadoProps {
  idBase: string;
  paragrafos: string[];
  onChange: (paragrafos: string[]) => void;
  erro?: string;
  somenteLeitura?: boolean;
}

/**
 * Editor de texto marcado (EditorTextoMarcado): um parágrafo por bloco, com
 * as marcações *termo* e _obra_ e pré-visualização renderizada pelo mesmo
 * TextoMarcado das páginas públicas. Não é editor rico: não aceita HTML.
 */
export function EditorTextoMarcado({
  idBase,
  paragrafos,
  onChange,
  erro,
  somenteLeitura,
}: EditorTextoMarcadoProps) {
  const areas = useRef<(HTMLTextAreaElement | null)[]>([]);

  const alterar = (i: number, texto: string) => onChange(paragrafos.map((p, j) => (j === i ? texto : p)));
  const mover = (i: number, passo: -1 | 1) => {
    const destino = i + passo;
    if (destino < 0 || destino >= paragrafos.length) return;
    const nova = [...paragrafos];
    [nova[i], nova[destino]] = [nova[destino] ?? "", nova[i] ?? ""];
    onChange(nova);
    requestAnimationFrame(() => areas.current[destino]?.focus());
  };
  const remover = (i: number) => {
    const nova = paragrafos.filter((_, j) => j !== i);
    onChange(nova.length ? nova : [""]);
    requestAnimationFrame(() => areas.current[Math.max(0, i - 1)]?.focus());
  };
  const marcar = (i: number, marca: "*" | "_") => {
    const area = areas.current[i];
    const texto = paragrafos[i] ?? "";
    const r = aplicarMarcacao(
      texto,
      area?.selectionStart ?? texto.length,
      area?.selectionEnd ?? texto.length,
      marca,
    );
    alterar(i, r.texto);
    requestAnimationFrame(() => {
      area?.focus();
      area?.setSelectionRange(r.cursorInicio, r.cursorFim);
    });
  };

  return (
    <div className="sdb-editor">
      {paragrafos.map((p, i) => {
        const n = i + 1;
        const id = `${idBase}-${i}`;
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: a posição é a identidade do parágrafo no editor.
          <div key={i} className="sdb-editor__block">
            <span className="sdb-editor__num" aria-hidden="true">
              {n}
            </span>
            <div className="sdb-editor__main">
              <div className="sdb-editor__bar" role="toolbar" aria-label={`Marcações do parágrafo ${n}`}>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={somenteLeitura}
                  aria-label={`Marcar termo da tradição no parágrafo ${n}`}
                  onClick={() => marcar(i, "*")}
                >
                  <dfn>Termo</dfn>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={somenteLeitura}
                  aria-label={`Marcar título de obra no parágrafo ${n}`}
                  onClick={() => marcar(i, "_")}
                >
                  <cite>Obra</cite>
                </Button>
                {i === 0 && <span className="sdb-footnote">Selecione o trecho e escolha a marcação.</span>}
              </div>
              <label className="sdb-sr" htmlFor={id}>
                Parágrafo {n}
              </label>
              <div
                className={
                  erro && i === 0 ? "sdb-control sdb-control--area is-error" : "sdb-control sdb-control--area"
                }
              >
                <textarea
                  id={id}
                  ref={(el) => {
                    areas.current[i] = el;
                  }}
                  rows={3}
                  value={p}
                  readOnly={somenteLeitura}
                  aria-describedby={erro && i === 0 ? `${idBase}-erro` : `${id}-previa`}
                  onChange={(e) => alterar(i, e.target.value)}
                />
              </div>
              <p id={`${id}-previa`} className="sdb-editor__preview">
                {p.trim() ? <TextoMarcado texto={p} /> : null}
              </p>
            </div>
            <div className="sdb-editor__tools">
              <Button
                iconOnly
                size="sm"
                aria-label={`Subir parágrafo ${n}`}
                disabled={somenteLeitura || i === 0}
                onClick={() => mover(i, -1)}
              >
                <Icon name="chevronBaixo" size="sm" className="sdb-editor__up" />
              </Button>
              <Button
                iconOnly
                size="sm"
                icon="chevronBaixo"
                aria-label={`Descer parágrafo ${n}`}
                disabled={somenteLeitura || i === paragrafos.length - 1}
                onClick={() => mover(i, 1)}
              />
              <Button
                iconOnly
                size="sm"
                icon="lixeira"
                aria-label={`Remover parágrafo ${n}`}
                disabled={somenteLeitura || (paragrafos.length === 1 && !p)}
                onClick={() => remover(i)}
              />
            </div>
          </div>
        );
      })}
      {erro && (
        <p id={`${idBase}-erro`} className="sdb-error-msg">
          <Icon name="erro" />
          <span>
            <b>Erro:</b> {erro}
          </span>
        </p>
      )}
      <div>
        <Button
          variant="tinted"
          size="sm"
          icon="mais"
          disabled={somenteLeitura}
          onClick={() => {
            onChange([...paragrafos, ""]);
            requestAnimationFrame(() => areas.current[paragrafos.length]?.focus());
          }}
        >
          Adicionar parágrafo
        </Button>
      </div>
    </div>
  );
}
