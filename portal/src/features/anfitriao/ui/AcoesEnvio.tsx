"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { Button } from "@/components/ds/Button";
import { ChecklistPublicacao } from "@/components/ds/Curadoria";
import { ModalConfirmacao } from "@/components/ds/Modal";
import { useToast } from "@/components/ds/Toast";
import type { StatusEditorial } from "@/data/types";
import type { ItemChecklist } from "@/features/admin/regras/checklist";
import { focarCampo } from "@/features/admin/ui/AvisoSaida";
import type { ModoSalvar } from "@/server/admin/editorial";
import { SheetEnvio } from "./SheetEnvio";

type Resposta = { ok: boolean; mensagem: string; erros?: Record<string, string> };

/** Como o item se chama nas mensagens ("o vídeo", "o anúncio"). */
export interface NomeItem {
  artigo: "o" | "a";
  nome: string;
}

/**
 * Coluna de envio dos itens do anfitrião (vídeo e anúncio): checklist, Enviar
 * para revisão (com o aceite de direitos), Salvar alterações num item no ar
 * (que sai do ar até a nova aprovação), Retirar do ar e Excluir um item que
 * nunca foi ao ar. A curadoria decide; nada vai ao ar daqui.
 */
export function AcoesEnvio({
  item,
  titulo,
  status,
  jaPublicado,
  congelado,
  checklist,
  sujo,
  salvando,
  id,
  salvarAgora,
  aoErro,
  enviar,
  retirar,
  excluir,
  depoisDeExcluir,
  destinoEnvio,
}: {
  item: NomeItem;
  titulo: string;
  status: StatusEditorial;
  jaPublicado: boolean;
  congelado: boolean;
  checklist: ItemChecklist[];
  sujo: boolean;
  salvando: boolean;
  id: string | null;
  salvarAgora: (modo: ModoSalvar) => Promise<Resposta | null>;
  aoErro: (erros: Record<string, string>, mensagem: string) => void;
  enviar: (id: string, aceite: boolean) => Promise<Resposta>;
  retirar: (id: string) => Promise<Resposta>;
  excluir: (id: string) => Promise<Resposta>;
  depoisDeExcluir: Route;
  /** Onde o item aparece se aprovado (frase curta, "na Sala X", "no Portal"). */
  destinoEnvio: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [envio, setEnvio] = useState(false);
  const [aceite, setAceite] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [confirmarEdicao, setConfirmarEdicao] = useState(false);
  const [confirmarRetirar, setConfirmarRetirar] = useState(false);
  const [confirmarExcluir, setConfirmarExcluir] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [avisoPendencias, setAvisoPendencias] = useState(false);

  const publicado = status === "publicado";
  const emRevisao = status === "em_revisao";
  const podeEnviar = status === "rascunho" || status === "reprovado";
  const pendente = checklist.some((i) => i.estado === "pendente");
  const Nome = `${item.artigo.toUpperCase()} ${item.nome}`;

  const abrirEnvio = async () => {
    if (pendente) {
      setAvisoPendencias(true);
      const primeiro = checklist.find((i) => i.estado === "pendente");
      if (primeiro) focarCampo(primeiro.campo);
      return;
    }
    setErroEnvio(null);
    setEnvio(true);
  };

  const confirmarEnvio = async () => {
    setEnviando(true);
    if (sujo || !id) {
      const s = await salvarAgora("automatico");
      if (!s?.ok) {
        setEnviando(false);
        setErroEnvio(s?.mensagem.replace(/^Erro: /, "") ?? "não foi possível salvar antes de enviar.");
        return;
      }
    }
    const r = await enviar(id ?? "", aceite);
    setEnviando(false);
    if (!r.ok) {
      setErroEnvio(r.mensagem.replace(/^Erro: /, ""));
      return;
    }
    setEnvio(false);
    toast(r.mensagem);
    router.refresh();
  };

  const executar = async (acao: () => Promise<Resposta>, depois: () => void) => {
    setOcupado(true);
    const r = await acao();
    setOcupado(false);
    if (!r.ok) {
      toast(r.mensagem.replace(/^Erro: /, ""), { variant: "erro", title: "Erro: não foi possível concluir" });
      return;
    }
    toast(r.mensagem);
    depois();
  };

  return (
    <>
      {avisoPendencias && pendente && (
        <Alerta variant="error" title="Erro: ainda há itens pendentes">
          Cada item abaixo leva ao campo que falta.
        </Alerta>
      )}
      {emRevisao && (
        <Alerta title="Em revisão">{Nome} está com a curadoria. Enquanto isso, não pode ser editado.</Alerta>
      )}
      <ChecklistPublicacao
        aoIrParaCampo={focarCampo}
        itens={checklist}
        acao={
          congelado || emRevisao ? null : publicado ? (
            <Button variant="primary" block onClick={() => setConfirmarEdicao(true)} disabled={!sujo}>
              Salvar alterações
            </Button>
          ) : podeEnviar ? (
            <Button variant="primary" block aria-disabled={pendente} onClick={abrirEnvio}>
              Enviar para revisão
            </Button>
          ) : null
        }
      />
      {id && !congelado && (publicado || (!jaPublicado && !emRevisao)) && (
        <div className="sdb-material sdb-panel">
          <h2 className="sdb-headline">Ações</h2>
          <div className="flex flex-col gap-2">
            {publicado && (
              <Button variant="secondary" block onClick={() => setConfirmarRetirar(true)}>
                Retirar do ar
              </Button>
            )}
            {!jaPublicado && !emRevisao && (
              <Button variant="destructive" block icon="lixeira" onClick={() => setConfirmarExcluir(true)}>
                Excluir
              </Button>
            )}
          </div>
        </div>
      )}

      <SheetEnvio
        aberto={envio}
        titulo="Enviar para revisão"
        aceite={aceite}
        onAceite={(v) => {
          setAceite(v);
          setErroEnvio(null);
        }}
        erro={erroEnvio}
        enviando={enviando}
        onEnviar={confirmarEnvio}
        onFechar={() => setEnvio(false)}
      >
        <p className="sdb-body-sm m-0">
          “{titulo.trim()}” vai para a curadoria. Se aprovado, entra no ar {destinoEnvio}.
        </p>
      </SheetEnvio>

      <ModalConfirmacao
        open={confirmarEdicao}
        titulo={`Salvar e tirar ${item.artigo} ${item.nome} do ar?`}
        icone="aviso"
        rotuloConfirmar="Salvar e tirar do ar"
        carregando={salvando}
        onCancelar={() => setConfirmarEdicao(false)}
        onConfirmar={async () => {
          const r = await salvarAgora("manual");
          setConfirmarEdicao(false);
          if (r?.ok) {
            toast(r.mensagem);
            router.refresh();
          } else if (r && !r.ok) aoErro(r.erros ?? {}, r.mensagem);
        }}
      >
        {Nome} sai do ar até a curadoria aprovar a nova versão. Depois de salvar, envie de novo para revisão.
      </ModalConfirmacao>

      <ModalConfirmacao
        open={confirmarRetirar}
        titulo={`Retirar ${item.artigo} ${item.nome} do ar?`}
        icone="aviso"
        destrutivo
        rotuloConfirmar="Retirar do ar"
        carregando={ocupado}
        onCancelar={() => setConfirmarRetirar(false)}
        onConfirmar={() =>
          executar(
            () => retirar(id ?? ""),
            () => {
              setConfirmarRetirar(false);
              router.refresh();
            },
          )
        }
      >
        {Nome} sai do portal e fica arquivado. Nada é apagado.
      </ModalConfirmacao>

      <ModalConfirmacao
        open={confirmarExcluir}
        titulo={`Excluir ${item.artigo} ${item.nome}?`}
        icone="lixeira"
        destrutivo
        rotuloConfirmar="Excluir"
        carregando={ocupado}
        onCancelar={() => setConfirmarExcluir(false)}
        onConfirmar={() =>
          executar(
            () => excluir(id ?? ""),
            () => {
              router.push(depoisDeExcluir);
              router.refresh();
            },
          )
        }
      >
        {Nome} nunca foi ao ar e será excluído. Esta ação não pode ser desfeita.
      </ModalConfirmacao>
    </>
  );
}
