"use client";

import { useEffect, useId, useRef, useState } from "react";
import { EsferaAssistente } from "@/components/ds/EsferaAssistente";
import { Icon, type IconName } from "@/components/ds/Icon";
import { RespostaEstudo } from "@/components/ds/RespostaEstudo";
import { useConversa } from "./ConversaProvider";
import { type AparenciaEsfera, MODOS_ESTUDO, type ModoEstudo } from "./contrato";
import type { Escopo } from "./motor";

const SUGESTOES: { titulo: string; pergunta: string; modo: ModoEstudo; sala: string; icone: IconName }[] = [
  {
    titulo: "Entender um conceito",
    pergunta: "O que é o Pleroma?",
    modo: "explorar",
    sala: "nag-hammadi",
    icone: "glossario",
  },
  {
    titulo: "Comparar tradições",
    pergunta: "Como descrevem a alma?",
    modo: "comparar",
    sala: "todo",
    icone: "comparar",
  },
  {
    titulo: "Explorar um texto",
    pergunta: "Uma leitura do Poimandres.",
    modo: "leitura",
    sala: "corpus-hermeticum",
    icone: "fontePrimaria",
  },
];
export interface TelaAssistenteProps {
  salas: { slug: string; nome: string }[];
  perguntaInicial?: string;
  escopoInicial?: Escopo;
  modoInicial?: ModoEstudo;
  aparenciaInicial?: AparenciaEsfera;
}

export function TelaAssistente({
  salas,
  perguntaInicial = "",
  escopoInicial = "todo",
  modoInicial = "explorar",
  aparenciaInicial,
}: TelaAssistenteProps) {
  const {
    turnos,
    gerando,
    perguntar,
    gerarNovamente,
    interromper,
    novaConversa,
    aparencia,
    setAparencia,
    pausado,
  } = useConversa();
  const [valor, setValor] = useState(perguntaInicial);
  const [modo, setModo] = useState<ModoEstudo>(modoInicial);
  const [escopo, setEscopo] = useState<Escopo>(escopoInicial);
  const campo = useRef<HTMLTextAreaElement>(null);
  const fim = useRef<HTMLDivElement>(null);
  const sessao = useRef(0);
  const compondo = useRef(false);
  const id = useId();
  const ultimo = turnos.at(-1);
  useEffect(() => {
    if (aparenciaInicial) setAparencia(aparenciaInicial);
  }, [aparenciaInicial, setAparencia]);
  // Invalida continuations antigas também ao desmontar/navegar.
  useEffect(
    () => () => {
      sessao.current += 1;
    },
    [],
  );
  // biome-ignore lint/correctness/useExhaustiveDependencies: rola só ao mudar um turno, nunca a cada tecla.
  useEffect(() => {
    if (turnos.length) fim.current?.scrollIntoView({ block: "center", behavior: "instant" });
  }, [turnos.length, ultimo?.estado]);
  const enviar = async () => {
    const pergunta = valor.trim();
    if (!pergunta || gerando || compondo.current) return;
    const atual = sessao.current;
    // Conserva o rascunho enquanto envia: erro/interrupção não dependem de restaurá-lo.
    const estado = await perguntar(pergunta, escopo, modo);
    if (atual === sessao.current && estado === "concluida") setValor((v) => (v.trim() === pergunta ? "" : v));
  };
  const limpar = () => {
    sessao.current += 1;
    novaConversa();
    setValor("");
    campo.current?.focus();
  };
  const salaNome = (slug: string) =>
    slug === "todo" ? "Todo o acervo" : (salas.find((s) => s.slug === slug)?.nome ?? "Sala indisponível");
  return (
    <div className={`workspace${turnos.length ? " is-chat" : ""}`} data-orb={aparencia}>
      <nav className="session-nav" aria-label="Conversa atual">
        <span>Conversa desta sessão</span>
        <button type="button" className="sdb-btn sdb-btn--secondary sdb-btn--sm" onClick={limpar}>
          <Icon name="mais" />
          Nova conversa
        </button>
      </nav>
      {turnos.length === 0 ? (
        <section className="welcome" aria-labelledby={`${id}-titulo`}>
          <EsferaAssistente
            aparencia={aparencia}
            pausado={pausado}
            onPerguntar={() => campo.current?.focus()}
          />
          <p className="eyebrow">UM ACERVO. MUITAS PERSPECTIVAS.</p>
          <h1 id={`${id}-titulo`}>
            O que você quer
            <br />
            <em>compreender hoje?</em>
          </h1>
          <p className="welcome-description">Explore o acervo, conecte ideias e siga as fontes.</p>
        </section>
      ) : (
        <section className="conversation" aria-label="Conversa de estudo">
          <header className="conversation-heading">
            <div>
              <p className="eyebrow">ASSISTENTE DO ACERVO</p>
              <h1>Uma pergunta, novos caminhos.</h1>
            </div>
          </header>
          <div className="study-messages" aria-busy={gerando}>
            {turnos.map((t) => (
              <div key={t.id} className="study-turn">
                <p className="question-bubble">{t.pergunta}</p>
                <p className="answer-context">
                  {MODOS_ESTUDO[t.modo].nome} · {salaNome(t.escopo)}
                </p>
                {t.estado === "concluida" && t.resposta ? (
                  <RespostaEstudo resposta={t.resposta} />
                ) : (
                  <div className="answer">
                    <p className="answer-body" role={t.estado === "erro" ? "alert" : "status"}>
                      {t.estado === "consultando"
                        ? "Aguardando o serviço do acervo…"
                        : t.estado === "interrompida"
                          ? "Consulta interrompida. Sua pergunta foi mantida no campo."
                          : t.erro}
                    </p>
                    {(t.estado === "erro" || t.estado === "interrompida") && (
                      <div className="answer-actions">
                        <button
                          type="button"
                          disabled={gerando}
                          className="sdb-btn sdb-btn--secondary sdb-btn--sm"
                          onClick={() => {
                            setValor(t.pergunta);
                            setModo(t.modo);
                            setEscopo(t.escopo);
                            const atual = sessao.current;
                            void gerarNovamente(t.id).then((estado) => {
                              if (atual === sessao.current && estado === "concluida")
                                setValor((v) => (v === t.pergunta ? "" : v));
                            });
                          }}
                        >
                          Tentar novamente
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div ref={fim} />
        </section>
      )}
      <div className="writing-area">
        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault();
            void enviar();
          }}
        >
          <label className="sdb-sr" htmlFor={`${id}-pergunta`}>
            Sua pergunta ao acervo
          </label>
          <textarea
            ref={campo}
            id={`${id}-pergunta`}
            rows={2}
            maxLength={2000}
            placeholder="Toda busca começa com uma pergunta…"
            value={valor}
            readOnly={gerando}
            onChange={(e) => setValor(e.target.value)}
            onCompositionStart={() => {
              compondo.current = true;
            }}
            onCompositionEnd={() => {
              compondo.current = false;
            }}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing &&
                !compondo.current &&
                e.keyCode !== 229 &&
                window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)").matches
              ) {
                e.preventDefault();
                void enviar();
              }
            }}
          />
          <div className="composer-bar">
            <label className="context-control">
              <Icon name="glossario" />
              <span className="sdb-sr">Modo de estudo</span>
              <select
                value={modo}
                onChange={(e) => setModo(e.target.value as ModoEstudo)}
                aria-describedby={`${id}-modo`}
              >
                {Object.entries(MODOS_ESTUDO).map(([chave, m]) => (
                  <option key={chave} value={chave}>
                    {m.nome}
                  </option>
                ))}
              </select>
              <Icon name="chevronBaixo" className="chevron" />
            </label>
            <span className="context-separator" aria-hidden="true" />
            <label className="context-control context-control--scope">
              <Icon name="salas" />
              <span className="sdb-sr">Sala de estudo</span>
              <select value={escopo} onChange={(e) => setEscopo(e.target.value)}>
                <option value="todo">Todo o acervo</option>
                {salas.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.nome}
                  </option>
                ))}
              </select>
              <Icon name="chevronBaixo" className="chevron" />
            </label>
            {gerando ? (
              <button
                type="button"
                className="sdb-btn sdb-btn--gold sdb-btn--icon send"
                aria-label="Interromper a consulta"
                onClick={interromper}
              >
                <Icon name="parar" />
              </button>
            ) : (
              <button
                type="submit"
                className="sdb-btn sdb-btn--gold sdb-btn--icon send"
                aria-label="Enviar pergunta"
                disabled={!valor.trim()}
              >
                <Icon name="enviar" />
              </button>
            )}
          </div>
        </form>
        <div className="composer-caption">
          <p id={`${id}-modo`}>{MODOS_ESTUDO[modo].descricao}</p>
          <span className="keyboard-hint">Enter envia · Shift+Enter quebra linha</span>
        </div>
      </div>
      {turnos.length === 0 && (
        <section className="suggestions" aria-labelledby={`${id}-sugestoes`}>
          <h2 id={`${id}-sugestoes`}>POR ONDE COMEÇAR</h2>
          <div className="suggestion-grid">
            {SUGESTOES.map((s) => (
              <button
                key={s.titulo}
                type="button"
                className="suggestion"
                onClick={() => {
                  setValor(s.pergunta);
                  setModo(s.modo);
                  setEscopo(salas.some((sala) => sala.slug === s.sala) ? s.sala : "todo");
                  campo.current?.focus();
                }}
              >
                <Icon name={s.icone} className="suggestion-icon" />
                <b>{s.titulo}</b>
                <span>{s.pergunta}</span>
                <span className="suggestion-arrow" aria-hidden="true">
                  ↗
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
      <footer className="assistant-note">
        <Icon name="fontePrimaria" />
        <p>
          A IA organiza o que o acervo diz; não determina qual crença é verdadeira.
          <br />
          <span>IA ainda não conectada. Histórico entre visitas ainda não disponível.</span>
        </p>
      </footer>
    </div>
  );
}
