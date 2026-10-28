"use client";

import { useEffect, useId, useRef, useState } from "react";
import { textoParaCopiar } from "@/features/assistente/MensagemAssistente";
import type { Resposta } from "@/features/assistente/motor";
import { emitirEstudo } from "@/features/estudo/eventos";
import { Icon } from "./Icon";
import { useCopiar } from "./Toast";
import { useFocoPreso } from "./useFocoPreso";

/** Somente dados retornados pelo serviço; texto React escapado, sem HTML remoto. */
export function RespostaEstudo({ resposta }: { resposta: Resposta }) {
  const [aberto, setAberto] = useState(false);
  const dialogo = useRef<HTMLDialogElement>(null);
  const gatilho = useRef<HTMLButtonElement>(null);
  const titulo = useId();
  const copiar = useCopiar();
  useFocoPreso(dialogo, aberto);
  useEffect(() => {
    if (aberto) dialogo.current?.showModal();
    else if (dialogo.current?.open) dialogo.current.close();
  }, [aberto]);
  return (
    <article className="answer">
      <div className="answer-head">
        <b>Assistente do acervo</b>
        <span className="sdb-seal sdb-seal--ia">Síntese da IA</span>
      </div>
      {resposta.trechos.map((trecho) => (
        <section
          key={`${trecho.tipo}-${trecho.rotulo}-${trecho.texto}`}
          className={trecho.tipo === "doc" ? "answer-source" : "answer-segment"}
        >
          <small>{trecho.rotulo}</small>
          <p className="answer-body">{trecho.texto}</p>
        </section>
      ))}
      <div className="answer-actions">
        {resposta.fontes.length > 0 ? (
          <button
            ref={gatilho}
            type="button"
            className="sdb-btn sdb-btn--secondary sdb-btn--sm"
            onClick={() => setAberto(true)}
          >
            Conferir fontes ({resposta.fontes.length})
          </button>
        ) : (
          <p className="answer-context">Nenhuma fonte foi retornada pelo serviço.</p>
        )}
        <button
          type="button"
          className="sdb-btn sdb-btn--plain sdb-btn--sm"
          onClick={() => copiar(textoParaCopiar(resposta), "Resposta copiada com as referências.")}
        >
          Copiar com fontes
        </button>
      </div>
      <dialog
        ref={dialogo}
        className="study-dialog"
        aria-labelledby={titulo}
        onCancel={() => setAberto(false)}
        onClose={() => {
          setAberto(false);
          gatilho.current?.focus();
        }}
      >
        <header>
          <h2 id={titulo}>Fontes da resposta</h2>
          <button
            type="button"
            className="icon-control"
            aria-label="Fechar fontes"
            onClick={() => setAberto(false)}
          >
            <Icon name="fechar" />
          </button>
        </header>
        <ol className="source-list">
          {resposta.fontes.map((f) => (
            <li key={`${f.titulo}-${f.referencia}`}>
              {f.href && (/^\/salas\//.test(f.href) || /^https:\/\//.test(f.href)) ? (
                <a href={f.href} rel="noopener noreferrer" onClick={() => emitirEstudo({ tipo: "fontes" })}>
                  {f.titulo}
                </a>
              ) : (
                <b>{f.titulo}</b>
              )}
              <p>{f.referencia}</p>
            </li>
          ))}
        </ol>
      </dialog>
    </article>
  );
}
