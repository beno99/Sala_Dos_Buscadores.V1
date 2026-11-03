"use client";

import type { Route } from "next";
import { type ReactNode, useState } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { Breadcrumbs } from "@/components/ds/Breadcrumbs";
import { Button } from "@/components/ds/Button";
import { CampoImagem, type ImagemEnviada } from "@/components/ds/CampoImagem";
import { CampoTexto } from "@/components/ds/Campos";
import { AreaTexto } from "@/components/ds/CamposExtras";
import { CardAnuncio } from "@/components/ds/CardAnuncio";
import { IndicadorSalvamento, SeloStatus } from "@/components/ds/Curadoria";
import { Slider } from "@/components/ds/Slider";
import { useToast } from "@/components/ds/Toast";
import { AcoesEnvio } from "@/features/anfitriao/ui/AcoesEnvio";
import {
  enviarAnuncioAcao,
  excluirAnuncioAcao,
  retirarAnuncioAcao,
  salvarAnuncioAcao,
} from "@/server/anfitriao/acoes";
import { AvisoSaida, focarCampo } from "../admin/ui/AvisoSaida";
import { useEdicao } from "../admin/ui/useEdicao";
import {
  alertasDeLinguagem,
  CAMPOS_ANUNCIO,
  CHAMADA_PADRAO,
  checklistEnvioAnuncio,
  type FormAnuncio,
  LIMITES_ANUNCIO,
  type StatusAnuncio,
} from "./regras";

/** O formulário no editor: o id é nulo até o primeiro salvamento. */
export type FormEditorAnuncio = Omit<FormAnuncio, "id"> & { id: string | null };

const Obrigatorio = () => <small>obrigatório para enviar</small>;
const Opcional = () => <small>opcional</small>;

function Contador({ valor, limite }: { valor: string; limite: number }) {
  return (
    <span className="sdb-counter">
      {valor.length} / {limite}
    </span>
  );
}

function ajuda(texto: ReactNode, valor: string, limite: number) {
  return (
    <span className="flex justify-between gap-3">
      <span>{texto}</span>
      <Contador valor={valor} limite={limite} />
    </span>
  );
}

/**
 * Criar e editar a publicidade do anfitrião. A prévia usa o mesmo CardAnuncio
 * do Portal. O rascunho salva sozinho e aceita campos vazios; para ir ao ar o
 * anúncio é enviado à curadoria, que aprova ou devolve com o motivo. Editar
 * um anúncio no ar tira-o do ar até a nova aprovação.
 */
export function EditorAnuncio({
  inicial,
  imagem: imagemInicial,
  status,
  atualizadoEm,
  jaPublicado,
  congelado,
  motivo,
}: {
  inicial: FormEditorAnuncio;
  imagem: ImagemEnviada | null;
  status: StatusAnuncio;
  atualizadoEm: string | null;
  jaPublicado: boolean;
  congelado: boolean;
  motivo?: string;
}) {
  const toast = useToast();
  const [imagem, setImagem] = useState(imagemInicial);
  const publicado = status === "publicado";
  const travado = status === "em_revisao" || congelado;
  const edicao = useEdicao<FormEditorAnuncio>({
    inicial,
    status,
    atualizadoEm,
    base: "/anfitriao/publicidade",
    salvar: salvarAnuncioAcao,
    podeSalvar: (f) => Boolean(f.id || f.titulo.trim() || f.midia),
    automatico: !publicado && !travado,
  });
  const { form, mudar, erros, setErros, estado, hora, salvarAgora, sujo, setSujo } = edicao;
  const checklist = checklistEnvioAnuncio(form);
  const alertas = alertasDeLinguagem(form);
  const editando = Boolean(edicao.id.current);

  const mostrarErros = (novos: Record<string, string>, mensagem: string) => {
    setErros(novos);
    const primeiro = CAMPOS_ANUNCIO.find((c) => c in novos);
    if (primeiro) requestAnimationFrame(() => focarCampo(primeiro));
    toast("O foco foi para o primeiro campo com erro.", { variant: "erro", title: mensagem });
  };

  const salvarRascunho = async () => {
    const r = await salvarAgora("automatico");
    if (r?.ok) toast(r.mensagem);
    else if (r && !r.ok) mostrarErros(r.erros ?? {}, r.mensagem);
  };

  const ocupado = estado === "salvando";

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        itens={[{ href: "/anfitriao/publicidade" as Route, rotulo: "Publicidade" }]}
        atual={editando ? form.titulo.trim() || "Editar publicidade" : "Criar publicidade"}
      />
      <header className="flex flex-col gap-3">
        <div className="sdb-row">
          <SeloStatus status={status} />
          <IndicadorSalvamento estado={estado} hora={hora} />
        </div>
        <h1 className="sdb-title-1">{editando ? "Editar publicidade" : "Criar publicidade"}</h1>
        <p className="sdb-body-sm sdb-secondary max-w-read">
          Apresente seu produto para quem visita o Portal. A curadoria revisa cada anúncio antes de ele ir ao
          ar.
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

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
        <form
          className="sdb-material sdb-panel flex flex-col gap-5"
          noValidate
          onSubmit={(e) => e.preventDefault()}
          aria-label={editando ? "Editar publicidade" : "Criar publicidade"}
          aria-busy={ocupado || undefined}
        >
          <p className="sdb-footnote sdb-secondary m-0">
            O rascunho salva sozinho e pode ficar incompleto. Os campos “obrigatório para enviar” são cobrados
            quando você envia à curadoria.
          </p>
          <fieldset disabled={travado} className="contents">
            <CampoImagem
              id="campo-imagem"
              label={
                <>
                  Imagem do produto <Obrigatorio />
                </>
              }
              finalidade="anuncio"
              valor={imagem}
              error={erros["campo-imagem"]}
              disabled={travado}
              onMudar={(img) => {
                setImagem(img);
                mudar({ midia: img?.id ?? null, ...(img ? {} : { focoX: 50, focoY: 50 }) }, "campo-imagem");
              }}
            />
            {imagem && (
              <fieldset className="sdb-field m-0 flex flex-col gap-3 border-0 p-0">
                <legend className="sdb-label">Enquadramento em 7:5</legend>
                <p className="sdb-help m-0">
                  Escolha qual parte da imagem aparece no card. Confira na prévia.
                </p>
                <Slider
                  label="Horizontal"
                  min={0}
                  max={100}
                  step={1}
                  value={form.focoX}
                  format="{v}%"
                  minLabel="Esquerda"
                  maxLabel="Direita"
                  disabled={travado}
                  onChange={(e) => mudar({ focoX: e.target.valueAsNumber })}
                />
                <Slider
                  label="Vertical"
                  min={0}
                  max={100}
                  step={1}
                  value={form.focoY}
                  format="{v}%"
                  minLabel="Topo"
                  maxLabel="Base"
                  disabled={travado}
                  onChange={(e) => mudar({ focoY: e.target.valueAsNumber })}
                />
              </fieldset>
            )}
            <CampoTexto
              id="campo-alt"
              label={
                <>
                  Descrição da imagem <Obrigatorio />
                </>
              }
              maxLength={LIMITES_ANUNCIO.alt}
              placeholder="Ex.: Pote de vidro com sal grosso e folhas de guiné sobre a mesa"
              help={ajuda(
                "Texto alternativo para quem usa leitor de tela. Diga o que aparece na imagem.",
                form.alt,
                LIMITES_ANUNCIO.alt,
              )}
              value={form.alt}
              error={erros["campo-alt"]}
              onChange={(e) => mudar({ alt: e.target.value }, "campo-alt")}
            />
            <CampoTexto
              id="campo-categoria"
              label={
                <>
                  Categoria ou especificação <Opcional />
                </>
              }
              maxLength={LIMITES_ANUNCIO.categoria}
              placeholder="Ex.: Incensos naturais"
              help={ajuda("Aparece acima do título.", form.categoria, LIMITES_ANUNCIO.categoria)}
              value={form.categoria}
              error={erros["campo-categoria"]}
              onChange={(e) => mudar({ categoria: e.target.value }, "campo-categoria")}
            />
            <CampoTexto
              id="campo-titulo"
              label={
                <>
                  Título <Obrigatorio />
                </>
              }
              maxLength={LIMITES_ANUNCIO.titulo}
              placeholder="Ex.: Sal grosso e guiné"
              help={ajuda("O nome do produto.", form.titulo, LIMITES_ANUNCIO.titulo)}
              value={form.titulo}
              error={erros["campo-titulo"]}
              onChange={(e) => mudar({ titulo: e.target.value }, "campo-titulo")}
            />
            <AreaTexto
              id="campo-descricao"
              label={
                <>
                  Descrição <Obrigatorio />
                </>
              }
              rows={4}
              contador
              maxLength={LIMITES_ANUNCIO.descricao}
              help={
                alertas.length
                  ? `Revise: ${[...new Set(alertas.map((a) => a.motivo))].join(", ")}. A curadoria recusa anúncios assim.`
                  : "Explique brevemente o que você oferece, sem promessas."
              }
              value={form.descricao}
              error={erros["campo-descricao"]}
              onChange={(e) => mudar({ descricao: e.target.value }, "campo-descricao")}
            />
            <CampoTexto
              id="campo-href"
              label={
                <>
                  Link do produto <Obrigatorio />
                </>
              }
              type="url"
              inputMode="url"
              maxLength={LIMITES_ANUNCIO.href}
              placeholder="https://sualoja.com/produto"
              help="Endereço completo, com http:// ou https://. Abre em nova aba."
              value={form.href}
              error={erros["campo-href"]}
              onChange={(e) => mudar({ href: e.target.value }, "campo-href")}
            />
            <CampoTexto
              id="campo-chamada"
              label={
                <>
                  Texto do link <Opcional />
                </>
              }
              maxLength={LIMITES_ANUNCIO.chamada}
              placeholder={CHAMADA_PADRAO}
              help={ajuda(`Vazio, fica “${CHAMADA_PADRAO}”.`, form.chamada, LIMITES_ANUNCIO.chamada)}
              value={form.chamada}
              error={erros["campo-chamada"]}
              onChange={(e) => mudar({ chamada: e.target.value }, "campo-chamada")}
            />
            <CampoTexto
              id="campo-anunciante"
              label={
                <>
                  Nome do anunciante <Obrigatorio />
                </>
              }
              maxLength={LIMITES_ANUNCIO.anunciante}
              help={ajuda(
                "Vem do seu perfil público; pode mudar.",
                form.anunciante,
                LIMITES_ANUNCIO.anunciante,
              )}
              value={form.anunciante}
              error={erros["campo-anunciante"]}
              onChange={(e) => mudar({ anunciante: e.target.value }, "campo-anunciante")}
            />
            {!publicado && !travado && (
              <div className="sdb-row">
                <Button variant="secondary" loading={ocupado} disabled={ocupado} onClick={salvarRascunho}>
                  Salvar rascunho
                </Button>
              </div>
            )}
          </fieldset>
        </form>

        <section className="flex flex-col gap-3 lg:sticky lg:top-24" aria-labelledby="previa-anuncio">
          <h2 id="previa-anuncio" className="sdb-headline m-0">
            Assim seu anúncio aparecerá no Portal
          </h2>
          <CardAnuncio previa anuncio={{ ...form, imagem: imagem?.url ?? null }} />
          <AcoesEnvio
            item={{ artigo: "o", nome: "anúncio" }}
            titulo={form.titulo}
            status={status}
            jaPublicado={jaPublicado}
            congelado={congelado}
            checklist={checklist}
            sujo={sujo}
            salvando={ocupado}
            id={edicao.id.current}
            salvarAgora={salvarAgora}
            aoErro={mostrarErros}
            enviar={enviarAnuncioAcao}
            retirar={retirarAnuncioAcao}
            excluir={excluirAnuncioAcao}
            depoisDeExcluir={"/anfitriao/publicidade" as Route}
            destinoEnvio="no Portal, na coluna ao lado de “Seu caminho”"
          />
        </section>
      </div>
      <AvisoSaida sujo={sujo && !ocupado} onDescartar={() => setSujo(false)} />
    </div>
  );
}
