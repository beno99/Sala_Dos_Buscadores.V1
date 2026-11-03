"use client";

import {
  type CSSProperties,
  type DragEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { LIMITE_IMAGEM_BYTES, TIPOS_IMAGEM } from "@/features/anfitriao/regras/imagem";
import {
  diagnosticar,
  dimensoes,
  FINALIDADES,
  type Finalidade,
  FORMATOS_IMAGEM,
  LIMITE_IMAGEM_MB,
  proporcaoDoArquivo,
} from "@/features/midia/finalidades";
import { cx } from "@/lib/cx";
import { Button } from "./Button";
import { Icon } from "./Icon";

/** Imagem já guardada no servidor (id de mídia e URL de /midia/[id]). */
export interface ImagemEnviada {
  id: string;
  url: string;
}

const TIPOS = TIPOS_IMAGEM;

function tamanho(n: number) {
  return n >= 1048576
    ? `${(n / 1048576).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`
    : `${Math.max(1, Math.round(n / 1024))} KB`;
}

/** Envia a imagem para o servidor, que confere os magic bytes e o tamanho de novo. */
async function enviarImagem(
  arquivo: File,
  finalidade: Finalidade,
): Promise<{ ok: true; imagem: ImagemEnviada } | { ok: false; erro: string }> {
  const corpo = new FormData();
  corpo.set("arquivo", arquivo);
  corpo.set("finalidade", finalidade);
  try {
    const r = await fetch("/midia", { method: "POST", body: corpo });
    const dados = (await r.json()) as { ok: boolean; id?: string; url?: string; erro?: string };
    if (dados.ok && dados.id && dados.url) return { ok: true, imagem: { id: dados.id, url: dados.url } };
    return { ok: false, erro: dados.erro ?? "não foi possível enviar a imagem. Tente de novo." };
  } catch {
    return { ok: false, erro: "não foi possível enviar a imagem. Confira a conexão e tente de novo." };
  }
}

/**
 * Campo de imagem (CampoImagem): orientação da finalidade antes da escolha
 * (largura × altura recomendadas, proporção, formatos, limite e como a imagem
 * aparece), área de toque ou de soltar, prévia com a mesma regra da página
 * pública (imagem inteira), diagnóstico do arquivo e erro de tipo ou tamanho.
 * O navegador confere tipo e tamanho para responder rápido; quem decide é o
 * servidor. Avisos de resolução e proporção não bloqueiam o envio.
 */
export function CampoImagem({
  id,
  label,
  opcional,
  finalidade,
  help,
  valor,
  onMudar,
  disabled,
  error,
}: {
  id?: string;
  label: ReactNode;
  opcional?: boolean;
  /** Onde a imagem vai aparecer: define as dimensões recomendadas e a prévia. */
  finalidade: Finalidade;
  /** Orientação editorial extra (direito de uso, o que acontece sem imagem). */
  help?: ReactNode;
  valor: ImagemEnviada | null;
  onMudar: (imagem: ImagemEnviada | null) => void;
  disabled?: boolean;
  /** Erro vindo do formulário (campo obrigatório, imagem recusada no servidor). */
  error?: string;
}) {
  const gerado = useId();
  const campo = id ?? gerado;
  const o = FINALIDADES[finalidade];
  const quadrado = finalidade === "avatar";
  const entrada = useRef<HTMLInputElement>(null);
  const [erroLocal, setErro] = useState<string | null>(null);
  const erro = erroLocal ?? error ?? null;
  const [enviando, setEnviando] = useState(false);
  const [arrastando, setArrastando] = useState(false);
  const [arquivo, setArquivo] = useState<{ nome: string; tamanho: string } | null>(null);

  const [medidas, setMedidas] = useState<{ url: string; largura: number; altura: number } | null>(null);
  const medidasAtuais = medidas?.url === valor?.url ? medidas : null;
  // Lê as dimensões naturais do arquivo (novo ou já salvo), mesmo se a prévia carregou antes da hidratação.
  const url = valor?.url;
  useEffect(() => {
    if (!url) return;
    let ativo = true;
    const img = new Image();
    img.onload = () => {
      if (ativo) setMedidas({ url, largura: img.naturalWidth, altura: img.naturalHeight });
    };
    img.src = url;
    return () => {
      ativo = false;
    };
  }, [url]);
  const aviso = medidasAtuais ? diagnosticar(o, medidasAtuais.largura, medidasAtuais.altura) : null;

  const escolher = async (original: File | undefined) => {
    if (!original || disabled || enviando) return;
    if (!TIPOS.includes(original.type)) {
      setErro(`use um arquivo nos formatos ${FORMATOS_IMAGEM}.`);
      return;
    }
    if (original.size > LIMITE_IMAGEM_BYTES) {
      setErro(
        `o arquivo tem ${tamanho(original.size)} e ultrapassa ${LIMITE_IMAGEM_MB} MB. Escolha uma versão menor.`,
      );
      return;
    }
    setErro(null);
    setEnviando(true);
    // Envia os bytes originais. Uma futura versão otimizada deve ser outro arquivo.
    const r = await enviarImagem(original, finalidade);
    setEnviando(false);
    if (entrada.current) entrada.current.value = "";
    // Em erro, a imagem anterior e o resto do formulário ficam como estavam.
    if (!r.ok) {
      setErro(r.erro);
      return;
    }
    setArquivo({ nome: original.name, tamanho: tamanho(original.size) });
    onMudar(r.imagem);
  };

  const soltar = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setArrastando(false);
    void escolher(e.dataTransfer.files[0]);
  };

  const descritores = [
    `${campo}-descricao`,
    `${campo}-orientacao`,
    `${campo}-exibicao`,
    help && `${campo}-ajuda`,
    erro && `${campo}-erro`,
    enviando && `${campo}-estado`,
    aviso && (aviso.baixaResolucao || aviso.outraProporcao) && `${campo}-aviso`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="sdb-field sdb-image-field">
      <div className="sdb-upload__header">
        <span className="sdb-label" id={`${campo}-rotulo`}>
          {label}
          {opcional && <small>opcional</small>}
        </span>
        <p id={`${campo}-descricao`} className="sdb-upload__description">
          {o.descricao}
        </p>
      </div>
      {/* biome-ignore lint/a11y/noStaticElementInteractions lint/a11y/noNoninteractiveElementInteractions: arrastar é atalho; o input de arquivo é o controle acessível. */}
      <div
        className={cx(
          "sdb-upload",
          arrastando && "is-over",
          quadrado && "sdb-upload--quadrado",
          o.alturaLivre && "sdb-upload--livre",
          valor && "has-file",
          erro && "is-error",
          (disabled || enviando) && "is-disabled",
        )}
        style={{ "--sdb-upload-ratio": o.proporcao.replace(":", " / ") } as CSSProperties}
        aria-busy={enviando}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled && !enviando) setArrastando(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setArrastando(false);
        }}
        onDrop={soltar}
      >
        <label className="sdb-upload__drop">
          <input
            ref={entrada}
            id={campo}
            className="sdb-upload__input"
            type="file"
            accept={TIPOS.join(",")}
            disabled={disabled || enviando}
            aria-labelledby={`${campo}-rotulo`}
            aria-describedby={descritores}
            aria-invalid={erro ? true : undefined}
            onChange={(e) => void escolher(e.target.files?.[0])}
          />
          <span className="sdb-upload__icon">
            <Icon name="enviar" />
          </span>
          <span>
            <b>{enviando ? "Enviando imagem…" : "Clique para enviar"}</b>
            {!enviando && " ou arraste a imagem aqui"}
          </span>
        </label>
        {valor && (
          <figure className="sdb-upload__preview">
            {/* biome-ignore lint/performance/noImgElement: prévia da imagem enviada, servida por /midia. */}
            <img src={valor.url} alt="" />
            <figcaption className="sdb-upload__bar">
              <span className="sdb-upload__meta">
                <span className="sdb-upload__name">{arquivo?.nome ?? "Imagem enviada"}</span>
                <span className="sdb-upload__size">
                  {medidasAtuais &&
                    `${dimensoes(medidasAtuais)} · proporção ${proporcaoDoArquivo(medidasAtuais.largura, medidasAtuais.altura)} · `}
                  {arquivo ? arquivo.tamanho : "tamanho do arquivo não disponível nesta edição"}
                </span>
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={disabled || enviando}
                onClick={() => entrada.current?.click()}
              >
                Trocar
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={disabled || enviando}
                onClick={() => {
                  setArquivo(null);
                  setMedidas(null);
                  if (entrada.current) entrada.current.value = "";
                  setErro(null);
                  onMudar(null);
                  requestAnimationFrame(() => entrada.current?.focus());
                }}
              >
                Remover
              </Button>
            </figcaption>
          </figure>
        )}
        <p id={`${campo}-orientacao`} className="sdb-upload__requirements">
          <span>
            Recomendado: <b>{dimensoes(o)}</b>
          </span>
          <span>
            Largura × altura · proporção {o.proporcao}
            {o.alturaLivre && " · altura livre"}
          </span>
          <span className="sdb-upload__formats">
            {FORMATOS_IMAGEM}
            <span className="sdb-upload__limit">Até {LIMITE_IMAGEM_MB} MB</span>
          </span>
        </p>
      </div>
      <p id={`${campo}-exibicao`} className="sdb-help">
        {o.exibicao}
        {o.usos.length > 1 && <> Este arquivo também aparece em: {o.usos.slice(1).join("; ")}.</>}
      </p>
      {help && (
        <p id={`${campo}-ajuda`} className="sdb-help">
          {help}
        </p>
      )}
      {aviso && (aviso.baixaResolucao || aviso.outraProporcao) && (
        <p id={`${campo}-aviso`} className="sdb-help" role="status">
          {aviso.baixaResolucao && (
            <>
              Esta imagem pode perder nitidez nesta área. Recomendamos pelo menos{" "}
              {o.largura.toLocaleString("pt-BR")} px de largura; ampliar o arquivo não recupera detalhes.{" "}
            </>
          )}
          {aviso.outraProporcao &&
            (o.enquadravel
              ? "A imagem tem outra proporção: use o enquadramento para escolher a parte que aparece."
              : o.alturaLivre
                ? "A imagem tem outra proporção e será exibida inteira, com a altura ajustada ao arquivo."
                : quadrado
                  ? "A imagem não é quadrada: no círculo, as bordas do arquivo ficam de fora. Prefira uma foto quadrada."
                  : "A imagem tem outra proporção e será exibida inteira, com espaço de fundo.")}{" "}
          A imagem pode ser salva assim.
        </p>
      )}
      {erro && (
        <p id={`${campo}-erro`} className="sdb-error-msg" role="alert">
          <Icon name="erro" />
          <span>
            <b>Erro:</b> {erro}
          </span>
        </p>
      )}
      {enviando && (
        <span id={`${campo}-estado`} className="sdb-help" role="status" aria-live="polite">
          Enviando imagem.
        </span>
      )}
    </div>
  );
}
