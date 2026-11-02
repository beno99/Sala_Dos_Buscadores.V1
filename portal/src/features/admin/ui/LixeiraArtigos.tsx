"use client";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Breadcrumbs } from "@/components/ds/Breadcrumbs";
import { Button, ButtonLink } from "@/components/ds/Button";
import { ModalConfirmacao } from "@/components/ds/Modal";
import { TabelaDados } from "@/components/ds/TabelaDados";
import { useToast } from "@/components/ds/Toast";
import type { ConteudoEditorial } from "@/data/types";
import { formatarData } from "@/lib/texto";
import { excluirArtigoDefinitivamenteAcao } from "@/server/admin/acoes";
import { useAcaoStatus } from "./useAcaoStatus";

type LinhaArtigoArquivado = ConteudoEditorial & { salaNome: string };

/** Lixeira de Artigos: artigos arquivados da curadoria, para restaurar ou excluir definitivamente. */
export function LixeiraArtigos({ artigos }: { artigos: LinhaArtigoArquivado[] }) {
  const { pedir, modal } = useAcaoStatus("artigo", undefined, true);
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs itens={[{ href: "/admin/salas" as Route, rotulo: "Salas" }]} atual="Lixeira de Artigos" />
      <header className="flex flex-col gap-3">
        <h1 className="sdb-title-1">Lixeira de Artigos</h1>
        <p className="sdb-body-sm">
          Artigos na lixeira. Restaure com o estado editorial anterior ou exclua definitivamente: a exclusão
          apaga o artigo para sempre, sem volta.
        </p>
        <ButtonLink href={"/admin/salas" as Route} variant="secondary">
          Voltar às Salas
        </ButtonLink>
      </header>
      <TabelaDados
        legenda={`Artigos na lixeira · ${artigos.length}`}
        itens={artigos}
        chave={(a) => a.id}
        rotuloItem={(a) => a.titulo}
        vazio="Nenhum artigo na lixeira no momento."
        colunas={[
          {
            id: "titulo",
            cabecalho: "Artigo",
            celula: (a) => (
              <>
                <span className="sdb-table__title">{a.titulo || "Sem título"}</span>
                <span className="sdb-table__sub">{a.salaNome}</span>
              </>
            ),
          },
          {
            id: "arquivado",
            cabecalho: "Enviado à lixeira em",
            celula: (a) => formatarData((a.lixeira?.em ?? a.atualizadoEm).slice(0, 10)),
          },
          {
            id: "acoes",
            cabecalho: "Ações",
            className: "sdb-table__actions",
            celula: (a) => (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  icon="regenerar"
                  aria-label={`Restaurar ${a.titulo}`}
                  onClick={() =>
                    pedir({ id: a.id, titulo: a.titulo, sala: a.sala, salaNome: a.salaNome }, "restaurar")
                  }
                >
                  Restaurar
                </Button>
                <ExcluirArtigoDefinitivamente id={a.id} titulo={a.titulo} />
              </div>
            ),
          },
        ]}
      />
      {modal}
    </div>
  );
}

function ExcluirArtigoDefinitivamente({ id, titulo }: { id: string; titulo: string }) {
  const router = useRouter();
  const toast = useToast();
  const [aberto, setAberto] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");
  const enviando = useRef(false);

  const confirmar = async () => {
    if (enviando.current) return;
    enviando.current = true;
    setOcupado(true);
    setErro("");
    try {
      const r = await excluirArtigoDefinitivamenteAcao(id);
      if (!r.ok) {
        setErro(r.mensagem.replace(/^Erro: /, ""));
        return;
      }
      setAberto(false);
      toast(r.mensagem);
      router.refresh();
    } catch {
      setErro("Não foi possível concluir. Confira a conexão e tente novamente.");
    } finally {
      enviando.current = false;
      setOcupado(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        icon="aviso"
        aria-label={`Excluir definitivamente ${titulo}`}
        onClick={() => {
          setErro("");
          setAberto(true);
        }}
      >
        Excluir definitivamente
      </Button>
      {aberto &&
        createPortal(
          <ModalConfirmacao
            open={aberto}
            titulo="Excluir este artigo definitivamente?"
            icone="aviso"
            destrutivo
            rotuloConfirmar="Excluir definitivamente"
            carregando={ocupado}
            onCancelar={() => {
              if (!enviando.current) setAberto(false);
            }}
            onConfirmar={() => void confirmar()}
          >
            <b>{titulo || "Sem título"}</b>
            <p>Esta ação não pode ser desfeita. O artigo é apagado para sempre do acervo.</p>
            {erro && (
              <p className="sdb-error-msg" role="alert">
                {erro}
              </p>
            )}
          </ModalConfirmacao>,
          document.body,
        )}
    </>
  );
}
