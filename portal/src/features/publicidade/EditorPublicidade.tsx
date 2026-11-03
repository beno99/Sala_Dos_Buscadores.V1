"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useState } from "react";
import { Button } from "@/components/ds/Button";
import { CampoTexto } from "@/components/ds/Campos";
import { AreaTexto } from "@/components/ds/CamposExtras";
import { useToast } from "@/components/ds/Toast";
import { CardPublicidade } from "./CardPublicidade";
import { validarPublicidade } from "./regras";
import {
  type AcaoPublicidade,
  type Anuncio,
  type FormPublicidade,
  formularioVazio,
  type ResultadoPublicidade,
} from "./tipos";
import { UploadPublicidade } from "./UploadPublicidade";
import "./publicidade.css";

const ORDEM_CAMPOS = [
  "imagemId",
  "alt",
  "categoria",
  "titulo",
  "descricao",
  "href",
  "textoLink",
  "anunciante",
];

export function EditorPublicidade({
  inicial,
  nomeAnunciante,
}: {
  inicial?: Anuncio;
  nomeAnunciante: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<FormPublicidade>(() =>
    inicial
      ? {
          imagemId: inicial.imagemId,
          alt: inicial.alt,
          categoria: inicial.categoria,
          titulo: inicial.titulo,
          descricao: inicial.descricao,
          href: inicial.href,
          textoLink: inicial.textoLink,
          anunciante: inicial.anunciante,
          enquadramento: inicial.enquadramento,
        }
      : formularioVazio(nomeAnunciante),
  );
  const [salvo, setSalvo] = useState<Anuncio | undefined>(inicial);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [mensagem, setMensagem] = useState("");
  const [falhou, setFalhou] = useState(false);
  const [acaoPendente, setAcaoPendente] = useState<AcaoPublicidade | null>(null);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const id = useRef(inicial?.id ?? null);
  const ocupado = useRef(false);
  const uploadOcupado = useRef(false);
  const formulario = useRef<HTMLFormElement>(null);
  const editando = !!salvo;
  const publicado = salvo?.status === "publicado";
  const bloqueado = !!acaoPendente || enviandoImagem;

  function mudar<K extends keyof FormPublicidade>(campo: K, valor: FormPublicidade[K]) {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
    setErros((anteriores) => {
      const proximos = { ...anteriores };
      delete proximos[campo];
      return proximos;
    });
    setMensagem("");
  }
  function mostrarErros(novos: Record<string, string>) {
    setErros(novos);
    const primeiro = ORDEM_CAMPOS.find((campo) => novos[campo]);
    requestAnimationFrame(() => {
      if (primeiro) formulario.current?.querySelector<HTMLElement>(`#publicidade-${primeiro}`)?.focus();
      else formulario.current?.querySelector<HTMLElement>("[role=alert]")?.focus();
    });
  }
  async function salvar(acao: AcaoPublicidade) {
    if (ocupado.current || uploadOcupado.current) return;
    const validacao = validarPublicidade(form, acao === "publicar" || publicado);
    if (Object.keys(validacao.erros).length) {
      mostrarErros(validacao.erros);
      setFalhou(true);
      setMensagem("Revise os campos indicados. Seus dados continuam aqui.");
      return;
    }
    ocupado.current = true;
    setAcaoPendente(acao);
    setErros({});
    setMensagem("");
    try {
      id.current ??= crypto.randomUUID();
      const resposta = await fetch("/api/publicidade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id.current, versao: salvo?.versao ?? 0, acao, form: validacao.form }),
      });
      const resultado: ResultadoPublicidade = await resposta.json();
      if (!resultado.ok) {
        setFalhou(true);
        setMensagem(resultado.mensagem);
        mostrarErros(resultado.erros ?? {});
        return;
      }
      if (!resposta.ok)
        throw new Error("Não foi possível confirmar o salvamento. Seus dados continuam aqui.");
      setSalvo(resultado.anuncio);
      setForm(validacao.form);
      setFalhou(false);
      setMensagem(resultado.mensagem);
      if (!editando) {
        toast(resultado.mensagem);
        router.replace(`/anfitriao/publicidade/${resultado.anuncio.id}` as Route);
      }
      router.refresh();
    } catch {
      setFalhou(true);
      setMensagem(
        "Não foi possível confirmar o salvamento. Verifique sua conexão e tente novamente. Seus dados continuam aqui.",
      );
    } finally {
      ocupado.current = false;
      setAcaoPendente(null);
    }
  }
  function enviar(e: FormEvent) {
    e.preventDefault();
    void salvar(editando ? "salvar" : "publicar");
  }
  const campos = {
    alt: {
      label: "Descrição da imagem (obrigatório)",
      limite: 500,
      help: "Descreva o que aparece na imagem para quem usa leitor de tela. Ex.: Frasco de sal grosso com folhas de guiné.",
    },
    categoria: {
      label: "Categoria ou especificação (opcional)",
      limite: 40,
      placeholder: "Incensos naturais",
    },
    titulo: { label: "Título do anúncio (obrigatório)", limite: 80, placeholder: "Sal grosso e guiné" },
    href: {
      label: "Link do produto (obrigatório)",
      help: "Use o endereço completo, começando com https:// ou http://.",
      type: "url",
      placeholder: "https://sualoja.com/produto",
    },
    textoLink: {
      label: "Texto do link (opcional)",
      limite: 30,
      help: "Se ficar vazio, usaremos Conhecer o produto.",
    },
    anunciante: { label: "Nome do anunciante (obrigatório)", limite: 80 },
  } satisfies Record<
    string,
    { label: string; limite?: number; help?: string; type?: string; placeholder?: string }
  >;
  function campo(nome: keyof typeof campos) {
    const configuracao: {
      label: string;
      limite?: number;
      help?: string;
      type?: string;
      placeholder?: string;
    } = campos[nome];
    return (
      <CampoTexto
        id={`publicidade-${nome}`}
        name={nome}
        label={configuracao.label}
        type={configuracao.type ?? "text"}
        placeholder={configuracao.placeholder}
        value={form[nome]}
        onChange={(e) => mudar(nome, e.target.value)}
        maxLength={configuracao.limite}
        aria-required={nome !== "categoria" && nome !== "textoLink"}
        error={erros[nome]}
        help={
          <>
            {configuracao.help && <span>{configuracao.help}</span>}
            {configuracao.limite && (
              <span className="sdb-publicidade-editor__contador">
                {form[nome].length} / {configuracao.limite} caracteres
              </span>
            )}
          </>
        }
      />
    );
  }
  return (
    <div className="sdb-publicidade-editor">
      <header className="sdb-publicidade-editor__cabecalho">
        <p className="sdb-publicidade-editor__sobretitulo">Seu espaço no Portal</p>
        <h1>{editando ? "Editar publicidade" : "Criar publicidade"}</h1>
        <p>Apresente seu produto para quem visita o Portal.</p>
      </header>
      <div className="sdb-publicidade-editor__colunas">
        <form ref={formulario} className="sdb-publicidade-editor__form" onSubmit={enviar} noValidate>
          <p className="sdb-help">
            Os campos obrigatórios são necessários para publicar. Você pode salvar um rascunho e continuar
            depois.
          </p>
          {mensagem && (
            <p
              className={`sdb-publicidade-editor__mensagem${falhou ? " is-error" : ""}`}
              role={falhou ? "alert" : "status"}
              tabIndex={-1}
            >
              {mensagem}
            </p>
          )}
          <fieldset className="sdb-publicidade-editor__campos" disabled={!!acaoPendente}>
            <legend className="sdb-publicidade__sr">Conteúdo do anúncio</legend>
            <UploadPublicidade
              imagemId={form.imagemId}
              alt={form.alt}
              enquadramento={form.enquadramento}
              erro={erros.imagemId}
              disabled={!!acaoPendente}
              onImagem={(valor) => mudar("imagemId", valor)}
              onEnquadramento={(valor) => mudar("enquadramento", valor)}
              onCarregando={(valor) => {
                uploadOcupado.current = valor;
                setEnviandoImagem(valor);
              }}
            />
            {erros.enquadramento && (
              <p className="sdb-error-msg" role="alert">
                {erros.enquadramento}
              </p>
            )}
            {campo("alt")}
            {campo("categoria")}
            {campo("titulo")}
            <AreaTexto
              id="publicidade-descricao"
              name="descricao"
              label="Descrição do anúncio (obrigatório)"
              help="Explique brevemente o que você oferece."
              value={form.descricao}
              onChange={(e) => mudar("descricao", e.target.value)}
              maxLength={240}
              contador
              rows={4}
              aria-required
              error={erros.descricao}
            />
            {campo("href")}
            {campo("textoLink")}
            {campo("anunciante")}
          </fieldset>
          <div className="sdb-publicidade-editor__acoes">
            {!editando && (
              <Button
                variant="secondary"
                disabled={bloqueado}
                loading={acaoPendente === "rascunho"}
                onClick={() => void salvar("rascunho")}
              >
                Salvar rascunho
              </Button>
            )}
            {editando && (
              <Button
                type="submit"
                variant={publicado ? "primary" : "secondary"}
                disabled={bloqueado}
                loading={acaoPendente === "salvar"}
              >
                Salvar alterações
              </Button>
            )}
            {!publicado && (
              <Button
                type={editando ? "button" : "submit"}
                variant="primary"
                disabled={bloqueado}
                loading={acaoPendente === "publicar"}
                onClick={editando ? () => void salvar("publicar") : undefined}
              >
                Publicar anúncio
              </Button>
            )}
          </div>
          <p className="sdb-help">
            {publicado
              ? "Ao salvar, as alterações aparecerão no Portal."
              : "O rascunho é privado. Ao publicar, seu anúncio aparecerá no Portal."}
          </p>
        </form>
        <aside className="sdb-publicidade-editor__previa" aria-labelledby="publicidade-previa-titulo">
          <h2 id="publicidade-previa-titulo">Assim seu anúncio aparecerá no Portal</h2>
          <CardPublicidade anuncio={form} previa />
          <p className="sdb-help">Prévia em tempo real. Os exemplos dos campos vazios não serão salvos.</p>
        </aside>
      </div>
    </div>
  );
}
