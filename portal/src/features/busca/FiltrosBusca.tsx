"use client";

import { AccordionItem } from "@/components/ds/Accordion";
import { Button } from "@/components/ds/Button";
import { Chip, ChipRemovivel } from "@/components/ds/Chip";
import { Icon } from "@/components/ds/Icon";
import { Segmented } from "@/components/ds/Segmented";
import { todasAsSalas, todosOsTemas } from "@/data/catalogo";
import { NIVEL_ROTULO } from "@/data/rotulos";
import type { Formato, Nivel } from "@/data/types";
import {
  type AcervoBusca,
  buscar,
  contarFacetas,
  contarFiltrosAtivos,
  FILTROS_VAZIOS,
  type FiltrosBusca,
  filtrosAtivos,
} from "./busca";

type FormatoOpcao = "todos" | Formato;

function alternar<T>(lista: T[], valor: T): T[] {
  return lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor];
}

function Opcao({
  rotulo,
  contagem,
  marcado,
  onClick,
}: {
  rotulo: string;
  contagem: number;
  marcado: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className="sdb-option" aria-pressed={marcado} onClick={onClick}>
      <span>{rotulo}</span>
      <span className="sdb-option__n">{contagem}</span>
      <Icon name="check" className="sdb-option__check" />
    </button>
  );
}

interface FiltrosPainelProps {
  rascunho: FiltrosBusca;
  acervo: AcervoBusca;
  onChange: (f: FiltrosBusca) => void;
}

/**
 * Conteúdo dos Filtros de busca (FiltrosBusca, RF-20): Sala, tema, nível e
 * formato, com contagens que consideram os demais filtros.
 */
export function FiltrosPainel({ rascunho, acervo, onChange }: FiltrosPainelProps) {
  const facetas = contarFacetas(rascunho, acervo);
  const ativos = filtrosAtivos(rascunho);

  return (
    <>
      <div className="sdb-filters__active" aria-live="polite">
        {ativos.length === 0 ? (
          <span className="sdb-footnote">Nenhum filtro ativo.</span>
        ) : (
          ativos.map((a) => (
            <ChipRemovivel key={a.rotulo} rotulo={a.rotulo} onRemove={() => onChange(a.remover(rascunho))} />
          ))
        )}
      </div>
      <div className="sdb-list">
        <AccordionItem title="Sala" defaultOpen>
          {todasAsSalas().map((s) => (
            <Opcao
              key={s.slug}
              rotulo={s.nome}
              contagem={facetas.salas.get(s.slug) ?? 0}
              marcado={rascunho.salas.includes(s.slug)}
              onClick={() => onChange({ ...rascunho, salas: alternar(rascunho.salas, s.slug) })}
            />
          ))}
        </AccordionItem>
        <AccordionItem
          title="Tema"
          defaultOpen
          bodyClassName="sdb-row"
          bodyStyle={{ gap: 8, padding: "0 18px 16px" }}
        >
          {todosOsTemas().map((t) => {
            const n = facetas.temas.get(t.slug) ?? 0;
            const marcado = rascunho.temas.includes(t.slug);
            return (
              <Chip
                key={t.slug}
                small
                pressed={marcado}
                disabled={n === 0 && !marcado}
                onClick={() => onChange({ ...rascunho, temas: alternar(rascunho.temas, t.slug) })}
              >
                {t.nome}
              </Chip>
            );
          })}
        </AccordionItem>
        <AccordionItem title="Nível">
          {([1, 2, 3] as Nivel[]).map((n) => (
            <Opcao
              key={n}
              rotulo={NIVEL_ROTULO[n]}
              contagem={facetas.niveis.get(`${n}`) ?? 0}
              marcado={rascunho.niveis.includes(n)}
              onClick={() => onChange({ ...rascunho, niveis: alternar(rascunho.niveis, n) })}
            />
          ))}
        </AccordionItem>
      </div>
      <div className="sdb-spec" style={{ gap: 8 }}>
        <span className="sdb-caption">Formato</span>
        <Segmented<FormatoOpcao>
          label="Formato"
          block
          value={rascunho.formato ?? "todos"}
          onChange={(v) => onChange({ ...rascunho, formato: v === "todos" ? null : v })}
          options={[
            { value: "todos", label: "Todos" },
            { value: "texto", label: "Texto", count: facetas.formato.get("texto") ?? 0 },
            { value: "video", label: "Vídeo", count: facetas.formato.get("video") ?? 0 },
          ]}
        />
      </div>
    </>
  );
}

/** Painel lateral (desktop) dos filtros, com "Limpar" e botão com contagem ao vivo. */
export function FiltrosBuscaPainel({
  rascunho,
  acervo,
  onChange,
  onAplicar,
}: FiltrosPainelProps & { onAplicar: () => void }) {
  const total = buscar(rascunho, acervo).itens.length;
  return (
    <section className="sdb-filters" aria-labelledby="filtros-titulo">
      <div className="sdb-row sdb-row--between">
        <h2 id="filtros-titulo" className="sdb-headline" style={{ fontSize: 20 }}>
          Filtros
        </h2>
        <Button
          variant="plain"
          size="sm"
          disabled={contarFiltrosAtivos(rascunho) === 0}
          onClick={() => onChange({ ...FILTROS_VAZIOS, q: rascunho.q, modo: rascunho.modo })}
        >
          Limpar
        </Button>
      </div>
      <FiltrosPainel rascunho={rascunho} acervo={acervo} onChange={onChange} />
      <Button variant="primary" size="lg" block onClick={onAplicar}>
        {total === 1 ? "Ver 1 resultado" : `Ver ${total} resultados`}
      </Button>
    </section>
  );
}
