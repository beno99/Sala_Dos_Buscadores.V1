"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState, useTransition } from "react";
import { Avatar } from "@/components/ds/Avatar";
import { Button } from "@/components/ds/Button";
import { AreaTexto } from "@/components/ds/CamposExtras";
import { EstadoSecao } from "@/components/ds/EstadosInterface";
import { Icon } from "@/components/ds/Icon";
import { Badge } from "@/components/ds/Selos";
import { TIPOS_ANEXO } from "@/features/anfitriao/regras/imagem";
import { iniciais } from "@/lib/texto";
import type { AutorVisivel, MensagemVisivel } from "@/server/conversa/consultas";
import {
  LIMITE_ANEXOS,
  LIMITE_MENSAGEM,
  type PapelConta,
  ROTULO_PAPEL,
  validarEnvio,
} from "../regras/mensagem";

const ATUALIZAR_MS = 15_000;
const QUANDO = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

const SELO: Record<
  PapelConta,
  { variant: "solid" | "source" | "neutral"; icone: "curado" | "anfitriao" | "pessoa" }
> = {
  administrador: { variant: "solid", icone: "curado" },
  anfitriao: { variant: "source", icone: "anfitriao" },
  membro: { variant: "neutral", icone: "pessoa" },
};

type AnexoEnviado = { midia: string; nome: string; tipo: string; url: string };
type Envio = { texto: string; anexos: { midia: string; nome: string }[] };

/** Selo de papel: deixa claro, em cada mensagem, se quem escreve é Curadoria, Anfitrião ou Buscador. */
export function SeloPapel({ papel }: { papel: PapelConta }) {
  return (
    <Badge variant={SELO[papel].variant} icon={SELO[papel].icone}>
      {ROTULO_PAPEL[papel]}
    </Badge>
  );
}

function Mensagem({ m }: { m: MensagemVisivel }) {
  const a = m.autor;
  return (
    <article
      className={`sdb-comment sdb-mensagem sdb-mensagem--${a.papel}${m.minha ? " sdb-mensagem--minha" : ""}`}
      aria-label={`${a.nome}, ${ROTULO_PAPEL[a.papel]}`}
    >
      <Avatar iniciais={iniciais(a.nome)} foto={a.foto} size="sm" />
      <div className="sdb-comment__body">
        <div className="sdb-comment__byline">
          {a.href ? (
            <a className="sdb-comment__name" href={a.href}>
              {a.nome}
            </a>
          ) : (
            <span className="sdb-comment__name">{a.nome}</span>
          )}
          <SeloPapel papel={a.papel} />
          {m.minha && <span className="sdb-footnote">(você)</span>}
        </div>
        {m.texto && <p className="sdb-body-sm sdb-comment__text">{m.texto}</p>}
        {m.anexos.length > 0 && (
          <ul className="sdb-mensagem__anexos">
            {m.anexos.map((x) =>
              x.tipo.startsWith("image/") ? (
                <li key={x.midia}>
                  <a className="sdb-mensagem__imagem" href={x.url} target="_blank" rel="noopener noreferrer">
                    {/* biome-ignore lint/performance/noImgElement: anexo servido por /midia, já compactado no envio. */}
                    <img src={x.url} alt={x.nome} loading="lazy" />
                    <span className="sdb-sr"> (abre em nova aba)</span>
                  </a>
                </li>
              ) : (
                <li key={x.midia}>
                  <a className="sdb-mensagem__arquivo" href={x.url} download={x.nome}>
                    <Icon name="artigo" size="sm" />
                    <span>{x.nome}</span>
                    <span className="sdb-footnote">PDF · baixar</span>
                  </a>
                </li>
              ),
            )}
          </ul>
        )}
        <div className="sdb-footnote sdb-comment__meta">
          <time dateTime={m.criadaEm}>{QUANDO.format(new Date(m.criadaEm))}</time>
        </div>
      </div>
    </article>
  );
}

async function anexar(arquivo: File): Promise<AnexoEnviado | string> {
  const corpo = new FormData();
  corpo.set("arquivo", arquivo);
  try {
    const r = await fetch("/midia/anexo", { method: "POST", body: corpo });
    const d = (await r.json()) as { ok: boolean; id?: string; url?: string; tipo?: string; erro?: string };
    if (d.ok && d.id && d.url && d.tipo) return { midia: d.id, url: d.url, tipo: d.tipo, nome: arquivo.name };
    return d.erro ?? "não foi possível anexar o arquivo.";
  } catch {
    return "não foi possível anexar o arquivo. Confira a conexão e tente de novo.";
  }
}

/**
 * Conversa (canal com a curadoria ou mensagem direta). Cada mensagem mostra o
 * nome e o selo do papel de quem escreveu. Só anfitrião e curadoria anexam
 * imagens e PDF; o servidor confere de novo papel, tipo, tamanho e dono.
 */
export function Conversa({
  mensagens,
  eu,
  enviar,
  rotulo,
  vazio = "Escreva abaixo para começar a conversa.",
  bloqueio,
  acoesMensagem,
  aoAbrir,
}: {
  mensagens: MensagemVisivel[];
  eu: Pick<AutorVisivel, "papel">;
  enviar: (envio: Envio) => Promise<{ ok: boolean; mensagem: string }>;
  rotulo: string;
  vazio?: string;
  /** Conversa bloqueada: mostra o aviso no lugar do campo. */
  bloqueio?: ReactNode;
  acoesMensagem?: (m: MensagemVisivel) => ReactNode;
  aoAbrir?: () => void;
}) {
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const [anexos, setAnexos] = useState<AnexoEnviado[]>([]);
  const [anexando, setAnexando] = useState(false);
  const [erro, setErro] = useState<string>();
  const [enviando, iniciar] = useTransition();
  const fim = useRef<HTMLDivElement>(null);
  const entrada = useRef<HTMLInputElement>(null);
  const comAnexos = eu.papel === "anfitriao" || eu.papel === "administrador";

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, ATUALIZAR_MS);
    return () => clearInterval(id);
  }, [router]);

  useEffect(() => {
    if (mensagens.length) fim.current?.scrollIntoView({ block: "end" });
    aoAbrir?.();
  }, [mensagens.length, aoAbrir]);

  const escolher = async (lista: FileList | null) => {
    if (!lista?.length) return;
    const arquivos = [...lista].slice(0, LIMITE_ANEXOS - anexos.length);
    setErro(undefined);
    setAnexando(true);
    for (const f of arquivos) {
      if (!TIPOS_ANEXO.includes(f.type)) {
        setErro(`“${f.name}”: use JPEG, PNG, WebP ou PDF.`);
        continue;
      }
      const r = await anexar(f);
      if (typeof r === "string") setErro(`“${f.name}”: ${r}`);
      else setAnexos((atual) => [...atual, r]);
    }
    setAnexando(false);
    if (entrada.current) entrada.current.value = "";
  };

  const submeter = () => {
    if (enviando || anexando) return;
    const envio = { texto, anexos: anexos.map(({ midia, nome }) => ({ midia, nome })) };
    const local = validarEnvio(envio.texto, envio.anexos, eu.papel);
    if (!local.ok) return setErro(local.erro);
    iniciar(async () => {
      const r = await enviar(envio);
      if (!r.ok) return setErro(r.mensagem.replace(/^Erro:\s*/, ""));
      setErro(undefined);
      setTexto("");
      setAnexos([]);
      router.refresh();
    });
  };

  return (
    <div className="flex max-w-read flex-col gap-6">
      <section aria-label="Mensagens" aria-live="polite" className="flex flex-col gap-4">
        {mensagens.length === 0 ? (
          <EstadoSecao simbolo="pasta" titulo="Nenhuma mensagem ainda" descricao={vazio} compacto />
        ) : (
          mensagens.map((m) => (
            <div key={m.id} className="flex flex-col gap-1">
              <Mensagem m={m} />
              {acoesMensagem?.(m)}
            </div>
          ))
        )}
        <div ref={fim} />
      </section>
      {bloqueio ?? (
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
            onChange={(e) => {
              setTexto(e.target.value);
              setErro(undefined);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                submeter();
              }
            }}
            maxLength={LIMITE_MENSAGEM}
            contador
            rows={3}
            error={erro}
            help={
              comAnexos
                ? `Ctrl + Enter envia. Anexos: imagens (JPEG, PNG, WebP) ou PDF, até 5 MB cada, no máximo ${LIMITE_ANEXOS}.`
                : "Ctrl + Enter envia."
            }
            disabled={enviando}
          />
          {anexos.length > 0 && (
            <ul className="sdb-mensagem__anexos" aria-label="Anexos desta mensagem">
              {anexos.map((a) => (
                <li key={a.midia} className="sdb-mensagem__arquivo">
                  <Icon name={a.tipo.startsWith("image/") ? "imagem" : "artigo"} size="sm" />
                  <span>{a.nome}</span>
                  <Button
                    variant="plain"
                    size="sm"
                    icon="fechar"
                    iconOnly
                    aria-label={`Remover ${a.nome}`}
                    onClick={() => setAnexos((atual) => atual.filter((x) => x.midia !== a.midia))}
                  />
                </li>
              ))}
            </ul>
          )}
          <div className="sdb-row">
            <Button
              type="submit"
              variant="primary"
              icon="enviar"
              loading={enviando}
              disabled={enviando || anexando}
            >
              Enviar
            </Button>
            {comAnexos && (
              <>
                <input
                  ref={entrada}
                  type="file"
                  className="sdb-sr"
                  accept={TIPOS_ANEXO.join(",")}
                  multiple
                  tabIndex={-1}
                  aria-hidden="true"
                  onChange={(e) => void escolher(e.target.files)}
                />
                <Button
                  variant="secondary"
                  icon="imagem"
                  loading={anexando}
                  disabled={anexando || enviando || anexos.length >= LIMITE_ANEXOS}
                  onClick={() => entrada.current?.click()}
                >
                  {anexando ? "Anexando…" : "Anexar arquivo"}
                </Button>
              </>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
