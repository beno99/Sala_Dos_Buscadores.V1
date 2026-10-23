"use client";

import { Fragment, useRef } from "react";
import { blocoVazio, ROTULO_BLOCO, type TipoBloco, tipoDoBloco } from "@/data/corpo";
import type { BlocoCorpo } from "@/data/types";
import { cx } from "@/lib/cx";
import { BarraFormatacao, type FonteCitavel } from "./BarraFormatacao";
import { Button, classesDoBotao } from "./Button";
import { CampoImagem } from "./CampoImagem";
import { CampoTexto } from "./Campos";
import { BlocoDoCorpo } from "./CorpoArtigo";
import { Icon } from "./Icon";
import { Menu } from "./Menu";
import { textoDoBloco, textoSemMarcas } from "./marcacao";
import { useToast } from "./Toast";

type Entrada = HTMLTextAreaElement | HTMLInputElement;

const TIPOS: { tipo: TipoBloco; icon: "artigo" | "editar" | "fontePrimaria" | "imagem" }[] = [
  { tipo: "paragrafo", icon: "artigo" },
  { tipo: "intertitulo", icon: "editar" },
  { tipo: "destaque", icon: "fontePrimaria" },
  { tipo: "imagem", icon: "imagem" },
  { tipo: "lista", icon: "artigo" },
];

function Erro({ id, texto }: { id: string; texto?: string }) {
  if (!texto) return null;
  return (
    <p id={id} className="sdb-error-msg">
      <Icon name="erro" />
      <span>
        <b>Erro:</b> {texto}
      </span>
    </p>
  );
}

interface EditorBlocosProps {
  idBase: string;
  blocos: BlocoCorpo[];
  onChange: (blocos: BlocoCorpo[]) => void;
  /** Erros por campo (`${idBase}-n`, `${idBase}-n-atribuicao`, `-alt`, `-credito`), sem "Erro:". */
  erros?: Record<string, string>;
  /** Erro do corpo inteiro (ex.: falta o texto). */
  erro?: string;
  /** Obras já escolhidas no artigo, para a barra citar ([1], [2]…). */
  fontes?: readonly FonteCitavel[];
  /** Quantos caracteres do lead o card mostra; sem ele, o rodapé do lead não aparece. */
  limiteResumo?: number;
  somenteLeitura?: boolean;
}

/**
 * Editor de texto marcado em blocos (EditorTextoMarcado › em blocos): parágrafo
 * (o primeiro é o lead), intertítulo, destaque e imagem, com "Adicionar" entre
 * os blocos, subir, descer e remover. A pré-visualização usa o mesmo
 * componente da página (BlocoDoCorpo). Não aceita HTML.
 */
export function EditorBlocos({
  idBase,
  blocos,
  onChange,
  erros = {},
  erro,
  fontes,
  limiteResumo,
  somenteLeitura,
}: EditorBlocosProps) {
  const toast = useToast();
  const entradas = useRef<(Entrada | null)[]>([]);
  const focar = (i: number) => requestAnimationFrame(() => entradas.current[i]?.focus());

  const trocar = (i: number, bloco: BlocoCorpo) => onChange(blocos.map((b, j) => (j === i ? bloco : b)));
  const inserir = (depoisDe: number, tipo: TipoBloco) => {
    const nova = [...blocos];
    nova.splice(depoisDe + 1, 0, blocoVazio(tipo));
    onChange(nova);
    focar(depoisDe + 1);
  };
  const mover = (i: number, passo: -1 | 1) => {
    const destino = i + passo;
    if (destino < 0 || destino >= blocos.length) return;
    const nova = [...blocos];
    [nova[i], nova[destino]] = [nova[destino] as BlocoCorpo, nova[i] as BlocoCorpo];
    onChange(nova);
    focar(destino);
  };
  const remover = (i: number) => {
    const nova = blocos.filter((_, j) => j !== i);
    onChange(nova.length ? nova : [""]);
    focar(Math.max(0, i - 1));
  };
  /** Texto do bloco mudado pela barra de formatação (parágrafo ou destaque). */
  const mudarTexto = (i: number, texto: string) => {
    const b = blocos[i];
    if (b === undefined) return;
    if (typeof b !== "string" && b.tipo === "imagem") return;
    trocar(
      i,
      typeof b === "string"
        ? { tipo: "paragrafo", texto }
        : b.tipo === "lista"
          ? { ...b, itens: texto.split("\n") }
          : { ...b, texto },
    );
  };

  const adicionar = (depoisDe: number) => (
    <div className="sdb-editor__insert">
      <Menu
        trigger={
          <>
            <Icon name="mais" size="sm" />
            Adicionar
          </>
        }
        triggerLabel={
          depoisDe < 0 ? "Adicionar bloco no início" : `Adicionar bloco depois do bloco ${depoisDe + 1}`
        }
        triggerClassName={classesDoBotao({ variant: "plain", size: "sm" })}
        titulo="Adicionar"
        items={TIPOS.map(({ tipo, icon }) => ({
          label: ROTULO_BLOCO[tipo],
          icon,
          disabled: somenteLeitura,
          onSelect: () => inserir(depoisDe, tipo),
        }))}
      />
    </div>
  );

  return (
    <div className="sdb-editor sdb-editor--blocos">
      {blocos.map((b, i) => {
        const n = i + 1;
        const id = `${idBase}-${i}`;
        const tipo = tipoDoBloco(b);
        const lead = i === 0 && tipo === "paragrafo";
        const erroPrincipal = erros[id] ?? (i === 0 ? erro : undefined);
        const descritor = erroPrincipal ? `${id}-erro` : undefined;
        const comMarcas = tipo !== "imagem";
        const ref = (el: Entrada | null) => {
          entradas.current[i] = el;
        };
        const barra = comMarcas && (
          <BarraFormatacao
            area={{
              get current() {
                return (entradas.current[i] as HTMLTextAreaElement | null) ?? null;
              },
            }}
            valor={textoDoBloco(b)}
            bloco={
              typeof b === "string" ? { tipo: "paragrafo", texto: b } : b.tipo !== "imagem" ? b : undefined
            }
            onBloco={(bloco) => trocar(i, bloco)}
            onAviso={toast}
            onChange={(texto) => mudarTexto(i, texto)}
            alvo={`bloco ${n}`}
            fontes={fontes}
            desabilitada={somenteLeitura}
          />
        );
        const previa = tipo === "imagem" ? null : <BlocoDoCorpo bloco={b} lead={lead} />;
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: a posição é a identidade do bloco no editor.
          <Fragment key={i}>
            <div className="sdb-editor__block" data-tipo={tipo}>
              <span className="sdb-editor__num" aria-hidden="true">
                {n}
              </span>
              <div className="sdb-editor__main">
                <div className="sdb-editor__bar">
                  <span className="sdb-meta sdb-editor__type">
                    {ROTULO_BLOCO[tipo]}
                    {lead && " · lead"}
                  </span>
                </div>

                {tipo !== "imagem" && (
                  <>
                    <label className="sdb-sr" htmlFor={id}>
                      {tipo === "destaque"
                        ? "Frase do destaque"
                        : tipo === "intertitulo"
                          ? "Intertítulo"
                          : `Bloco ${n}, ${lead ? "parágrafo de abertura (lead)" : ROTULO_BLOCO[tipo].toLowerCase()}`}
                    </label>
                    <div
                      className={cx(
                        "sdb-control sdb-control--area sdb-control--fmt",
                        erroPrincipal && "is-error",
                      )}
                    >
                      {barra}
                      <textarea
                        id={id}
                        ref={ref}
                        rows={3}
                        value={textoDoBloco(b)}
                        readOnly={somenteLeitura}
                        aria-invalid={erroPrincipal ? true : undefined}
                        aria-describedby={[descritor, `${id}-ajuda`].filter(Boolean).join(" ")}
                        onChange={(e) => mudarTexto(i, e.target.value)}
                      />
                    </div>
                    <div className="sdb-field__foot">
                      <p className="sdb-help" id={`${id}-ajuda`}>
                        {lead && limiteResumo !== undefined
                          ? `O card mostra os primeiros ${limiteResumo} caracteres deste parágrafo.`
                          : tipo === "lista"
                            ? "Uma linha por item; voltar a Parágrafo preserva as linhas."
                            : "Selecione um trecho para formatar."}
                      </p>
                      <span className="sdb-counter">
                        {textoSemMarcas(textoDoBloco(b)).length.toLocaleString("pt-BR")} caracteres
                      </span>
                    </div>
                    <Erro id={`${id}-erro`} texto={erroPrincipal} />
                    {typeof b !== "string" && b.tipo === "destaque" && (
                      <CampoTexto
                        id={`${id}-atribuicao`}
                        label="Atribuição"
                        help="Ex.: ::O Caibalion::, cap. II (1908)."
                        value={b.atribuicao}
                        readOnly={somenteLeitura}
                        error={erros[`${id}-atribuicao`]}
                        onChange={(e) => trocar(i, { ...b, atribuicao: e.target.value })}
                      />
                    )}
                  </>
                )}

                {typeof b !== "string" && b.tipo === "imagem" && (
                  <div className="sdb-editor__fields">
                    <CampoImagem
                      id={id}
                      label="Imagem"
                      help="JPEG, PNG ou WebP, até 5 MB. Só domínio público, licença aberta ou imagem sua; nunca gerada por IA."
                      valor={b.src ? { id: b.midia ?? "", url: b.src } : null}
                      disabled={somenteLeitura}
                      onMudar={(img) => {
                        const { midia: _m, ...resto } = b;
                        trocar(i, img ? { ...resto, src: img.url, midia: img.id } : { ...resto, src: "" });
                      }}
                    />
                    <Erro id={`${id}-erro`} texto={erroPrincipal} />
                    <CampoTexto
                      id={`${id}-alt`}
                      label="Texto alternativo"
                      help="Descreva o que a imagem mostra para quem não a vê."
                      value={b.alt}
                      readOnly={somenteLeitura}
                      error={erros[`${id}-alt`]}
                      onChange={(e) => trocar(i, { ...b, alt: e.target.value })}
                    />
                    <CampoTexto
                      id={`${id}-credito`}
                      label="Crédito"
                      help="Autor, obra, data e licença ou domínio público. Atribuição incerta fica incerta."
                      value={b.credito}
                      readOnly={somenteLeitura}
                      error={erros[`${id}-credito`]}
                      onChange={(e) => trocar(i, { ...b, credito: e.target.value })}
                    />
                    <CampoTexto
                      id={`${id}-legenda`}
                      label={
                        <>
                          Legenda <small>opcional</small>
                        </>
                      }
                      value={b.legenda ?? ""}
                      readOnly={somenteLeitura}
                      onChange={(e) => trocar(i, { ...b, legenda: e.target.value })}
                    />
                  </div>
                )}

                {previa && (
                  <div id={`${id}-previa`} className="sdb-editor__preview sdb-editor__preview--bloco">
                    {previa}
                  </div>
                )}
              </div>
              <div className="sdb-editor__tools">
                <Button
                  iconOnly
                  size="sm"
                  aria-label={`Subir bloco ${n}`}
                  disabled={somenteLeitura || i === 0}
                  onClick={() => mover(i, -1)}
                >
                  <Icon name="chevronBaixo" size="sm" className="sdb-editor__up" />
                </Button>
                <Button
                  iconOnly
                  size="sm"
                  icon="chevronBaixo"
                  aria-label={`Descer bloco ${n}`}
                  disabled={somenteLeitura || i === blocos.length - 1}
                  onClick={() => mover(i, 1)}
                />
                <Button
                  iconOnly
                  size="sm"
                  icon="lixeira"
                  aria-label={`Remover bloco ${n}`}
                  disabled={somenteLeitura || (blocos.length === 1 && b === "")}
                  onClick={() => remover(i)}
                />
              </div>
            </div>
            {adicionar(i)}
          </Fragment>
        );
      })}
    </div>
  );
}
