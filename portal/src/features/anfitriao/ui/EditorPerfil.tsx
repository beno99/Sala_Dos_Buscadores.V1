"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { Breadcrumbs } from "@/components/ds/Breadcrumbs";
import { Button } from "@/components/ds/Button";
import { CampoImagem, type ImagemEnviada } from "@/components/ds/CampoImagem";
import { CampoTexto } from "@/components/ds/Campos";
import { AreaTexto } from "@/components/ds/CamposExtras";
import { useToast } from "@/components/ds/Toast";
import { salvarPerfilAcao } from "@/server/anfitriao/acoes";
import { AvisoSaida, focarCampo } from "../../admin/ui/AvisoSaida";
import {
  type FormPerfil,
  LIMITE_APRESENTACAO,
  LIMITE_CREDENCIAL,
  slugDoNome,
  validarPerfil,
} from "../regras/perfil";

const ORDEM = ["campo-nome", "campo-slug", "campo-credencial", "campo-apresentacao", "campo-link"];

/**
 * Perfil público do anfitrião (§2): nome, endereço, credencial, apresentação,
 * avatar e link. A edição não passa por revisão, mas fica no histórico.
 */
export function EditorPerfil({
  inicial,
  avatar: avatarInicial,
  boasVindas,
}: {
  inicial: FormPerfil;
  avatar: ImagemEnviada | null;
  boasVindas: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState(inicial);
  const [avatar, setAvatar] = useState(avatarInicial);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [sujo, setSujo] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const mudar = (parcial: Partial<FormPerfil>, campo?: string) => {
    setForm((f) => ({ ...f, ...parcial }));
    setSujo(true);
    if (campo)
      setErros((e) => {
        const { [campo]: _x, ...resto } = e;
        return resto;
      });
  };

  const mostrarErros = (novos: Record<string, string>) => {
    setErros(novos);
    const primeiro = ORDEM.find((c) => c in novos);
    if (primeiro) requestAnimationFrame(() => focarCampo(primeiro));
  };

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    const locais = validarPerfil(form, []);
    if (Object.keys(locais).length) return mostrarErros(locais);
    setSalvando(true);
    const r = await salvarPerfilAcao(form);
    setSalvando(false);
    if (!r.ok) {
      const doServidor = (r as { erros?: Record<string, string> }).erros;
      if (doServidor) mostrarErros(doServidor);
      toast(r.mensagem.replace(/^Erro: /, ""), { variant: "erro", title: "Erro: o perfil não foi salvo" });
      return;
    }
    setSujo(false);
    toast(r.mensagem);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs itens={[{ href: "/anfitriao" as Route, rotulo: "Minhas Salas" }]} atual="Perfil público" />
      <header className="flex flex-col gap-3">
        <h1 className="sdb-title-1">Perfil público</h1>
        <p className="sdb-body-sm sdb-secondary max-w-read">
          Aparece na sua página de anfitrião e na assinatura das Salas e dos artigos. A edição vale na hora,
          sem revisão, e fica no histórico da curadoria.
        </p>
      </header>
      {boasVindas && (
        <Alerta title="Boas-vindas, anfitrião">
          Complete seu perfil para começar. Depois, crie sua primeira Sala em Minhas Salas.
        </Alerta>
      )}
      <form
        className="sdb-material sdb-panel max-w-read"
        noValidate
        onSubmit={salvar}
        aria-label="Perfil público"
      >
        <CampoTexto
          id="campo-nome"
          label="Nome público"
          maxLength={80}
          placeholder="Ex.: Helena Varga"
          value={form.nome}
          error={erros["campo-nome"]}
          onChange={(e) => mudar({ nome: e.target.value }, "campo-nome")}
        />
        <div className="flex flex-col gap-2">
          <CampoTexto
            id="campo-slug"
            label="Endereço da página"
            value={form.slug}
            error={erros["campo-slug"]}
            help={`Fica: /anfitrioes/${form.slug || "…"}`}
            onChange={(e) => mudar({ slug: e.target.value.toLowerCase() }, "campo-slug")}
          />
          <div>
            <Button
              variant="plain"
              size="sm"
              icon="regenerar"
              disabled={!form.nome.trim()}
              onClick={() => mudar({ slug: slugDoNome(form.nome) }, "campo-slug")}
            >
              Gerar do nome
            </Button>
          </div>
        </div>
        <CampoTexto
          id="campo-credencial"
          label="Credencial"
          maxLength={LIMITE_CREDENCIAL}
          placeholder="Ex.: Pesquisadora de literatura copta"
          help="Uma linha, em texto simples. Aparece abaixo do seu nome."
          value={form.credencial}
          error={erros["campo-credencial"]}
          onChange={(e) => mudar({ credencial: e.target.value }, "campo-credencial")}
        />
        <AreaTexto
          formatacao
          id="campo-apresentacao"
          label="Apresentação"
          rows={5}
          contador
          maxLength={LIMITE_APRESENTACAO}
          placeholder="Ex.: Estudo os códices de Nag Hammadi. Nas minhas Salas, cada leitura indica a edição usada."
          value={form.apresentacao}
          error={erros["campo-apresentacao"]}
          onChange={(e) => mudar({ apresentacao: e.target.value }, "campo-apresentacao")}
        />
        <CampoTexto
          id="campo-link"
          label={
            <>
              Site ou canal <small>opcional</small>
            </>
          }
          type="url"
          inputMode="url"
          placeholder="https://"
          value={form.link}
          error={erros["campo-link"]}
          onChange={(e) => mudar({ link: e.target.value }, "campo-link")}
        />
        <CampoImagem
          id="campo-avatar"
          label="Avatar"
          opcional
          quadrado
          help="Quadrado, JPEG, PNG ou WebP, até 5 MB. Sem avatar, suas iniciais."
          valor={avatar}
          onMudar={(img) => {
            setAvatar(img);
            mudar({ avatar: img?.id ?? null });
          }}
        />
        <div>
          <Button type="submit" variant="primary" loading={salvando} disabled={!sujo}>
            Salvar perfil
          </Button>
        </div>
      </form>
      <AvisoSaida sujo={sujo && !salvando} onDescartar={() => setSujo(false)} />
    </div>
  );
}
