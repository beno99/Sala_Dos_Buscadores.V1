"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { Button } from "@/components/ds/Button";
import { CampoTexto, Checkbox } from "@/components/ds/Campos";
import { AreaTexto } from "@/components/ds/CamposExtras";
import { Icon } from "@/components/ds/Icon";
import { useToast } from "@/components/ds/Toast";
import { SENHA_MINIMA, validarEmail, validarPseudonimo, validarSenha } from "@/features/auth/validacao";
import { cadastrarComoAnfitriaoAcao } from "@/server/anfitriao/cadastro-publico";
import { focarCampo } from "../../admin/ui/AvisoSaida";
import {
  type FormCandidatura,
  LIMITE_APRESENTACAO,
  LIMITE_CREDENCIAL,
  validarCandidatura,
} from "../regras/perfil";

const ORDEM = [
  "campo-pseudonimo",
  "campo-email",
  "campo-senha",
  "campo-nome",
  "campo-credencial",
  "campo-apresentacao",
  "campo-link",
  "campo-consentimento",
];

export function FormCadastroAnfitriao() {
  const router = useRouter();
  const toast = useToast();
  const [pseudonimo, setPseudonimo] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [form, setForm] = useState<FormCandidatura>({ nome: "", credencial: "", apresentacao: "", link: "" });
  const [consentimento, setConsentimento] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [geral, setGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const limpar = (campo: string) => {
    setGeral(null);
    setErros((e) => {
      const { [campo]: _x, ...resto } = e;
      return resto;
    });
  };
  const mudar = (parcial: Partial<FormCandidatura>, campo: string) => {
    setForm((f) => ({ ...f, ...parcial }));
    limpar(campo);
  };
  const mostrarErros = (novos: Record<string, string>) => {
    setErros(novos);
    const primeiro = ORDEM.find((c) => c in novos);
    if (primeiro) requestAnimationFrame(() => focarCampo(primeiro));
  };

  const nomePublico = form.nome.trim() ? form.nome : pseudonimo;

  const submeter = async (e: FormEvent) => {
    e.preventDefault();
    const candidatura = { ...form, nome: nomePublico };
    const novos: Record<string, string> = {};
    const ep = validarPseudonimo(pseudonimo);
    const ee = validarEmail(email);
    const es = validarSenha(senha);
    if (ep) novos["campo-pseudonimo"] = ep;
    if (ee) novos["campo-email"] = ee;
    if (es) novos["campo-senha"] = es;
    Object.assign(novos, validarCandidatura(candidatura));
    if (!consentimento) novos["campo-consentimento"] = "marque a concordância para criar a conta.";
    if (Object.keys(novos).length) return mostrarErros(novos);
    setEnviando(true);
    const r = await cadastrarComoAnfitriaoAcao({ pseudonimo, email, senha }, candidatura);
    setEnviando(false);
    if (!r.ok) {
      if ("contaCriada" in r && r.contaCriada) {
        toast(r.mensagem.replace(/^Erro: /, ""), {
          variant: "erro",
          title: "Erro: a candidatura não foi enviada",
        });
        router.push("/ajustes" as Route);
        return;
      }
      if ("erros" in r && r.erros) mostrarErros(r.erros);
      else setGeral(r.mensagem.replace(/^Erro: /, ""));
      return;
    }
    toast(r.mensagem);
    router.push("/confirmar-email" as Route);
    router.refresh();
  };

  return (
    <form className="sdb-conta__form" noValidate onSubmit={submeter} aria-labelledby="titulo-anfitriao">
      <div className="sdb-conta__cabecalho">
        <h1 id="titulo-anfitriao" className="sdb-conta__titulo">
          Seja anfitrião
        </h1>
        <p className="sdb-conta__lead">
          Anfitriões mantêm Salas próprias, com leituras assinadas. Crie sua conta e envie a candidatura: a
          curadoria analisa e responde por e-mail. Tudo o que você publicar passa pela revisão antes de ir ao
          ar.
        </p>
      </div>

      {geral && <Alerta variant="error" title={`Erro: ${geral}`} />}

      <fieldset className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
        <legend className="sdb-headline px-0 pt-0 pb-2">Sua conta</legend>
        <CampoTexto
          id="campo-pseudonimo"
          label="Nome de exibição"
          autoComplete="nickname"
          maxLength={40}
          value={pseudonimo}
          error={erros["campo-pseudonimo"]}
          help="É o nome que outras pessoas veem na comunidade."
          onChange={(e) => {
            setPseudonimo(e.target.value);
            limpar("campo-pseudonimo");
          }}
        />
        <CampoTexto
          id="campo-email"
          label="E-mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          error={erros["campo-email"]}
          help="Usado para entrar e para a resposta da curadoria. Nunca aparece para outras pessoas."
          onChange={(e) => {
            setEmail(e.target.value);
            limpar("campo-email");
          }}
        />
        <CampoTexto
          id="campo-senha"
          label="Senha"
          type="password"
          autoComplete="new-password"
          value={senha}
          error={erros["campo-senha"]}
          help={`Mínimo de ${SENHA_MINIMA} caracteres.`}
          onChange={(e) => {
            setSenha(e.target.value);
            limpar("campo-senha");
          }}
        />
      </fieldset>

      <fieldset className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
        <legend className="sdb-headline px-0 pt-0 pb-2">Sua candidatura</legend>
        <CampoTexto
          id="campo-nome"
          label={
            <>
              Nome público <small>opcional</small>
            </>
          }
          placeholder={pseudonimo || undefined}
          help="Como aparece na assinatura das suas Salas e artigos. Em branco, vale o nome de exibição."
          value={form.nome}
          error={erros["campo-nome"]}
          onChange={(e) => mudar({ nome: e.target.value }, "campo-nome")}
        />
        <CampoTexto
          id="campo-credencial"
          label="Credencial"
          maxLength={LIMITE_CREDENCIAL}
          placeholder="Ex.: Mestranda em história das religiões"
          help="Uma linha: de onde vem seu conhecimento do tema."
          value={form.credencial}
          error={erros["campo-credencial"]}
          onChange={(e) => mudar({ credencial: e.target.value }, "campo-credencial")}
        />
        <AreaTexto
          id="campo-apresentacao"
          label="Apresentação"
          rows={5}
          contador
          maxLength={LIMITE_APRESENTACAO}
          placeholder="Ex.: Estudo os códices de Nag Hammadi e gostaria de manter leituras comentadas do Evangelho de Tomé, sempre indicando a edição usada."
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
      </fieldset>

      <div className="flex flex-col gap-2">
        <Checkbox
          id="campo-consentimento"
          label="Concordo com o uso do meu e-mail, pseudônimo e candidatura para manter a conta e avaliar o pedido"
          help="Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento."
          checked={consentimento}
          error={Boolean(erros["campo-consentimento"])}
          aria-describedby={erros["campo-consentimento"] ? "erro-consentimento" : undefined}
          onChange={(e) => {
            setConsentimento(e.target.checked);
            limpar("campo-consentimento");
          }}
        />
        {erros["campo-consentimento"] && (
          <p id="erro-consentimento" className="sdb-error-msg">
            <Icon name="erro" />
            <span>
              <b>Erro:</b> {erros["campo-consentimento"]}
            </span>
          </p>
        )}
      </div>

      <Button type="submit" variant="primary" size="lg" block loading={enviando}>
        Criar conta e enviar candidatura
      </Button>
      <p className="sdb-footnote sdb-conta__alternativa">
        Já tem conta?{" "}
        <Link href={"/entrar?voltar=%2Fajustes" as Route} className="sdb-link">
          Entre e se candidate nos Ajustes
        </Link>
      </p>
    </form>
  );
}
