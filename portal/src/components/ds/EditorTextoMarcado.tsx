"use client";

import { useRef } from "react";
import { BarraFormatacao, type FonteCitavel } from "./BarraFormatacao";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { TextoMarcado } from "./TextoMarcado";

interface EditorTextoMarcadoProps {
  idBase: string;
  paragrafos: string[];
  onChange: (paragrafos: string[]) => void;
  erro?: string;
  /** Obras já escolhidas, para a barra citar ([1], [2]…). */
  fontes?: readonly FonteCitavel[];
  somenteLeitura?: boolean;
}

/**
 * Editor de texto marcado (EditorTextoMarcado): um parágrafo por bloco, com a
 * Barra de formatação e pré-visualização renderizada pelo mesmo TextoMarcado
 * das páginas públicas. Não é editor rico: não aceita HTML.
 */
export function EditorTextoMarcado({
  idBase,
  paragrafos,
  onChange,
  erro,
  fontes,
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
              <label className="sdb-sr" htmlFor={id}>
                Parágrafo {n}
              </label>
              <div
                className={
                  erro && i === 0
                    ? "sdb-control sdb-control--area sdb-control--fmt is-error"
                    : "sdb-control sdb-control--area sdb-control--fmt"
                }
              >
                <BarraFormatacao
                  area={{
                    get current() {
                      return areas.current[i] ?? null;
                    },
                  }}
                  valor={p}
                  onChange={(texto) => alterar(i, texto)}
                  alvo={`parágrafo ${n}`}
                  fontes={fontes}
                  desabilitada={somenteLeitura}
                />
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
              <div className="sdb-field__foot">
                <p className="sdb-help">Selecione um trecho para formatar.</p>
                <span className="sdb-counter">{p.length.toLocaleString("pt-BR")} caracteres</span>
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
