"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ds/Button";
import { ImagemPublicidade } from "./ImagemPublicidade";
import { type Enquadramento, urlImagemPublicidade } from "./tipos";

export function UploadPublicidade({
  imagemId,
  alt,
  enquadramento,
  erro,
  disabled,
  onImagem,
  onEnquadramento,
  onCarregando,
}: {
  imagemId: string | null;
  alt: string;
  enquadramento: Enquadramento;
  erro?: string;
  disabled?: boolean;
  onImagem: (id: string) => void;
  onEnquadramento: (valor: Enquadramento) => void;
  onCarregando: (valor: boolean) => void;
}) {
  const entrada = useRef<HTMLInputElement>(null);
  const ocupado = useRef(false);
  const requisicao = useRef<AbortController | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [falha, setFalha] = useState("");
  const [arrastando, setArrastando] = useState(false);
  const [local, setLocal] = useState<string | null>(null);
  useEffect(
    () => () => {
      if (local) URL.revokeObjectURL(local);
    },
    [local],
  );
  useEffect(() => () => requisicao.current?.abort(), []);

  async function enviar(arquivo?: File) {
    if (!arquivo || ocupado.current || disabled) return;
    setFalha("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type)) {
      setFalha("Selecione uma imagem JPG, PNG ou WebP.");
      return;
    }
    if (arquivo.size > 5 * 1024 * 1024) {
      setFalha("A imagem deve ter até 5 MB.");
      return;
    }
    ocupado.current = true;
    onCarregando(true);
    setCarregando(true);
    setLocal(URL.createObjectURL(arquivo));
    const controller = new AbortController();
    requisicao.current = controller;
    try {
      const dados = new FormData();
      dados.set("arquivo", arquivo);
      const resposta = await fetch("/api/publicidade/imagens", {
        method: "POST",
        body: dados,
        signal: controller.signal,
      });
      const resultado = await resposta.json();
      if (!resposta.ok || !resultado.ok || !resultado.imagem?.id) {
        throw new Error(resultado.mensagem || "Não foi possível enviar a imagem. Tente novamente.");
      }
      onImagem(resultado.imagem.id);
      onEnquadramento({ x: 50, y: 50, zoom: 1 });
    } catch (error) {
      if (!controller.signal.aborted) {
        setFalha(
          error instanceof Error && !(error instanceof TypeError)
            ? error.message
            : "Não foi possível enviar a imagem. Verifique sua conexão e tente novamente.",
        );
      }
    } finally {
      ocupado.current = false;
      if (!controller.signal.aborted) {
        setLocal(null);
        setCarregando(false);
        onCarregando(false);
      }
    }
  }
  const src = local || (imagemId ? urlImagemPublicidade(imagemId) : null);
  const mensagemErro = falha || erro;
  return (
    <section className="sdb-publicidade-upload" aria-labelledby="publicidade-imagem-label">
      <h2 id="publicidade-imagem-label" className="sdb-label">
        Imagem do anúncio (obrigatório)
      </h2>
      {/* biome-ignore lint/a11y/noStaticElementInteractions lint/a11y/noNoninteractiveElementInteractions: arrastar complementa a seleção por botão e entrada nativos. */}
      <div
        className={`sdb-publicidade-upload__area${arrastando ? " is-dragging" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !carregando) setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastando(false);
          void enviar(e.dataTransfer.files[0]);
        }}
      >
        {src ? (
          <ImagemPublicidade src={src} alt={alt} enquadramento={enquadramento} />
        ) : (
          <p>Arraste a imagem do seu produto para cá</p>
        )}
        <input
          ref={entrada}
          type="file"
          className="sdb-publicidade__sr"
          tabIndex={-1}
          aria-label="Arquivo da imagem do anúncio"
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled || carregando}
          onChange={(e) => {
            void enviar(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <Button
          id="publicidade-imagemId"
          variant="secondary"
          disabled={disabled || carregando}
          loading={carregando}
          aria-invalid={!!mensagemErro}
          aria-describedby={`publicidade-imagem-ajuda${mensagemErro ? " publicidade-imagem-erro" : ""}`}
          onClick={() => entrada.current?.click()}
        >
          {carregando ? "Enviando imagem…" : imagemId ? "Substituir imagem" : "Selecionar imagem"}
        </Button>
        <p id="publicidade-imagem-ajuda" className="sdb-help">
          JPG, PNG ou WebP · até 5 MB · formato 7:5
        </p>
      </div>
      {mensagemErro && (
        <p id="publicidade-imagem-erro" className="sdb-error-msg" role="alert">
          {mensagemErro}
        </p>
      )}
      {imagemId && (
        <fieldset className="sdb-publicidade-upload__enquadramento" disabled={disabled || carregando}>
          <legend>Ajustar enquadramento</legend>
          <p className="sdb-help">Ajuste os controles com o mouse ou as setas do teclado.</p>
          {(
            [
              { chave: "x", label: "Posição horizontal", max: 100, step: 1 },
              { chave: "y", label: "Posição vertical", max: 100, step: 1 },
              { chave: "zoom", label: "Zoom", max: 3, step: 0.05 },
            ] as const
          ).map(({ chave, label, max, step }) => (
            <label key={chave} className="sdb-publicidade-upload__controle">
              <span>
                {label}{" "}
                <output>
                  {chave === "zoom" ? `${enquadramento[chave].toFixed(2)}×` : `${enquadramento[chave]}%`}
                </output>
              </span>
              <input
                type="range"
                min={chave === "zoom" ? 1 : 0}
                max={max}
                step={step}
                value={enquadramento[chave]}
                onChange={(e) => onEnquadramento({ ...enquadramento, [chave]: Number(e.target.value) })}
              />
            </label>
          ))}
          <Button variant="plain" size="sm" onClick={() => onEnquadramento({ x: 50, y: 50, zoom: 1 })}>
            Centralizar imagem
          </Button>
        </fieldset>
      )}
    </section>
  );
}
