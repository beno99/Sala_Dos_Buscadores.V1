"use client";

import type { Route } from "next";
import { useState } from "react";
import { Accordion, AccordionItem } from "@/components/ds/Accordion";
import { Alerta } from "@/components/ds/Alerta";
import { Breadcrumbs } from "@/components/ds/Breadcrumbs";
import { Button } from "@/components/ds/Button";
import { CampoImagem, type ImagemEnviada } from "@/components/ds/CampoImagem";
import { CampoTexto } from "@/components/ds/Campos";
import { AreaTexto } from "@/components/ds/CamposExtras";
import { IndicadorSalvamento, SeloStatus } from "@/components/ds/Curadoria";
import { EspacoPublicitario } from "@/components/ds/EspacoPublicitario";
import { useToast } from "@/components/ds/Toast";
import type { StatusEditorial } from "@/data/types";
import { AvisoSaida, focarCampo } from "@/features/admin/ui/AvisoSaida";
import { useEdicao } from "@/features/admin/ui/useEdicao";
import { AcoesEnvio } from "@/features/anfitriao/ui/AcoesEnvio";
import {
  alertasDeLinguagem,
  CHAMADA_PADRAO,
  checklistEnvioAnuncio,
  type FormAnuncio,
  LIMITES_ANUNCIO,
} from "@/features/publicidade/regras";
import {
  enviarAnuncioAcao,
  excluirAnuncioAcao,
  retirarAnuncioAcao,
  salvarAnuncioAcao,
} from "@/server/anfitriao/acoes";

const ORDEM = [
  "campo-imagem",
  "campo-categoria",
  "campo-titulo",
  "campo-descricao",
  "campo-href",
  "campo-anunciante",
  "campo-chamada",
  "campo-textoAlternativo",
];

/** Rótulo com a indicação à direita ("Obrigatória", "Opcional" ou o contador "18/80"). */
function Rotulo({ texto, lado }: { texto: string; lado: string }) {
  return (
    <span className="sdb-ad-editor__label">
      {texto} <small aria-hidden="true">{lado}</small>
    </span>
  );
}

/**
 * Editor de anúncio (EditorAnuncio): formulário à esquerda e, à direita, o
 * anúncio exatamente como sai no Portal, ao vivo. O rascunho salva sozinho;
 * vai ao ar só com a aprovação da curadoria.
 */
export function EditorAnuncio({
  inicial,
  imagemInicial,
  status,
  atualizadoEm,
  jaPublicado,
  congelado,
  motivo,
}: {
  inicial: FormAnuncio;
  imagemInicial: ImagemEnviada | null;
  status: StatusEditorial;
  atualizadoEm: string | null;
  jaPublicado: boolean;
  congelado: boolean;
  motivo?: string;
}) {
  const toast = useToast();
  const [imagem, setImagem] = useState(imagemInicial);
  const publicado = status === "publicado";
  const travado = status === "em_revisao" || congelado;
  const edicao = useEdicao<FormAnuncio>({
    inicial,
    status,
    atualizadoEm,
    base: "/anfitriao/publicidade",
    salvar: salvarAnuncioAcao,
    podeSalvar: (f) => Boolean(f.titulo.trim()),
    automatico: !publicado && !travado,
  });
  const { form, mudar, erros, setErros, estado, hora, salvarAgora, sujo, setSujo } = edicao;
  const checklist = checklistEnvioAnuncio(form);
  const alertas = alertasDeLinguagem(form);

  const mostrarErros = (novos: Record<string, string>, mensagem: string) => {
    setErros(novos);
    const primeiro = ORDEM.find((c) => c in novos);
    if (primeiro) requestAnimationFrame(() => focarCampo(primeiro));
    toast("O foco foi para o primeiro campo com erro.", { variant: "erro", title: mensagem });
  };

  const salvarRascunho = async () => {
    const r = await salvarAgora("automatico");
    if (r?.ok) toast(r.mensagem);
    else if (r && !r.ok) mostrarErros(r.erros ?? {}, r.mensagem);
  };

  const conta = (campo: keyof typeof LIMITES_ANUNCIO) => `${form[campo].length}/${LIMITES_ANUNCIO[campo]}`;
  const titulo = form.titulo.trim() || (form.id ? "Sem título" : "Novo anúncio");

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        itens={[{ href: "/anfitriao/publicidade" as Route, rotulo: "Publicidade" }]}
        atual={titulo}
      />
      <header className="flex flex-col gap-3">
        <div className="sdb-row">
          <SeloStatus status={status} />
          <IndicadorSalvamento estado={estado} hora={hora} />
        </div>
        <h1 className="sdb-title-1">Seu produto, em boa companhia.</h1>
        <p className="sdb-body-sm sdb-secondary max-w-read">
          Crie sua publicidade e veja como ela aparecerá no Portal. A curadoria revisa cada anúncio antes de
          ele ir ao ar.
        </p>
      </header>
      {edicao.conflito && (
        <Alerta variant="error" title="Conflito de edição">
          {edicao.conflito}
        </Alerta>
      )}
      {status === "reprovado" && motivo && (
        <Alerta variant="warning" title="A curadoria pediu ajustes">
          {motivo}
        </Alerta>
      )}

      <div className="sdb-ad-editor">
        <form
          className="sdb-ad-editor__form"
          noValidate
          onSubmit={(e) => e.preventDefault()}
          aria-label="Edição do anúncio"
        >
          <fieldset disabled={travado} className="contents">
            <CampoImagem
              id="campo-imagem"
              label={<Rotulo texto="Imagem do produto" lado="Obrigatória" />}
              finalidade="anuncio"
              valor={imagem}
              disabled={travado}
              onMudar={(nova) => {
                setImagem(nova);
                mudar({ midia: nova?.id ?? null }, "campo-imagem");
              }}
            />
            {erros["campo-imagem"] && (
              <p className="sdb-error-msg" role="alert">
                <b>Erro:</b> {erros["campo-imagem"]}
              </p>
            )}
            <CampoTexto
              id="campo-categoria"
              label={<Rotulo texto="Categoria" lado="Opcional" />}
              maxLength={LIMITES_ANUNCIO.categoria}
              placeholder="Ex.: Livros e edições"
              value={form.categoria}
              error={erros["campo-categoria"]}
              onChange={(e) => mudar({ categoria: e.target.value }, "campo-categoria")}
            />
            <CampoTexto
              id="campo-titulo"
              label={<Rotulo texto="Título" lado={conta("titulo")} />}
              maxLength={LIMITES_ANUNCIO.titulo}
              placeholder="Ex.: Coleção de bolso de textos antigos"
              value={form.titulo}
              error={erros["campo-titulo"]}
              onChange={(e) => mudar({ titulo: e.target.value }, "campo-titulo")}
            />
            <AreaTexto
              id="campo-descricao"
              label="Descrição"
              rows={3}
              contador
              maxLength={LIMITES_ANUNCIO.descricao}
              placeholder="O que é o produto e para quem é, sem promessas."
              value={form.descricao}
              error={erros["campo-descricao"]}
              help={
                alertas.length
                  ? `Revise: ${[...new Set(alertas.map((a) => a.motivo))].join(", ")}. A curadoria recusa anúncios assim.`
                  : undefined
              }
              onChange={(e) => mudar({ descricao: e.target.value }, "campo-descricao")}
            />
            <CampoTexto
              id="campo-href"
              label="Link do produto"
              type="url"
              inputMode="url"
              placeholder="https://"
              help="Só endereços seguros, começando por https://"
              value={form.href}
              error={erros["campo-href"]}
              onChange={(e) => mudar({ href: e.target.value }, "campo-href")}
            />
            <CampoTexto
              id="campo-anunciante"
              label="Nome do anunciante"
              maxLength={LIMITES_ANUNCIO.anunciante}
              help="Aparece sempre junto do anúncio."
              value={form.anunciante}
              error={erros["campo-anunciante"]}
              onChange={(e) => mudar({ anunciante: e.target.value }, "campo-anunciante")}
            />
            <Accordion>
              <AccordionItem
                title="Texto do link e acessibilidade"
                defaultOpen={Boolean(erros["campo-textoAlternativo"] || erros["campo-chamada"])}
              >
                <div className="flex flex-col gap-4">
                  <CampoTexto
                    id="campo-chamada"
                    label="Texto do link"
                    maxLength={LIMITES_ANUNCIO.chamada}
                    placeholder={CHAMADA_PADRAO}
                    help={`Sem texto, usamos “${CHAMADA_PADRAO}”.`}
                    value={form.chamada}
                    error={erros["campo-chamada"]}
                    onChange={(e) => mudar({ chamada: e.target.value }, "campo-chamada")}
                  />
                  <CampoTexto
                    id="campo-textoAlternativo"
                    label="Descrição da imagem"
                    maxLength={LIMITES_ANUNCIO.textoAlternativo}
                    placeholder="Ex.: Três volumes de bolso empilhados sobre uma mesa de madeira."
                    help="Quem usa leitor de tela ouve esta descrição no lugar da imagem. Obrigatória para enviar."
                    value={form.textoAlternativo}
                    error={erros["campo-textoAlternativo"]}
                    onChange={(e) => mudar({ textoAlternativo: e.target.value }, "campo-textoAlternativo")}
                  />
                </div>
              </AccordionItem>
            </Accordion>
            {!publicado && !travado && (
              <div className="sdb-ad-editor__actions">
                <Button
                  variant="secondary"
                  onClick={salvarRascunho}
                  disabled={!form.titulo.trim() || estado === "salvando"}
                >
                  Salvar rascunho
                </Button>
              </div>
            )}
          </fieldset>
        </form>

        <aside className="sdb-ad-editor__preview" aria-label="Prévia do anúncio">
          <div className="sdb-ad-editor__preview-head">
            <p className="sdb-ad-editor__preview-title">Prévia do anúncio</p>
            <span className="sdb-ad-editor__live">Ao vivo</span>
          </div>
          <EspacoPublicitario
            variante="portal"
            onPorQue={() => {}}
            anuncio={{
              id: form.id ?? "previa",
              anunciante: form.anunciante.trim() || "Nome do anunciante",
              titulo: [form.titulo.trim() || "Título do anúncio", ""],
              texto: form.descricao.trim() || "A descrição do produto aparece aqui.",
              chamada: form.chamada.trim() || CHAMADA_PADRAO,
              href: form.href.trim() || "#",
              placa: "bege",
              imagem: imagem?.url,
              categoria: form.categoria.trim() || undefined,
              textoAlternativo: form.textoAlternativo.trim() || undefined,
            }}
          />
          <p className="sdb-ad-editor__caption">Assim seu anúncio aparecerá no Portal.</p>
          <AcoesEnvio
            item={{ artigo: "o", nome: "anúncio" }}
            titulo={form.titulo}
            status={status}
            jaPublicado={jaPublicado}
            congelado={congelado}
            checklist={checklist}
            sujo={sujo}
            salvando={estado === "salvando"}
            id={edicao.id.current}
            salvarAgora={salvarAgora}
            aoErro={mostrarErros}
            enviar={enviarAnuncioAcao}
            retirar={retirarAnuncioAcao}
            excluir={excluirAnuncioAcao}
            depoisDeExcluir={"/anfitriao/publicidade" as Route}
            destinoEnvio="no Portal, na coluna ao lado de “Seu caminho”"
          />
        </aside>
      </div>
      <AvisoSaida sujo={sujo && estado !== "salvando"} onDescartar={() => setSujo(false)} />
    </div>
  );
}
