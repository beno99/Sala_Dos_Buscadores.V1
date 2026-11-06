"use client";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ds/Button";
import { ModalConfirmacao } from "@/components/ds/Modal";
import { useToast } from "@/components/ds/Toast";
import {
  excluirSalaAcao,
  excluirSalaPermanentementeAcao,
  restaurarSalaDaLixeiraAcao,
} from "@/server/salas/acoes";

type Modo = "mover" | "restaurar" | "permanente";

/** Confirmação compartilhada; as permissões são conferidas novamente no servidor. */
export function AcaoLixeiraSala({
  id,
  nome,
  restaurar = false,
  permanente = false,
  destino,
  aoConcluir,
}: {
  id: string;
  nome: string;
  restaurar?: boolean;
  permanente?: boolean;
  destino?: Route;
  aoConcluir?: () => void;
}) {
  const modo: Modo = permanente ? "permanente" : restaurar ? "restaurar" : "mover";
  const router = useRouter();
  const toast = useToast();
  const [aberto, setAberto] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");
  const enviando = useRef(false);
  const acao = {
    mover: excluirSalaAcao,
    restaurar: restaurarSalaDaLixeiraAcao,
    permanente: excluirSalaPermanentementeAcao,
  }[modo];
  const confirmar = async () => {
    if (enviando.current) return;
    enviando.current = true;
    setOcupado(true);
    setErro("");
    try {
      const r = await acao(id);
      if (!r.ok) {
        setErro(r.mensagem.replace(/^Erro: /, ""));
        return;
      }
      setAberto(false);
      aoConcluir?.();
      toast(r.mensagem);
      if (destino) router.push(destino);
      router.refresh();
    } catch {
      setErro("Não foi possível concluir. Confira a conexão e tente novamente.");
    } finally {
      enviando.current = false;
      setOcupado(false);
    }
  };
  const rotuloBotao = {
    mover: "Excluir Sala",
    restaurar: "Restaurar Sala",
    permanente: "Excluir definitivamente",
  }[modo];
  return (
    <>
      <Button
        variant={modo === "restaurar" ? "secondary" : "destructive"}
        icon={modo === "restaurar" ? "regenerar" : modo === "permanente" ? "aviso" : "lixeira"}
        aria-label={`${rotuloBotao} ${nome}`}
        onClick={() => {
          setErro("");
          setAberto(true);
        }}
      >
        {rotuloBotao}
      </Button>
      {aberto &&
        createPortal(
          <ModalConfirmacao
            open={aberto}
            titulo={
              {
                mover: "Mover esta Sala para a lixeira?",
                restaurar: "Restaurar esta Sala?",
                permanente: "Excluir esta Sala definitivamente?",
              }[modo]
            }
            icone={modo === "restaurar" ? "regenerar" : modo === "permanente" ? "aviso" : "lixeira"}
            destrutivo={modo !== "restaurar"}
            rotuloConfirmar={
              {
                mover: "Mover para a lixeira",
                restaurar: "Restaurar Sala",
                permanente: "Excluir definitivamente",
              }[modo]
            }
            carregando={ocupado}
            onCancelar={() => {
              if (!enviando.current) setAberto(false);
            }}
            onConfirmar={() => void confirmar()}
          >
            <b>{nome}</b>
            <p>
              {
                {
                  mover:
                    "Ao mover esta Sala para a lixeira, ela sai do portal e das suas listas. Antes, todos os artigos da Sala, inclusive rascunhos e arquivados, precisam estar na lixeira; eles deixam de aparecer no portal. Nada é apagado: artigos, vínculos e publicações ficam guardados. Somente a curadoria poderá restaurar a Sala ou excluí-la de vez.",
                  restaurar:
                    "A Sala volta às listas com o mesmo endereço e os estados anteriores. Se já estava publicada, ela e seus conteúdos publicados voltam ao portal. Rascunhos continuam rascunhos.",
                  permanente:
                    "Esta ação não pode ser desfeita. A Sala só será apagada se não houver conteúdos, vídeos, citações, conversas ou outros vínculos dependentes. Resolva esses vínculos antes de continuar.",
                }[modo]
              }
            </p>
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
