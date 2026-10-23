"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { Button } from "@/components/ds/Button";
import { CampoTexto, Checkbox } from "@/components/ds/Campos";
import { Icon } from "@/components/ds/Icon";
import { useToast } from "@/components/ds/Toast";
import { useSessao } from "./SessaoProvider";
import { useEnvio } from "./useEnvio";
import { SENHA_MINIMA, validarEmail, validarPseudonimo, validarSenha } from "./validacao";

type Erros = { pseudonimo?: string; email?: string; senha?: string; consentimento?: string; geral?: string };

/**
 * Cadastro obrigatório (RF-01, RF-04). Pseudônimo é a identidade pública.
 * Interesses e religião ou convicção saíram daqui: são perguntados, de forma
 * opcional, no onboarding logo depois do cadastro (RF-07, RNF-LEG-02).
 */
export function FormCadastro({ voltar }: { voltar: string }) {
  const router = useRouter();
  const toast = useToast();
  const { cadastrar } = useSessao();
  const { enviando, enviar } = useEnvio();
  const [pseudonimo, setPseudonimo] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [consentimento, setConsentimento] = useState(false);
  const [erros, setErros] = useState<Erros>({});
  const qs = `?voltar=${encodeURIComponent(voltar)}`;

  const limpar = (campo: keyof Erros) => setErros((x) => ({ ...x, [campo]: undefined, geral: undefined }));

  const submeter = async (e: FormEvent) => {
    e.preventDefault();
    const novos: Erros = {
      pseudonimo: validarPseudonimo(pseudonimo) ?? undefined,
      email: validarEmail(email) ?? undefined,
      senha: validarSenha(senha) ?? undefined,
      consentimento: consentimento ? undefined : "marque a concordância para criar a conta.",
    };
    if (Object.values(novos).some(Boolean)) {
      setErros(novos);
      return;
    }
    const r = await enviar(() => cadastrar({ pseudonimo, email, senha }));
    if (!r.ok) {
      setErros(r.campo ? { [r.campo]: r.erro } : { geral: r.erro });
      return;
    }
    toast(`Conta criada. Você aparece como ${r.valor.pseudonimo}.`);
    router.push(voltar as Route);
    router.refresh();
  };

  return (
    <form className="sdb-conta__form" noValidate onSubmit={submeter} aria-labelledby="titulo-cadastro">
      <div className="sdb-conta__cabecalho">
        <h1 id="titulo-cadastro" className="sdb-conta__titulo">
          Criar conta
        </h1>
        <p className="sdb-conta__lead">
          A conta é gratuita e dá acesso a todo o acervo, à busca comparativa e ao assistente. Depois do
          cadastro, duas perguntas opcionais ajudam a sugerir por onde começar.
        </p>
      </div>

      {erros.geral && <Alerta variant="error" title={`Erro: ${erros.geral}`} />}

      <CampoTexto
        label="Pseudônimo"
        autoComplete="nickname"
        maxLength={40}
        value={pseudonimo}
        error={erros.pseudonimo}
        help="É o nome que outras pessoas veem. Não pedimos seu nome civil."
        onChange={(e) => {
          setPseudonimo(e.target.value);
          limpar("pseudonimo");
        }}
      />
      <CampoTexto
        label="E-mail"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        error={erros.email}
        help="Usado só para entrar e para redefinir a senha. Nunca aparece para outras pessoas."
        onChange={(e) => {
          setEmail(e.target.value);
          limpar("email");
        }}
      />
      <CampoTexto
        label="Senha"
        type="password"
        autoComplete="new-password"
        value={senha}
        error={erros.senha}
        help={`Mínimo de ${SENHA_MINIMA} caracteres.`}
        onChange={(e) => {
          setSenha(e.target.value);
          limpar("senha");
        }}
      />

      <div className="flex flex-col gap-2">
        <Checkbox
          label="Concordo com o uso do meu e-mail e pseudônimo para manter a conta"
          help="Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento."
          checked={consentimento}
          error={Boolean(erros.consentimento)}
          aria-describedby={erros.consentimento ? "erro-consentimento" : undefined}
          onChange={(e) => {
            setConsentimento(e.target.checked);
            limpar("consentimento");
          }}
        />
        {erros.consentimento && (
          <p id="erro-consentimento" className="sdb-error-msg">
            <Icon name="erro" />
            <span>
              <b>Erro:</b> {erros.consentimento}
            </span>
          </p>
        )}
      </div>

      <Button type="submit" variant="primary" size="lg" block loading={enviando}>
        Criar conta
      </Button>
      <p className="sdb-footnote sdb-conta__alternativa">
        Já tem conta?{" "}
        <Link href={`/entrar${qs}` as Route} className="sdb-link">
          Entrar
        </Link>
      </p>
    </form>
  );
}
