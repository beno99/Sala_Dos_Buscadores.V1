"use client";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ds/Button";
import { ModalConfirmacao } from "@/components/ds/Modal";
import { useToast } from "@/components/ds/Toast";
import { excluirSalaAcao, restaurarSalaDaLixeiraAcao } from "@/server/salas/acoes";

/** Confirmação compartilhada; as permissões são conferidas novamente no servidor. */
export function AcaoLixeiraSala({
  id,
  nome,
  restaurar = false,
  destino,
  aoConcluir,
}: {
  id: string;
  nome: string;
  restaurar?: boolean;
  destino?: Route;
  aoConcluir?: () => void;
}) {
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
      const r = await (restaurar ? restaurarSalaDaLixeiraAcao : excluirSalaAcao)(id);
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
  return (
    <>
      <Button
        variant={restaurar ? "secondary" : "destructive"}
        icon={restaurar ? "regenerar" : "lixeira"}
        aria-label={`${restaurar ? "Restaurar" : "Excluir"} Sala ${nome}`}
        onClick={() => {
          setErro("");
          setAberto(true);
        }}
      >
        {restaurar ? "Restaurar Sala" : "Excluir Sala"}
      </Button>
      {aberto &&
        createPortal(
          <ModalConfirmacao
            open={aberto}
            titulo={restaurar ? "Restaurar esta Sala?" : "Mover esta Sala para a lixeira?"}
            icone={restaurar ? "regenerar" : "lixeira"}
            destrutivo={!restaurar}
            rotuloConfirmar={restaurar ? "Restaurar Sala" : "Mover para a lixeira"}
            carregando={ocupado}
            onCancelar={() => {
              if (!enviando.current) setAberto(false);
            }}
            onConfirmar={() => void confirmar()}
          >
            <b>{nome}</b>
            <p>
              {restaurar
                ? "A Sala volta às listas com o mesmo endereço e os estados anteriores. Se já estava publicada, ela e seus conteúdos publicados voltam ao portal. Rascunhos continuam rascunhos."
                : "A Sala, seus artigos, vídeos e conversas saem do portal e das listas de trabalho. Os conteúdos e vínculos são preservados. Somente a curadoria poderá restaurar a Sala."}
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
