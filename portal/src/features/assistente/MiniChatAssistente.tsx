"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { AvisoNeutralidade } from "@/components/ds/AvisoNeutralidade";
import { PausarOrbe } from "@/components/ds/OrbeAssistente";
import { useConversa } from "./ConversaProvider";
import { MensagemAssistente } from "./MensagemAssistente";

const SUGESTOES = ["O que é o Pleroma?", "Como descrevem a alma?", "Uma leitura do Poimandres."];

/**
 * Mini chat do assistente (BotaoFlutuante 1.0), aberto pelo orbe sobre
 * qualquer página. A conversa é a mesma da tela cheia (ConversaProvider), e
 * cada resposta é uma Mensagem do assistente completa: identificada como IA,
 * com trecho documental, interpretação editorial e síntese separados e fontes
 * numeradas (RF-27 a RF-30). Usa popover nativo (Esc e clique fora fecham);
 * sem suporte, abre e fecha pelo estado `aberto`.
 */
export function MiniChatAssistente({
  id,
  aberto,
  acimaDaBarra,
  pausado,
  onAbrir,
  onFechar,
  onPausar,
}: {
  id: string;
  aberto: boolean;
  acimaDaBarra?: boolean;
  pausado: boolean;
  onAbrir: () => void;
  onFechar: () => void;
  onPausar: () => void;
}) {
  const { turnos, gerando, perguntar, gerarNovamente, interromper } = useConversa();
  const painel = useRef<HTMLElement>(null);
  const campo = useRef<HTMLTextAreaElement>(null);
  const rolagem = useRef<HTMLDivElement>(null);
  const [valor, setValor] = useState("");
  const [nativo, setNativo] = useState(false);

  useEffect(() => setNativo("showPopover" in HTMLElement.prototype), []);

  // O estado da moldura manda: abre e fecha o popover quando `aberto` muda.
  useEffect(() => {
    const el = painel.current;
    if (!el || !nativo) return;
    const estaAberto = el.matches(":popover-open");
    if (aberto && !estaAberto) el.showPopover();
    if (!aberto && estaAberto) el.hidePopover();
  }, [aberto, nativo]);

  // E o navegador avisa quando o orbe, o Esc ou um clique fora mudaram o popover.
  useEffect(() => {
    const el = painel.current;
    if (!el) return;
    const aoAlternar = (e: Event) => {
      const novo = (e as ToggleEvent).newState;
      if (novo === "open") {
        onAbrir();
        campo.current?.focus({ preventScroll: true });
      } else onFechar();
    };
    el.addEventListener("toggle", aoAlternar);
    return () => el.removeEventListener("toggle", aoAlternar);
  }, [onAbrir, onFechar]);

  // Sem popover nativo: Esc fecha.
  useEffect(() => {
    if (nativo || !aberto) return;
    campo.current?.focus({ preventScroll: true });
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [nativo, aberto, onFechar]);

  const ultimo = turnos.at(-1);
  // biome-ignore lint/correctness/useExhaustiveDependencies: rola quando chega um turno novo ou muda o estado do último.
  useEffect(() => {
    const r = rolagem.current;
    if (r) r.scrollTop = r.scrollHeight;
  }, [turnos.length, ultimo?.estado]);

  const enviar = async (e?: FormEvent) => {
    e?.preventDefault();
    const pergunta = valor.trim().slice(0, 2000);
    if (!pergunta || gerando) return;
    setValor("");
    const estado = await perguntar(pergunta, "todo");
    if (estado === "interrompida" || estado === "erro") setValor((atual) => atual || pergunta);
  };

  return (
    <section
      ref={painel}
      id={id}
      className={`assistant-chat${acimaDaBarra ? " assistant-chat--acima-da-barra" : ""}`}
      popover="auto"
      role="dialog"
      aria-modal="false"
      aria-labelledby={`${id}-titulo`}
      hidden={!nativo && !aberto}
      data-fallback-open={!nativo && aberto ? "true" : undefined}
    >
      <header className="assistant-chat__header">
        <div className="assistant-chat__identity">
          <span className="assistant-chat__spark" aria-hidden="true" />
          <div>
            <h2 id={`${id}-titulo`}>Assistente de IA</h2>
            <p>Serviço de IA ainda não conectado</p>
          </div>
        </div>
        <Link className="sdb-link px-2" style={{ fontSize: 12 }} href="/assistente" onClick={onFechar}>
          Tela cheia
        </Link>
        <button
          className="assistant-chat__icon"
          type="button"
          aria-label="Fechar assistente"
          onClick={onFechar}
        >
          <svg viewBox="0 0 256 256" aria-hidden="true">
            <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
          </svg>
        </button>
      </header>

      <div className="assistant-chat__scroll" ref={rolagem}>
        {turnos.length === 0 ? (
          <div className="assistant-chat__welcome">
            <h3>
              Por onde começa
              <br />a sua busca?
            </h3>
            <p>
              Cada resposta separa o trecho documental, a interpretação editorial e a síntese da IA, e numera
              as fontes. Quando as tradições divergem, as diferenças ficam à vista.
            </p>
            <div className="assistant-chat__suggestions" role="group" aria-label="Sugestões de perguntas">
              {SUGESTOES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setValor(s);
                    campo.current?.focus();
                  }}
                >
                  {s}
                  <svg viewBox="0 0 256 256" aria-hidden="true">
                    <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="assistant-chat__log" aria-live="off">
            {turnos.map((t) => {
              return (
                <div key={t.id} className="flex flex-col gap-4">
                  <p className="sdb-bubble">{t.pergunta}</p>
                  {t.estado === "concluida" && t.resposta ? (
                    <MensagemAssistente
                      resposta={t.resposta}
                      duracaoMs={(t.fim ?? t.inicio) - t.inicio}
                      gerando={gerando}
                      onGerarNovamente={() => gerarNovamente(t.id)}
                    />
                  ) : (
                    <p className="sdb-footnote" role={t.estado === "erro" ? "alert" : "status"}>
                      {t.estado === "erro"
                        ? t.erro
                        : t.estado === "interrompida"
                          ? "Consulta interrompida. Sua pergunta foi preservada."
                          : "Aguardando o serviço do acervo…"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="assistant-chat__bottom">
        <form className="assistant-chat__composer" onSubmit={enviar}>
          <label className="sdb-sr" htmlFor={`${id}-pergunta`}>
            Sua pergunta ao acervo
          </label>
          <textarea
            ref={campo}
            id={`${id}-pergunta`}
            placeholder="Pergunte ao acervo…"
            maxLength={2000}
            rows={2}
            enterKeyHint="send"
            value={valor}
            readOnly={gerando}
            onChange={(e) => setValor(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing &&
                e.keyCode !== 229 &&
                window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)").matches
              ) {
                e.preventDefault();
                void enviar();
              }
            }}
          />
          {gerando ? (
            <button
              className="assistant-chat__send"
              type="button"
              aria-label="Interromper a consulta"
              onClick={interromper}
            >
              <svg viewBox="0 0 256 256" aria-hidden="true">
                <path d="M216,56V200a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V56A16,16,0,0,1,56,40H200A16,16,0,0,1,216,56Z" />
              </svg>
            </button>
          ) : (
            <button
              className="assistant-chat__send"
              type="submit"
              aria-label="Enviar pergunta"
              disabled={!valor.trim()}
            >
              <svg viewBox="0 0 256 256" aria-hidden="true">
                <path d="M205.66,117.66a8,8,0,0,1-11.32,0L136,59.31V216a8,8,0,0,1-16,0V59.31L61.66,117.66a8,8,0,0,1-11.32-11.32l72-72a8,8,0,0,1,11.32,0l72,72A8,8,0,0,1,205.66,117.66Z" />
              </svg>
            </button>
          )}
        </form>
        {/* Fixo até a primeira resposta; depois, cada Mensagem do assistente traz o seu aviso. */}
        {turnos.length === 0 && <AvisoNeutralidade variante="discreto" />}
        <div className="assistant-chat__motion">
          <PausarOrbe pausado={pausado} onAlternar={onPausar} />
        </div>
      </div>
    </section>
  );
}
