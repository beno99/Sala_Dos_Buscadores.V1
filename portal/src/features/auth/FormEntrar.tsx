"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { Button } from "@/components/ds/Button";
import { CampoTexto } from "@/components/ds/Campos";
import { useToast } from "@/components/ds/Toast";
import { useSessao } from "./SessaoProvider";
import { useEnvio } from "./useEnvio";
import { validarEmail } from "./validacao";

/** Entrar com e-mail e senha (RF-02). A conta é obrigatória para usar o portal. */
export function FormEntrar({ voltar, dica }: { voltar: string; dica?: { email: string; senha: string } }) {
  const router = useRouter();
  const toast = useToast();
  const { entrar } = useSessao();
  const { enviando, enviar } = useEnvio();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erros, setErros] = useState<{ email?: string; senha?: string; geral?: string }>({});
  const qs = `?voltar=${encodeURIComponent(voltar)}`;

  const submeter = async (e: FormEvent) => {
    e.preventDefault();
    const novos = {
      email: validarEmail(email) ?? undefined,
      senha: senha ? undefined : "escreva sua senha.",
    };
    if (novos.email || novos.senha) {
      setErros(novos);
      return;
    }
    const r = await enviar(() => entrar(email, senha));
    if (!r.ok) {
      setErros({ geral: r.erro });
      return;
    }
    toast(`Você entrou como ${r.valor.pseudonimo}.`);
    router.push(voltar as Route);
    router.refresh();
  };

  return (
    <form
      className="sdb-conta__form sdb-conta__form--entrar"
      noValidate
      onSubmit={submeter}
      aria-labelledby="titulo-entrar"
    >
      <div className="sdb-conta__cabecalho">
        <h1 id="titulo-entrar" className="sdb-conta__titulo">
          Entrar
        </h1>
        <p className="sdb-conta__lead">
          Entre para estudar no acervo. A conta é gratuita e guarda seu progresso só para você.
        </p>
      </div>

      {erros.geral && <Alerta variant="error" title={`Erro: ${erros.geral}`} />}

      <CampoTexto
        label="E-mail"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        error={erros.email}
        onChange={(e) => {
          setEmail(e.target.value);
          setErros((x) => ({ ...x, email: undefined, geral: undefined }));
        }}
      />
      <CampoTexto
        label="Senha"
        type="password"
        autoComplete="current-password"
        value={senha}
        error={erros.senha}
        onChange={(e) => {
          setSenha(e.target.value);
          setErros((x) => ({ ...x, senha: undefined, geral: undefined }));
        }}
      />
      <Link href={`/recuperar-senha${qs}` as Route} className="sdb-link self-start">
        Esqueci minha senha
      </Link>

      <Button type="submit" variant="primary" size="lg" block loading={enviando}>
        Entrar
      </Button>
      <p className="sdb-footnote sdb-conta__alternativa">
        Ainda não tem conta?{" "}
        <Link href={`/cadastro${qs}` as Route} className="sdb-link">
          Criar conta
        </Link>
      </p>
      {dica && (
        <p className="sdb-help sdb-conta__dica">
          Protótipo: use {dica.email} e a senha {dica.senha}, ou crie uma conta. As contas ficam na memória do
          servidor e somem quando ele reinicia.
        </p>
      )}
      {/* TODO(produção): autenticação real com JWT de expiração configurável e senhas com bcrypt (RNF-01). */}
    </form>
  );
}
