"use client";

import { type KeyboardEvent, useId, useRef, useState } from "react";
import { Button } from "@/components/ds/Button";
import { Sheet } from "@/components/ds/Sheet";
import { APARENCIAS, type Aparencia, aplicarAparencia } from "./tema";

/**
 * Aparência (layout do Figma): o botão da Barra superior abre um diálogo com
 * o Seletor de tema (quatro temas em miniatura) e a opção de lateral
 * translúcida. Só vale ao salvar; cancelar ou Esc mantém o que estava.
 */
export function MenuAparencia({
  inicial,
  lateralInicial = false,
}: {
  inicial: Aparencia;
  lateralInicial?: boolean;
}) {
  const id = useId();
  const [aberto, setAberto] = useState(false);
  const [salvo, setSalvo] = useState({ aparencia: inicial, lateral: lateralInicial });
  const [escolha, setEscolha] = useState(salvo);
  const opcoes = useRef<(HTMLButtonElement | null)[]>([]);

  const abrir = () => {
    setEscolha(salvo);
    setAberto(true);
  };
  const salvar = () => {
    aplicarAparencia(escolha.aparencia, escolha.lateral);
    setSalvo(escolha);
    setAberto(false);
  };
  const setas = (e: KeyboardEvent<HTMLDivElement>) => {
    const passo =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? -1
          : 0;
    if (!passo) return;
    e.preventDefault();
    const atual = APARENCIAS.findIndex((a) => a.valor === escolha.aparencia);
    const proximo = (atual + passo + APARENCIAS.length) % APARENCIAS.length;
    const a = APARENCIAS[proximo];
    if (!a) return;
    setEscolha((x) => ({ ...x, aparencia: a.valor }));
    opcoes.current[proximo]?.focus();
  };

  return (
    <>
      <Button
        variant="secondary"
        iconOnly
        icon="tema"
        aria-label="Aparência"
        aria-haspopup="dialog"
        onClick={abrir}
      />
      <Sheet
        aberto={aberto}
        onFechar={() => setAberto(false)}
        rotuloId={`${id}-titulo`}
        className="sdb-sheet--aparencia"
      >
        <div className="flex flex-col gap-6 p-7">
          <div className="flex items-center justify-between gap-4">
            <h2 id={`${id}-titulo`} className="sdb-title-2 m-0">
              Aparência
            </h2>
            <Button
              variant="secondary"
              iconOnly
              icon="fechar"
              aria-label="Fechar"
              onClick={() => setAberto(false)}
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p id={`${id}-tema`} className="sdb-headline m-0">
                Tema
              </p>
              <p className="sdb-footnote m-0">Escolha as cores da interface</p>
            </div>
            <div className="sdb-themepick" role="radiogroup" aria-labelledby={`${id}-tema`} onKeyDown={setas}>
              {APARENCIAS.map((a, i) => {
                const marcado = escolha.aparencia === a.valor;
                return (
                  <button
                    key={a.valor}
                    ref={(el) => {
                      opcoes.current[i] = el;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={marcado}
                    tabIndex={marcado ? 0 : -1}
                    className="sdb-themepick__opt"
                    onClick={() => setEscolha((x) => ({ ...x, aparencia: a.valor }))}
                  >
                    <span className="sdb-themepick__mini" data-theme={a.tema} aria-hidden="true">
                      <i />
                    </span>
                    {a.nome}
                  </button>
                );
              })}
            </div>
          </div>
          <label className="sdb-switch justify-between" htmlFor={`${id}-lateral`}>
            <span className="flex flex-col gap-1">
              <span className="sdb-headline">Barra lateral</span>
              <span className="sdb-footnote">Deixar a barra lateral translúcida</span>
            </span>
            <input
              id={`${id}-lateral`}
              type="checkbox"
              role="switch"
              aria-checked={escolha.lateral}
              checked={escolha.lateral}
              onChange={(e) => setEscolha((x) => ({ ...x, lateral: e.target.checked }))}
            />
          </label>
          <div className="sdb-modal__actions">
            <Button variant="secondary" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={salvar}>
              Salvar
            </Button>
          </div>
        </div>
      </Sheet>
    </>
  );
}
