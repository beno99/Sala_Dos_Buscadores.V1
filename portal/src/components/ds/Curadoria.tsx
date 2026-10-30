import type { CSSProperties, ReactNode } from "react";
import type { RegistroAuditoria, StatusEditorial } from "@/data/types";
import { Icon } from "./Icon";

/*
 * Peças pequenas da curadoria: status editorial, checklist, indicador de
 * salvamento, indicador numérico e lista do histórico.
 */

/** Status editorial pelo Badge 1.1: cor semântica, ícone e palavra. */
export function SeloStatus({ status }: { status: StatusEditorial }) {
  if (status === "publicado") {
    return (
      <span className="sdb-badge sdb-badge--published">
        <Icon name="check" size="sm" />
        Publicado
      </span>
    );
  }
  if (status === "rascunho") {
    return (
      <span className="sdb-badge sdb-badge--draft">
        <Icon name="artigo" size="sm" />
        Rascunho
      </span>
    );
  }
  if (status === "em_revisao") {
    return (
      <span className="sdb-badge sdb-badge--review">
        <Icon name="editar" size="sm" />
        Em revisão
      </span>
    );
  }
  if (status === "reprovado") {
    return (
      <span className="sdb-badge sdb-badge--critical">
        <Icon name="devolver" size="sm" />
        Reprovado
      </span>
    );
  }
  return (
    <span className="sdb-badge sdb-badge--archived">
      <Icon name="cadeado" size="sm" />
      Arquivado
    </span>
  );
}

export interface ItemChecklistVisual {
  id: string;
  rotulo: string;
  estado: "ok" | "pendente" | "alerta";
  campo: string;
  ajuda: string;
}

/** Checklist de publicação (ChecklistPublicacao). Cada item leva ao campo. */
export function ChecklistPublicacao({
  titulo = "Para publicar",
  itens,
  acao,
  aoIrParaCampo,
}: {
  titulo?: string;
  itens: ItemChecklistVisual[];
  acao?: ReactNode;
  /** Leva o foco ao campo; sem ela, o link só rola até a âncora. */
  aoIrParaCampo?: (campo: string) => void;
}) {
  const bloqueantes = itens.filter((i) => i.estado !== "alerta");
  const feitos = bloqueantes.filter((i) => i.estado === "ok").length;
  return (
    <section className="sdb-checklist" aria-labelledby="checklist-titulo">
      <div className="sdb-checklist__head">
        <h2 id="checklist-titulo" className="sdb-headline">
          {titulo}
        </h2>
        <span className="sdb-checklist__count">
          {feitos} de {bloqueantes.length}
        </span>
      </div>
      <div className="sdb-checklist__rail" aria-hidden="true">
        <i style={{ "--p": bloqueantes.length ? feitos / bloqueantes.length : 1 } as CSSProperties} />
      </div>
      <ul className="sdb-checklist__list">
        {itens.map((i) => (
          <li key={i.id}>
            <a
              className="sdb-checklist__item"
              data-state={i.estado}
              href={`#${i.campo}`}
              onClick={
                aoIrParaCampo
                  ? (e) => {
                      e.preventDefault();
                      aoIrParaCampo(i.campo);
                    }
                  : undefined
              }
            >
              <span className="sdb-checklist__i" aria-hidden={i.estado === "pendente" ? "true" : undefined}>
                {i.estado === "ok" && <Icon name="check" />}
                {i.estado === "alerta" && <Icon name="aviso" />}
              </span>
              <span>
                {i.estado === "pendente" && <span className="sdb-sr">Pendente: </span>}
                {i.estado === "alerta" && <span className="sdb-sr">Alerta: </span>}
                {i.estado === "ok" && <span className="sdb-sr">Concluído: </span>}
                {i.rotulo}
                {i.estado !== "ok" && <small>{i.ajuda}</small>}
              </span>
            </a>
          </li>
        ))}
      </ul>
      {acao}
    </section>
  );
}

export type EstadoSalvamento = "salvo" | "salvando" | "pendente" | "erro";

const TEXTO_SALVAMENTO: Record<EstadoSalvamento, (hora?: string) => string> = {
  salvo: (hora) => (hora ? `Salvo às ${hora}` : "Salvo"),
  salvando: () => "Salvando…",
  pendente: () => "Alterações não salvas",
  erro: () => "Erro: não foi salvo",
};

/** Indicador de salvamento (IndicadorSalvamento). */
export function IndicadorSalvamento({ estado, hora }: { estado: EstadoSalvamento; hora?: string }) {
  return (
    <span aria-live="polite">
      <span className="sdb-savestate" data-state={estado}>
        <i aria-hidden="true" />
        {TEXTO_SALVAMENTO[estado](hora)}
      </span>
    </span>
  );
}

/** Indicador numérico (IndicadorNumerico) com distribuição opcional em até três partes. */
export function IndicadorNumerico({
  rotulo,
  valor,
  dica,
  partes,
}: {
  rotulo: string;
  valor: number;
  dica?: string;
  partes?: { rotulo: string; valor: number }[];
}) {
  const visiveis = partes?.slice(0, 3) ?? [];
  return (
    <div className="sdb-stat">
      <span className="sdb-stat__label">{rotulo}</span>
      <span className="sdb-stat__value">{valor.toLocaleString("pt-BR")}</span>
      {dica && <p className="sdb-stat__hint">{dica}</p>}
      {visiveis.length > 0 && (
        <>
          <div className="sdb-stat__bar" aria-hidden="true">
            {visiveis
              .filter((p) => p.valor > 0)
              .map((p, i) => (
                <i key={p.rotulo} data-tone={i + 1} style={{ "--n": p.valor } as CSSProperties} />
              ))}
          </div>
          <ul className="sdb-stat__legend">
            {visiveis.map((p, i) => (
              <li key={p.rotulo}>
                <i data-tone={i + 1} aria-hidden="true" />
                {p.rotulo} <b>{p.valor.toLocaleString("pt-BR")}</b>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

const ACAO_ROTULO: Record<RegistroAuditoria["acao"], string> = {
  criou: "Criou",
  editou: "Editou",
  publicou: "Publicou",
  despublicou: "Despublicou",
  arquivou: "Arquivou",
  restaurou: "Restaurou",
  duplicou: "Criou por duplicação",
  excluiu: "Excluiu",
  ocultou: "Ocultou",
  "alterou-proveniencia": "Alterou a proveniência",
  "alterou-situacao-juridica": "Alterou a situação jurídica",
  "restaurou-acervo": "Restaurou o acervo de demonstração",
  "enviou-para-revisao": "Enviou para revisão",
  aprovou: "Aprovou",
  reprovou: "Reprovou",
  promoveu: "Promoveu a anfitrião",
  rebaixou: "Tirou o papel de anfitrião",
  convidou: "Convidou",
  "revogou-convite": "Revogou o convite",
  transferiu: "Transferiu",
  "incluiu-na-comparacao": "Incluiu na comparação",
  "removeu-da-comparacao": "Tirou da comparação",
  "editou-perfil": "Editou o perfil",
};

export const rotuloAcao = (a: RegistroAuditoria["acao"]) => ACAO_ROTULO[a];

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function dataDoRegistro(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

function horaDoRegistro(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/**
 * Histórico (RNF-04) na lista da LinhaDoTempo: agrupado por dia, com o
 * marcador cheio para mudança de status e vazado para edição. Só leitura.
 */
export function ListaHistorico({
  registros,
  mostrarItem = true,
  vazio = "Nenhuma ação registrada ainda.",
}: {
  registros: RegistroAuditoria[];
  mostrarItem?: boolean;
  vazio?: string;
}) {
  if (registros.length === 0) return <p className="sdb-hint">{vazio}</p>;
  const grupos = new Map<string, RegistroAuditoria[]>();
  for (const r of registros) {
    const dia = dataDoRegistro(r.quando);
    grupos.set(dia, [...(grupos.get(dia) ?? []), r]);
  }
  const deStatus = new Set(["publicou", "despublicou", "arquivou", "restaurou", "restaurou-acervo"]);
  return (
    <div className="sdb-list">
      {[...grupos.entries()].map(([dia, lista]) => (
        <section key={dia} aria-label={dia}>
          <h3 className="sdb-period m-0">{dia}</h3>
          <ol className="sdb-event-list">
            {lista.map((r) => (
              <li key={r.id} className="sdb-event-row cursor-default">
                <i className={deStatus.has(r.acao) ? undefined : "is-event"} aria-hidden="true" />
                <span className="sdb-tabular">
                  <time dateTime={r.quando}>{horaDoRegistro(r.quando)}</time>
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span>
                    <b>{rotuloAcao(r.acao)}</b>
                    {mostrarItem && r.tipoItem !== "acervo" && <> · {r.itemTitulo}</>} · {r.quem}
                  </span>
                  {r.mudancas && r.mudancas.length > 0 && (
                    <span className="sdb-footnote">
                      {r.mudancas
                        .map((m) => `${m.campo}: ${m.antes || "—"} → ${m.depois || "—"}`)
                        .join(" · ")}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
