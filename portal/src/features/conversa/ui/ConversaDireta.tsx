"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { Button } from "@/components/ds/Button";
import { useToast } from "@/components/ds/Toast";
import {
  bloquearAcao,
  denunciarDiretaAcao,
  enviarDiretaAcao,
  marcarLidasAcao,
} from "@/server/conversa/acoes";
import type { AutorVisivel, MensagemVisivel } from "@/server/conversa/consultas";
import { Conversa } from "./Conversa";

/** Mensagem direta entre duas contas, com bloquear e denunciar. */
export function ConversaDireta({
  outro,
  eu,
  mensagens,
  bloqueada,
  euBloqueei,
}: {
  outro: AutorVisivel;
  eu: AutorVisivel;
  mensagens: MensagemVisivel[];
  bloqueada: boolean;
  euBloqueei: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [ocupado, setOcupado] = useState(false);
  const aoAbrir = useCallback(() => void marcarLidasAcao(outro.id), [outro.id]);

  const executar = async (acao: () => Promise<{ ok: boolean; mensagem: string }>) => {
    if (ocupado) return;
    setOcupado(true);
    const r = await acao();
    setOcupado(false);
    toast(r.mensagem.replace(/^Erro: /, ""), r.ok ? undefined : { variant: "erro", title: "Erro" });
    if (r.ok) router.refresh();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="sdb-row">
        <Button
          variant={euBloqueei ? "secondary" : "plain"}
          size="sm"
          loading={ocupado}
          onClick={() => executar(() => bloquearAcao(outro.id, !euBloqueei))}
        >
          {euBloqueei ? "Desbloquear" : `Bloquear ${outro.nome}`}
        </Button>
      </div>
      <Conversa
        mensagens={mensagens}
        eu={eu}
        enviar={(envio) => enviarDiretaAcao(outro.id, envio)}
        rotulo={`Mensagem para ${outro.nome}`}
        vazio={`Escreva abaixo para começar a conversa com ${outro.nome}.`}
        aoAbrir={aoAbrir}
        bloqueio={
          bloqueada ? (
            <Alerta title="Conversa bloqueada">
              {euBloqueei
                ? "Você bloqueou esta conta. Desbloqueie para voltar a trocar mensagens."
                : "Não é possível enviar mensagens nesta conversa."}
            </Alerta>
          ) : undefined
        }
        acoesMensagem={(m) =>
          !m.minha && eu.papel !== "administrador" ? (
            <div>
              <Button
                variant="plain"
                size="sm"
                disabled={ocupado}
                onClick={() => executar(() => denunciarDiretaAcao(m.id))}
              >
                Denunciar à curadoria
              </Button>
            </div>
          ) : null
        }
      />
    </div>
  );
}
