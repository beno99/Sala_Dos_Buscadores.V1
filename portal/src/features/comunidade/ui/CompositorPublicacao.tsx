"use client";
import Link from "next/link";
import { type FormEvent, useId, useState } from "react";
import { Button } from "@/components/ds/Button";
import { CampoImagem, type ImagemEnviada } from "@/components/ds/CampoImagem";
import { CampoTexto } from "@/components/ds/Campos";
import { AreaTexto, Select } from "@/components/ds/CamposExtras";
import { CompositorComunidade } from "@/components/ds/CompositorComunidade";
import { AvisoContextual } from "@/components/ds/EstadosInterface";
import { Icon, type IconName } from "@/components/ds/Icon";
import { Sheet } from "@/components/ds/Sheet";
import { useToast } from "@/components/ds/Toast";
import type { Publicacao, TipoPublicacao } from "@/data/types";
import { LIMITES_COMUNIDADE, TIPOS_PUBLICACAO } from "@/features/comunidade/regras";
import { editarPublicacaoAcao, publicarAcao } from "@/server/comunidade/acoes";
import type { OpcoesCompositor } from "@/server/comunidade/consultas";
import { useAcaoComunidade } from "./useAcaoComunidade";

export const ICONES_TIPO: Record<TipoPublicacao, IconName> = {
  reflexao: "editar",
  citacao: "fontePrimaria",
  pergunta: "assistente",
  achado: "biblioteca",
};

function Formulario({
  tipoInicial,
  edicao,
  opcoes,
  onFechar,
}: {
  tipoInicial: TipoPublicacao;
  edicao?: Publicacao;
  opcoes: OpcoesCompositor;
  onFechar: () => void;
}) {
  const toast = useToast();
  const { pendente, executar } = useAcaoComunidade();
  const [tipo, setTipo] = useState(tipoInicial);
  const [texto, setTexto] = useState(edicao?.texto ?? "");
  const [citacao, setCitacao] = useState(edicao?.citacao ?? { trecho: "", obra: "", passagem: "" });
  const [salaSlug, setSalaSlug] = useState(edicao?.salaSlug ?? "");
  const [temas, setTemas] = useState<string[]>(edicao?.temas ?? []);
  const [conteudoId, setConteudoId] = useState(edicao?.conteudoId ?? "");
  const [buscaConteudo, setBuscaConteudo] = useState("");
  const [dirigida, setDirigida] = useState(Boolean(edicao?.perguntaDirigidaA));
  const [imagem, setImagem] = useState<ImagemEnviada | null>(
    edicao?.imagem ? { id: edicao.imagem.src.split("/").pop() ?? "", url: edicao.imagem.src } : null,
  );
  const [alt, setAlt] = useState(edicao?.imagem?.alt ?? "");
  const anfitriao = opcoes.salas.find((s) => s.slug === salaSlug)?.anfitriao;
  const conteudos = opcoes.conteudos.filter(
    (c) =>
      c.id === conteudoId ||
      `${c.titulo} ${c.salaNome}`
        .toLocaleLowerCase("pt-BR")
        .includes(buscaConteudo.toLocaleLowerCase("pt-BR")),
  );
  const faltando =
    !texto.trim() ||
    (tipo === "citacao" && !(citacao.trecho.trim() && citacao.obra.trim() && citacao.passagem.trim())) ||
    (tipo === "pergunta" && !salaSlug) ||
    (tipo === "achado" && !conteudoId) ||
    (Boolean(imagem) && !alt.trim());
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const form = {
      tipo,
      texto,
      salaSlug: salaSlug || undefined,
      temas,
      imagemId: imagem?.id,
      imagemAlt: alt,
      citacao: tipo === "citacao" ? citacao : undefined,
      conteudoId: tipo === "achado" ? conteudoId : undefined,
      dirigirAoAnfitriao: dirigida,
    };
    executar(
      () => (edicao ? editarPublicacaoAcao(edicao.id, form) : publicarAcao(form)),
      undefined,
      onFechar,
    );
  };
  return (
    <CompositorComunidade
      onSubmit={enviar}
      tipos={Object.entries(TIPOS_PUBLICACAO).map(([chave, nome]) => (
        <label className="sdb-composer__type" key={chave}>
          <input
            type="radio"
            name="tipo"
            value={chave}
            checked={tipo === chave}
            disabled={Boolean(edicao)}
            onChange={() => setTipo(chave as TipoPublicacao)}
          />
          <span>
            <Icon name={ICONES_TIPO[chave as TipoPublicacao]} />
            {nome}
          </span>
        </label>
      ))}
      acoes={
        <>
          <Link className="sdb-link" href="/comunidade/regras" target="_blank">
            Regras da comunidade
          </Link>
          <Button type="submit" variant="primary" disabled={faltando || pendente}>
            {edicao ? "Salvar" : "Publicar"}
          </Button>
        </>
      }
    >
      <AreaTexto
        label="O que você está estudando?"
        rows={4}
        required
        contador={texto.length > LIMITES_COMUNIDADE.texto - 200}
        maxLength={LIMITES_COMUNIDADE.texto}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
      {tipo === "reflexao" && (
        <AvisoContextual titulo="Atribua a uma fonte">
          Ao afirmar algo sobre um texto, indique a obra e a passagem.
        </AvisoContextual>
      )}
      {tipo === "citacao" && (
        <>
          <AreaTexto
            label="Trecho"
            rows={3}
            required
            maxLength={LIMITES_COMUNIDADE.texto}
            value={citacao.trecho}
            onChange={(e) => setCitacao({ ...citacao, trecho: e.target.value })}
          />
          <CampoTexto
            label="Obra"
            required
            maxLength={LIMITES_COMUNIDADE.referencia}
            value={citacao.obra}
            onChange={(e) => setCitacao({ ...citacao, obra: e.target.value })}
          />
          <CampoTexto
            label="Passagem"
            required
            maxLength={LIMITES_COMUNIDADE.referencia}
            value={citacao.passagem}
            onChange={(e) => setCitacao({ ...citacao, passagem: e.target.value })}
          />
        </>
      )}
      {tipo === "achado" && (
        <>
          <CampoTexto
            label="Buscar conteúdo do acervo"
            type="search"
            value={buscaConteudo}
            onChange={(e) => setBuscaConteudo(e.target.value)}
          />
          <Select
            label="Conteúdo encontrado"
            required
            value={conteudoId}
            onChange={(e) => setConteudoId(e.target.value)}
            opcoes={[
              { value: "", label: "Escolha um conteúdo" },
              ...conteudos.map((c) => ({ value: c.id, label: `${c.titulo} · ${c.salaNome}` })),
            ]}
          />
        </>
      )}
      <div className="sdb-composer__context">
        {tipo !== "achado" && (
          <Select
            className="sdb-composer__room"
            label={tipo === "pergunta" ? "Sala" : "Sala (opcional)"}
            required={tipo === "pergunta"}
            value={salaSlug}
            onChange={(e) => {
              setSalaSlug(e.target.value);
              setDirigida(false);
            }}
            opcoes={[
              { value: "", label: "Escolha uma Sala" },
              ...opcoes.salas.map((s) => ({ value: s.slug, label: s.nome })),
            ]}
          />
        )}
        {tipo === "pergunta" && anfitriao && (
          <Select
            label="Dirigida a (opcional)"
            value={dirigida ? "anfitriao" : ""}
            onChange={(e) => setDirigida(e.target.value === "anfitriao")}
            opcoes={[
              { value: "", label: "Todos os buscadores" },
              { value: "anfitriao", label: anfitriao },
            ]}
          />
        )}
        <details className="sdb-composer__optional">
          <summary>Adicionar temas</summary>
          <fieldset className="sdb-composer__types">
            <legend className="sdb-label">
              Temas <small>opcionais · até 3</small>
            </legend>
            {opcoes.temas.map((t) => (
              <label className="sdb-composer__type" key={t.slug}>
                <input
                  type="checkbox"
                  checked={temas.includes(t.slug)}
                  disabled={!temas.includes(t.slug) && temas.length >= LIMITES_COMUNIDADE.temas}
                  onChange={(e) =>
                    setTemas(e.target.checked ? [...temas, t.slug] : temas.filter((x) => x !== t.slug))
                  }
                />
                <span>{t.nome}</span>
              </label>
            ))}
          </fieldset>
        </details>
        <details className="sdb-composer__optional" open={Boolean(imagem)}>
          <summary>Imagem</summary>
          <CampoImagem
            label="Imagem"
            opcional
            help="Envie apenas imagens que você tem direito de usar. JPEG, PNG ou WebP, até 5 MB."
            valor={imagem}
            onMudar={(i) => {
              setImagem(i);
              if (!i) toast("Imagem removida.");
            }}
          />
          {imagem && (
            <CampoTexto
              label="Descrição da imagem"
              required
              maxLength={LIMITES_COMUNIDADE.descricaoImagem}
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
            />
          )}
        </details>
      </div>
      <aside className="sdb-neutral sdb-neutral--community" aria-label="Aviso de neutralidade">
        <span className="sdb-neutral__icon">
          <Icon name="comunidade" />
        </span>
        <p>
          Compartilhamos estudos, não verdades sobre crenças. Atribua afirmações às fontes e acolha leituras
          diferentes.
        </p>
      </aside>
    </CompositorComunidade>
  );
}

export function CompositorPublicacao({
  aberto,
  tipo = "reflexao",
  edicao,
  opcoes,
  onFechar,
}: {
  aberto: boolean;
  tipo?: TipoPublicacao;
  edicao?: Publicacao;
  opcoes: OpcoesCompositor;
  onFechar: () => void;
}) {
  const id = useId();
  return (
    <Sheet
      aberto={aberto}
      onFechar={onFechar}
      rotuloId={id}
      className="sdb-community-dialog sdb-community-dialog--composer"
    >
      <header className="sdb-community-dialog__head">
        <h2 id={id} className="sdb-title-2">
          {edicao ? "Editar publicação" : "Nova publicação"}
        </h2>
        <Button
          variant="plain"
          iconOnly
          icon="fechar"
          data-tip-align="end"
          aria-label="Fechar compositor"
          onClick={onFechar}
        />
      </header>
      <div className="sdb-community-dialog__body">
        {aberto && (
          <Formulario
            tipoInicial={edicao?.tipo ?? tipo}
            edicao={edicao}
            opcoes={opcoes}
            onFechar={onFechar}
          />
        )}
      </div>
    </Sheet>
  );
}
