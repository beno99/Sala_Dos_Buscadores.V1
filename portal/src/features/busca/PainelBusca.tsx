"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  Fragment,
  type KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Arc } from "@/components/ds/Arc";
import { Button } from "@/components/ds/Button";
import { Icon, type IconName } from "@/components/ds/Icon";
import { Segmented } from "@/components/ds/Segmented";
import { useFocoPreso } from "@/components/ds/useFocoPreso";
import { cx } from "@/lib/cx";
import { FILTROS_VAZIOS, type ModoBusca, paraQueryString } from "./busca";
import { type ConteudoBuscavel, type Sugestao, sugerir } from "./sugestoes";

const ICONE: Record<Sugestao["tipo"], IconName | null> = {
  tema: "comparar",
  sala: null,
  assistente: "assistente",
  artigo: "artigo",
  "fonte-primaria": "fontePrimaria",
  verbete: "glossario",
  video: "video",
};

/**
 * Painel de busca (PainelBusca): Barra de busca no topo da tela com
 * sugestões ao vivo. Sem animação, como o Command palette. ↑ ↓ escolhem uma
 * sugestão, ↵ abre a escolhida ou compara o texto, esc fecha.
 */
export function PainelBusca({
  aberto,
  onFechar,
  conteudos,
}: {
  aberto: boolean;
  onFechar: () => void;
  conteudos: ConteudoBuscavel[];
}) {
  const router = useRouter();
  const id = useId();
  const painel = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const anterior = useRef<HTMLElement | null>(null);
  const [modo, setModo] = useState<ModoBusca>("tema");
  const [texto, setTexto] = useState("");
  const [ativa, setAtiva] = useState(-1);
  const [erro, setErro] = useState<string | null>(null);
  const lista = useMemo(() => sugerir(texto, modo, conteudos), [texto, modo, conteudos]);
  useFocoPreso(painel, aberto);

  useEffect(() => {
    if (!aberto) return;
    anterior.current = document.activeElement as HTMLElement | null;
    setTexto("");
    setAtiva(-1);
    setErro(null);
    const t = setTimeout(() => campo.current?.focus(), 0);
    return () => {
      clearTimeout(t);
      anterior.current?.focus?.();
    };
  }, [aberto]);

  const ir = (href: string) => {
    onFechar();
    router.push(href as Route);
  };

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const sugestao = lista[ativa];
    if (sugestao) return ir(sugestao.href);
    const q = texto.trim();
    if (!q) {
      setErro("Erro: escreva um tema, uma Sala ou uma pergunta, ou escolha uma sugestão.");
      campo.current?.focus();
      return;
    }
    ir(`/comparar${paraQueryString({ ...FILTROS_VAZIOS, q, modo })}`);
  };

  const teclado = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onFechar();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (lista.length === 0) return;
      // -1 é o próprio campo: as setas circulam campo → sugestões → campo.
      const ultimo = lista.length - 1;
      setAtiva((a) => (e.key === "ArrowDown" ? (a >= ultimo ? -1 : a + 1) : a <= -1 ? ultimo : a - 1));
    }
  };

  useEffect(() => {
    if (ativa >= lista.length) setAtiva(-1);
    document.getElementById(`${id}-op-${ativa}`)?.scrollIntoView({ block: "nearest" });
  }, [ativa, lista.length, id]);

  return (
    <div
      className={cx("sdb-overlay sdb-overlay--top", aberto && "is-open")}
      aria-hidden={!aberto}
      inert={!aberto}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onFechar();
      }}
    >
      <div
        ref={painel}
        className="sdb-searchpanel"
        role="dialog"
        aria-modal="true"
        aria-label="Buscar no acervo"
      >
        <form className={cx("sdb-searchbar", erro && "is-error")} role="search" noValidate onSubmit={enviar}>
          <div className="sdb-row sdb-row--between" style={{ padding: "2px 2px 0" }}>
            <Segmented<ModoBusca>
              label="Modo de busca"
              value={modo}
              onChange={(m) => {
                setModo(m);
                setAtiva(-1);
              }}
              options={[
                { value: "sala", label: "Por Sala" },
                { value: "tema", label: "Por tema ou pergunta" },
              ]}
            />
            <Button variant="plain" size="sm" onClick={onFechar}>
              Fechar <span className="sdb-kbd">esc</span>
            </Button>
          </div>
          <div className="sdb-searchbar__row">
            <Icon name="busca" />
            <label className="sdb-sr" htmlFor={`${id}-campo`}>
              Buscar no acervo
            </label>
            <input
              ref={campo}
              id={`${id}-campo`}
              type="text"
              autoComplete="off"
              enterKeyHint="search"
              role="combobox"
              aria-expanded={lista.length > 0}
              aria-controls={`${id}-lista`}
              aria-activedescendant={ativa >= 0 ? `${id}-op-${ativa}` : undefined}
              aria-describedby={`${id}-msg`}
              aria-invalid={erro ? true : undefined}
              placeholder={modo === "tema" ? "Um tema, uma Sala ou uma pergunta" : "Nome de uma Sala"}
              value={texto}
              onChange={(e) => {
                setTexto(e.target.value);
                setAtiva(-1);
                setErro(null);
              }}
              onKeyDown={teclado}
            />
            <Button variant="primary" type="submit">
              Comparar
            </Button>
          </div>
        </form>
        <p id={`${id}-msg`} className="sdb-sr" aria-live="polite">
          {erro ?? `${lista.length} sugestões.`}
        </p>
        {erro && (
          <p className="sdb-error-msg" role="alert">
            <Icon name="erro" />
            <span>{erro}</span>
          </p>
        )}

        <div className="sdb-searchpanel__results" id={`${id}-lista`} role="listbox" aria-label="Sugestões">
          {lista.map((s, i) => (
            <Fragment key={s.id}>
              {s.grupo !== lista[i - 1]?.grupo && (
                <div className="sdb-palette__group" role="presentation">
                  {s.grupo}
                </div>
              )}
              <Link
                id={`${id}-op-${i}`}
                href={s.href as Route}
                className="sdb-palette__item"
                role="option"
                aria-selected={i === ativa}
                tabIndex={-1}
                onClick={onFechar}
                onPointerMove={() => setAtiva(i)}
              >
                <span className="sdb-palette__lead">
                  {ICONE[s.tipo] ? <Icon name={ICONE[s.tipo] as IconName} /> : <Arc />}
                </span>
                <span>
                  {s.rotulo}
                  {s.detalhe && <small> · {s.detalhe}</small>}
                </span>
                {i === ativa && (
                  <span className="sdb-kbd" aria-hidden="true">
                    ↵
                  </span>
                )}
              </Link>
            </Fragment>
          ))}
          <div className="sdb-searchpanel__foot" aria-hidden="true">
            <span>
              <span className="sdb-kbd">↑</span>
              <span className="sdb-kbd">↓</span> escolher
            </span>
            <span>
              <span className="sdb-kbd">↵</span> abrir ou comparar
            </span>
            <span>
              <span className="sdb-kbd">esc</span> fechar
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
