"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useRef, useState } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { Breadcrumbs } from "@/components/ds/Breadcrumbs";
import { Button } from "@/components/ds/Button";
import { CampoImagem, type ImagemEnviada } from "@/components/ds/CampoImagem";
import { CampoTexto } from "@/components/ds/Campos";
import { AreaTexto } from "@/components/ds/CamposExtras";
import { CardAnuncio } from "@/components/ds/CardAnuncio";
import { Slider } from "@/components/ds/Slider";
import { useToast } from "@/components/ds/Toast";
import { salvarAnuncioAcao } from "@/server/anfitriao/acoes";
import { AvisoSaida, focarCampo } from "../admin/ui/AvisoSaida";
import {
  CAMPOS_ANUNCIO,
  CHAMADA_PADRAO,
  type FormAnuncio,
  LIMITES_ANUNCIO,
  type ModoAnuncio,
  normalizarAnuncio,
  type StatusAnuncio,
  validarAnuncio,
} from "./regras";

const Obrigatorio = () => <small>obrigatório</small>;
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
 * do Portal. Rascunho aceita campos vazios e fica só com o anfitrião; publicar
 * exige todos os obrigatórios e a imagem (o servidor confere de novo).
 */
export function EditorAnuncio({
  inicial,
  imagem: imagemInicial,
  status,
}: {
  inicial: FormAnuncio;
  imagem: ImagemEnviada | null;
  status?: StatusAnuncio;
}) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState(inicial);
  const [imagem, setImagem] = useState(imagemInicial);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [sujo, setSujo] = useState(false);
  const [enviando, setEnviando] = useState<ModoAnuncio | null>(null);
  const [resultado, setResultado] = useState<{ ok: boolean; texto: string } | null>(null);
  const travado = useRef(false);
  const editando = Boolean(inicial.id);
  const publicado = status === "publicado";

  const mudar = (parcial: Partial<FormAnuncio>, campo?: string) => {
    setForm((f) => ({ ...f, ...parcial }));
    setSujo(true);
    setResultado(null);
    if (campo)
      setErros((e) => {
        const { [campo]: _x, ...resto } = e;
        return resto;
      });
  };

  const mostrarErros = (novos: Record<string, string>) => {
    setErros(novos);
    const primeiro = CAMPOS_ANUNCIO.find((c) => c in novos);
    if (primeiro) requestAnimationFrame(() => focarCampo(primeiro));
  };

  const enviar = async (modo: ModoAnuncio) => {
    if (travado.current) return;
    const locais = validarAnuncio(normalizarAnuncio(form), modo);
    if (Object.keys(locais).length) {
      setResultado({ ok: false, texto: "Confira os campos indicados. Nada foi perdido." });
      return mostrarErros(locais);
    }
    travado.current = true;
    setEnviando(modo);
    setResultado(null);
    try {
      const r = await salvarAnuncioAcao(form, modo);
      if (!r.ok) {
        const doServidor = (r as { erros?: Record<string, string> }).erros;
        if (doServidor) mostrarErros(doServidor);
        const texto = r.mensagem.replace(/^Erro: /, "");
        setResultado({ ok: false, texto });
        toast(texto, { variant: "erro", title: "Erro: o anúncio não foi salvo" });
        return;
      }
      setSujo(false);
      setResultado({ ok: true, texto: r.mensagem });
      toast(r.mensagem);
      if (!editando) router.replace(`/anfitriao/publicidade/${r.valor.id}` as Route);
      else router.refresh();
    } catch {
      const texto = "não foi possível falar com o servidor. Seus dados continuam aqui; tente de novo.";
      setResultado({ ok: false, texto });
      toast(texto, { variant: "erro", title: "Erro: o anúncio não foi salvo" });
    } finally {
      travado.current = false;
      setEnviando(null);
    }
  };

  const aoEnviar = (e: FormEvent) => {
    e.preventDefault();
    void enviar("publicar");
  };

  const ocupado = enviando !== null;

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        itens={[
          { href: "/anfitriao" as Route, rotulo: "Minhas Salas" },
          { href: "/anfitriao/publicidade" as Route, rotulo: "Publicidade" },
        ]}
        atual={editando ? "Editar publicidade" : "Criar publicidade"}
      />
      <header className="flex flex-col gap-3">
        <h1 className="sdb-title-1">{editando ? "Editar publicidade" : "Criar publicidade"}</h1>
        <p className="sdb-body-sm sdb-secondary max-w-read">
          Apresente seu produto para quem visita o Portal.
        </p>
        {editando && (
          <p className="sdb-footnote sdb-secondary">
            {publicado ? "Situação: publicado no Portal." : "Situação: rascunho, visível só para você."}
          </p>
        )}
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
        <form
          className="sdb-material sdb-panel flex flex-col gap-5"
          noValidate
          onSubmit={aoEnviar}
          aria-label={editando ? "Editar publicidade" : "Criar publicidade"}
          aria-busy={ocupado || undefined}
        >
          <p className="sdb-footnote sdb-secondary m-0">
            Campos marcados com “obrigatório” são exigidos para publicar. O rascunho pode ser salvo
            incompleto.
          </p>
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
            disabled={ocupado}
            onMudar={(img) => {
              setImagem(img);
              mudar({ midia: img?.id ?? null, ...(img ? {} : { focoX: 50, focoY: 50 }) }, "campo-imagem");
            }}
          />
          {imagem && (
            <fieldset className="sdb-field m-0 flex flex-col gap-3 border-0 p-0">
              <legend className="sdb-label">Enquadramento em 7:5</legend>
              <p className="sdb-help m-0">Escolha qual parte da imagem aparece no card. Confira na prévia.</p>
              <Slider
                label="Horizontal"
                min={0}
                max={100}
                step={1}
                value={form.focoX}
                format="{v}%"
                minLabel="Esquerda"
                maxLabel="Direita"
                disabled={ocupado}
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
                disabled={ocupado}
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
            aria-required="true"
            maxLength={LIMITES_ANUNCIO.alt}
            placeholder="Ex.: Pote de vidro com sal grosso e folhas de guiné sobre a mesa"
            help={ajuda(
              "Texto alternativo para quem usa leitor de tela. Diga o que aparece na imagem.",
              form.alt,
              LIMITES_ANUNCIO.alt,
            )}
            value={form.alt}
            error={erros["campo-alt"]}
            disabled={ocupado}
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
            disabled={ocupado}
            onChange={(e) => mudar({ categoria: e.target.value }, "campo-categoria")}
          />
          <CampoTexto
            id="campo-titulo"
            label={
              <>
                Título <Obrigatorio />
              </>
            }
            aria-required="true"
            maxLength={LIMITES_ANUNCIO.titulo}
            placeholder="Ex.: Sal grosso e guiné"
            help={ajuda("O nome do produto.", form.titulo, LIMITES_ANUNCIO.titulo)}
            value={form.titulo}
            error={erros["campo-titulo"]}
            disabled={ocupado}
            onChange={(e) => mudar({ titulo: e.target.value }, "campo-titulo")}
          />
          <AreaTexto
            id="campo-descricao"
            label={
              <>
                Descrição <Obrigatorio />
              </>
            }
            aria-required="true"
            rows={4}
            contador
            maxLength={LIMITES_ANUNCIO.descricao}
            help="Explique brevemente o que você oferece."
            value={form.descricao}
            error={erros["campo-descricao"]}
            disabled={ocupado}
            onChange={(e) => mudar({ descricao: e.target.value }, "campo-descricao")}
          />
          <CampoTexto
            id="campo-href"
            label={
              <>
                Link do produto <Obrigatorio />
              </>
            }
            aria-required="true"
            type="url"
            inputMode="url"
            maxLength={LIMITES_ANUNCIO.href}
            placeholder="https://sualoja.com/produto"
            help="Endereço completo, com http:// ou https://. Abre em nova aba."
            value={form.href}
            error={erros["campo-href"]}
            disabled={ocupado}
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
            disabled={ocupado}
            onChange={(e) => mudar({ chamada: e.target.value }, "campo-chamada")}
          />
          <CampoTexto
            id="campo-anunciante"
            label={
              <>
                Nome do anunciante <Obrigatorio />
              </>
            }
            aria-required="true"
            maxLength={LIMITES_ANUNCIO.anunciante}
            help={ajuda(
              "Vem do seu perfil público; pode mudar.",
              form.anunciante,
              LIMITES_ANUNCIO.anunciante,
            )}
            value={form.anunciante}
            error={erros["campo-anunciante"]}
            disabled={ocupado}
            onChange={(e) => mudar({ anunciante: e.target.value }, "campo-anunciante")}
          />

          {resultado && (
            <Alerta variant={resultado.ok ? "info" : "error"} title={resultado.ok ? "Pronto" : "Erro"}>
              {resultado.texto}
            </Alerta>
          )}

          <div className="sdb-row">
            <Button
              variant="secondary"
              loading={enviando === "rascunho"}
              disabled={ocupado}
              onClick={() => void enviar("rascunho")}
            >
              {editando && !publicado ? "Salvar alterações" : "Salvar rascunho"}
            </Button>
            <Button type="submit" variant="primary" loading={enviando === "publicar"} disabled={ocupado}>
              {publicado ? "Salvar alterações" : "Publicar anúncio"}
            </Button>
          </div>
          {publicado && (
            <p className="sdb-footnote sdb-secondary m-0">“Salvar rascunho” tira o anúncio do Portal.</p>
          )}
        </form>

        <section className="flex flex-col gap-3 lg:sticky lg:top-24" aria-labelledby="previa-anuncio">
          <h2 id="previa-anuncio" className="sdb-headline m-0">
            Assim seu anúncio aparecerá no Portal
          </h2>
          <CardAnuncio previa anuncio={{ ...form, imagem: imagem?.url ?? null }} />
        </section>
      </div>
      <AvisoSaida sujo={sujo && !ocupado} onDescartar={() => setSujo(false)} />
    </div>
  );
}
