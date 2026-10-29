"use client";

import { type DragEvent, type ReactNode, useId, useRef, useState } from "react";
import { cx } from "@/lib/cx";
import { Button } from "./Button";
import { Icon } from "./Icon";

/** Imagem já guardada no servidor (id de mídia e URL de /midia/[id]). */
export interface ImagemEnviada {
  id: string;
  url: string;
}

const TIPOS = ["image/jpeg", "image/png", "image/webp"];
const LIMITE_MB = 5;

function tamanho(n: number) {
  return n >= 1048576
    ? `${(n / 1048576).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`
    : `${Math.max(1, Math.round(n / 1024))} KB`;
}

const LADO_MAXIMO = 2000;
const REDUZIR_ACIMA = 600 * 1024;

async function reduzir(f: File): Promise<File> {
  if (f.size <= REDUZIR_ACIMA) return f;
  try {
    const bitmap = await createImageBitmap(f, { imageOrientation: "from-image" });
    const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
    const tela = document.createElement("canvas");
    tela.width = Math.round(bitmap.width * escala);
    tela.height = Math.round(bitmap.height * escala);
    tela.getContext("2d")?.drawImage(bitmap, 0, 0, tela.width, tela.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((ok) => tela.toBlob(ok, "image/webp", 0.85));
    if (!blob || blob.type !== "image/webp" || blob.size >= f.size) return f;
    return new File([blob], f.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return f;
  }
}

/** Envia a imagem para o servidor, que confere os magic bytes e o tamanho de novo. */
async function enviarImagem(
  arquivo: File,
): Promise<{ ok: true; imagem: ImagemEnviada } | { ok: false; erro: string }> {
  const corpo = new FormData();
  corpo.set("arquivo", arquivo);
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
 * Campo de imagem (CampoImagem): área de toque ou de soltar, prévia com
 * trocar e remover, e erro de tipo ou tamanho. O navegador confere tipo e
 * tamanho para responder rápido; quem decide é o servidor.
 */
export function CampoImagem({
  id,
  label,
  opcional,
  help = "JPEG, PNG ou WebP, até 5 MB.",
  valor,
  onMudar,
  quadrado,
  disabled,
}: {
  id?: string;
  label: ReactNode;
  opcional?: boolean;
  help?: ReactNode;
  valor: ImagemEnviada | null;
  onMudar: (imagem: ImagemEnviada | null) => void;
  /** Avatar: proporção 1:1 e até 240 px. */
  quadrado?: boolean;
  disabled?: boolean;
}) {
  const gerado = useId();
  const campo = id ?? gerado;
  const entrada = useRef<HTMLInputElement>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [arrastando, setArrastando] = useState(false);
  const [arquivo, setArquivo] = useState<{ nome: string; tamanho: string } | null>(null);

  const escolher = async (original: File | undefined) => {
    if (!original || disabled) return;
    if (!TIPOS.includes(original.type)) {
      setErro("o arquivo precisa ser JPEG, PNG ou WebP.");
      return;
    }
    setErro(null);
    setEnviando(true);
    const f = await reduzir(original);
    if (f.size > LIMITE_MB * 1048576) {
      setEnviando(false);
      setErro(`a imagem tem ${tamanho(f.size)}; o limite é ${LIMITE_MB} MB.`);
      return;
    }
    const r = await enviarImagem(f);
    setEnviando(false);
    if (entrada.current) entrada.current.value = "";
    if (!r.ok) {
      setErro(r.erro);
      return;
    }
    setArquivo({ nome: f.name, tamanho: tamanho(f.size) });
    onMudar(r.imagem);
  };

  const soltar = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setArrastando(false);
    void escolher(e.dataTransfer.files[0]);
  };

  const descritores = [erro ? `${campo}-erro` : `${campo}-ajuda`, enviando && `${campo}-estado`]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="sdb-field">
      <span className="sdb-label" id={`${campo}-rotulo`}>
        {label}
        {opcional && <small>opcional</small>}
      </span>
      <div
        className={cx(
          "sdb-upload",
          quadrado && "sdb-upload--quadrado",
          valor && "has-file",
          erro && "is-error",
          disabled && "is-disabled",
        )}
      >
        {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: arrastar e soltar é atalho; o controle acessível é o input de arquivo dentro do rótulo. */}
        <label
          className={cx("sdb-upload__drop", arrastando && "is-over")}
          onDragEnter={(e) => {
            e.preventDefault();
            if (!disabled) setArrastando(true);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setArrastando(false);
          }}
          onDrop={soltar}
        >
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
            <Icon name="imagem" />
          </span>
          <span>
            <b>{enviando ? "Enviando imagem…" : "Escolher imagem"}</b>
            {!quadrado && !enviando && " ou arraste até aqui"}
          </span>
        </label>
        {valor && (
          <figure className="sdb-upload__preview">
            {/* biome-ignore lint/performance/noImgElement: imagem enviada pelo anfitrião, servida por /midia */}
            <img src={valor.url} alt="" />
            <figcaption className="sdb-upload__bar">
              <span className="sdb-upload__meta">
                <span className="sdb-upload__name">{arquivo?.nome ?? "Imagem enviada"}</span>
                {arquivo && <span className="sdb-upload__size">{arquivo.tamanho}</span>}
              </span>
              {!quadrado && (
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={disabled || enviando}
                  onClick={() => entrada.current?.click()}
                >
                  Trocar
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                disabled={disabled}
                onClick={() => {
                  setArquivo(null);
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
      </div>
      {erro ? (
        <p id={`${campo}-erro`} className="sdb-error-msg">
          <Icon name="erro" />
          <span>
            <b>Erro:</b> {erro}
          </span>
        </p>
      ) : (
        <p id={`${campo}-ajuda`} className="sdb-help">
          {help}
        </p>
      )}
      {enviando && (
        <span id={`${campo}-estado`} className="sdb-sr" aria-live="polite">
          Enviando imagem.
        </span>
      )}
    </div>
  );
}
