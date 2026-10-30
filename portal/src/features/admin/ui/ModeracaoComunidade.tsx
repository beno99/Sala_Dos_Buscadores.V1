"use client";
import { useState } from "react";
import { Button } from "@/components/ds/Button";
import { AreaTexto } from "@/components/ds/CamposExtras";
import { EstadoSecao } from "@/components/ds/EstadosInterface";
import { ModalConfirmacao } from "@/components/ds/Modal";
import { useAcaoComunidade } from "@/features/comunidade/ui/useAcaoComunidade";
import { formatarData } from "@/lib/texto";
import { decidirDenunciaAcao, moderarAcao } from "@/server/comunidade/acoes";
import type { FilaDeModeracao } from "@/server/comunidade/moderacao";

type Decisao =
  | { tipo: "procedente" | "improcedente"; id: string }
  | { tipo: "restaurar"; alvo: FilaDeModeracao["ocultos"][number]["alvo"] };

const TITULOS = {
  procedente: "Ocultar o item denunciado",
  improcedente: "Manter o item visível",
  restaurar: "Restaurar o item",
};

export function ModeracaoComunidade({ fila }: { fila: FilaDeModeracao }) {
  const { pendente, executar } = useAcaoComunidade();
  const [decisao, setDecisao] = useState<Decisao | null>(null);
  const [motivo, setMotivo] = useState("");
  const fechar = () => {
    setDecisao(null);
    setMotivo("");
  };
  const confirmar = () => {
    if (!decisao || !motivo.trim()) return;
    executar(
      () =>
        decisao.tipo === "restaurar"
          ? moderarAcao(decisao.alvo, "visivel", motivo)
          : decidirDenunciaAcao(decisao.id, decisao.tipo, motivo),
      undefined,
      fechar,
    );
  };
  return (
    <>
      <section className="flex flex-col gap-4" aria-labelledby="titulo-denuncias">
        <h2 id="titulo-denuncias" className="sdb-title-2">
          Denúncias pendentes
        </h2>
        {fila.pendentes.map((d) => (
          <article key={d.id} className="sdb-card">
            <div className="sdb-card__body flex flex-col gap-3">
              <p className="sdb-footnote">
                {d.rotulo} de {d.autor} · denunciada por {d.denunciante} em {formatarData(d.criadaEm)}
              </p>
              <p className="sdb-body-sm">{d.texto}</p>
              <p className="sdb-footnote">
                <b>{d.motivo}</b>
                {d.nota && ` · ${d.nota}`}
              </p>
              <div className="sdb-row">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setDecisao({ tipo: "procedente", id: d.id })}
                >
                  Ocultar
                </Button>
                <Button
                  variant="plain"
                  size="sm"
                  onClick={() => setDecisao({ tipo: "improcedente", id: d.id })}
                >
                  Manter visível
                </Button>
                <a className="sdb-link" href={d.href}>
                  Abrir publicação
                </a>
              </div>
            </div>
          </article>
        ))}
        {!fila.pendentes.length && (
          <EstadoSecao
            compacto
            simbolo="livro"
            titulo="Nenhuma denúncia pendente"
            descricao="As denúncias enviadas pelos buscadores aparecem aqui."
          />
        )}
      </section>
      <section className="flex flex-col gap-4" aria-labelledby="titulo-ocultos">
        <h2 id="titulo-ocultos" className="sdb-title-2">
          Itens ocultos
        </h2>
        {fila.ocultos.map((o) => (
          <article key={o.alvo.id} className="sdb-card">
            <div className="sdb-card__body flex flex-col gap-3">
              <p className="sdb-footnote">
                {o.rotulo} de {o.autor}
              </p>
              <p className="sdb-body-sm">{o.texto}</p>
              <div className="sdb-row">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setDecisao({ tipo: "restaurar", alvo: o.alvo })}
                >
                  Restaurar
                </Button>
              </div>
            </div>
          </article>
        ))}
        {!fila.ocultos.length && <p className="sdb-footnote">Nenhum item oculto.</p>}
      </section>
      <ModalConfirmacao
        open={decisao !== null}
        titulo={decisao ? TITULOS[decisao.tipo] : ""}
        rotuloConfirmar="Confirmar"
        carregando={pendente}
        onConfirmar={confirmar}
        onCancelar={fechar}
      >
        <AreaTexto
          label="Motivo registrado"
          rows={3}
          required
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />
      </ModalConfirmacao>
    </>
  );
}
