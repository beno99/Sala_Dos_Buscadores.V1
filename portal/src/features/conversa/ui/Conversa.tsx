"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ds/Button";
import { AreaTexto } from "@/components/ds/CamposExtras";
import { EstadoSecao } from "@/components/ds/EstadosInterface";
import { LinhaComentario } from "@/components/ds/LinhaComentario";
import { iniciais } from "@/lib/texto";
import type { MensagemVisivel } from "@/server/conversa/consultas";

type Lado = { nome: string; href: string; anfitriao?: boolean };

const ATUALIZAR_MS = 15_000;
const QUANDO = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export function Conversa({
  mensagens,
  anfitriao,
  curadoria,
  enviar,
  rotulo,
}: {
  mensagens: MensagemVisivel[];
  anfitriao: Lado;
  curadoria: Lado;
  enviar: (texto: string) => Promise<{ ok: boolean; mensagem: string }>;
  rotulo: string;
}) {
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string>();
  const [enviando, iniciar] = useTransition();
  const fim = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, ATUALIZAR_MS);
    return () => clearInterval(id);
  }, [router]);

  useEffect(() => {
    if (mensagens.length) fim.current?.scrollIntoView({ block: "end" });
  }, [mensagens.length]);

  const submeter = () =>
    iniciar(async () => {
      const r = await enviar(texto);
      if (!r.ok) return setErro(r.mensagem.replace(/^Erro:\s*/, ""));
      setErro(undefined);
      setTexto("");
      router.refresh();
    });

  return (
    <div className="flex max-w-read flex-col gap-6">
      <section aria-label="Mensagens" aria-live="polite" className="flex flex-col gap-4">
        {mensagens.length === 0 ? (
          <EstadoSecao
            simbolo="pasta"
            titulo="Nenhuma mensagem ainda"
            descricao="Escreva abaixo para começar a conversa."
            compacto
          />
        ) : (
          mensagens.map((m) => {
            const lado = m.daCuradoria ? curadoria : anfitriao;
            return (
              <LinhaComentario
                key={m.id}
                autor={{ ...lado, iniciais: iniciais(lado.nome) }}
                texto={m.texto}
                data={m.criadaEm}
                tempo={QUANDO.format(new Date(m.criadaEm))}
                destacarAnfitriao
              />
            );
          })
        )}
        <div ref={fim} />
      </section>
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          submeter();
        }}
      >
        <AreaTexto
          label={rotulo}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              submeter();
            }
          }}
          maxLength={2000}
          contador
          rows={3}
          error={erro}
          help="Ctrl + Enter envia."
          disabled={enviando}
        />
        <div className="sdb-row">
          <Button type="submit" variant="primary" icon="enviar" loading={enviando}>
            Enviar
          </Button>
        </div>
      </form>
    </div>
  );
}
