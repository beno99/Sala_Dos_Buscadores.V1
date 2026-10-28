"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { Button } from "@/components/ds/Button";
import { CampoTexto } from "@/components/ds/Campos";
import { useToast } from "@/components/ds/Toast";
import { redefinirSenhaAcao } from "./acoes";
import { useEnvio } from "./useEnvio";
import { SENHA_MINIMA, validarSenha } from "./validacao";

export function FormNovaSenha({ token, voltar }: { token: string; voltar: string }) {
  const router = useRouter();
  const toast = useToast();
  const { enviando, enviar } = useEnvio();
  const [senha, setSenha] = useState("");
  const [erros, setErros] = useState<{ senha?: string; geral?: string }>({});

  const submeter = async (e: FormEvent) => {
    e.preventDefault();
    const problema = validarSenha(senha);
    if (problema) {
      setErros({ senha: problema });
      return;
    }
    const r = await enviar(() => redefinirSenhaAcao(token, senha));
    if (!r.ok) {
      setErros(r.campo === "senha" ? { senha: r.erro } : { geral: r.erro });
      return;
    }
    toast("Senha redefinida. Você já entrou na sua conta.");
    router.push(voltar as Route);
    router.refresh();
  };

  return (
    <form className="sdb-conta__form" noValidate onSubmit={submeter} aria-labelledby="titulo-nova-senha">
      <div className="sdb-conta__cabecalho">
        <h1 id="titulo-nova-senha" className="sdb-conta__titulo">
          Nova senha
        </h1>
        <p className="sdb-conta__lead">
          Escolha a nova senha da sua conta. As outras sessões abertas são encerradas.
        </p>
      </div>

      {erros.geral && <Alerta variant="error" title={`Erro: ${erros.geral}`} />}

      <CampoTexto
        label="Nova senha"
        type="password"
        autoComplete="new-password"
        value={senha}
        error={erros.senha}
        help={`Mínimo de ${SENHA_MINIMA} caracteres.`}
        onChange={(e) => {
          setSenha(e.target.value);
          setErros({});
        }}
      />
      <Button type="submit" variant="primary" size="lg" block loading={enviando}>
        Salvar nova senha
      </Button>

      <p className="sdb-footnote sdb-conta__alternativa">
        Link vencido?{" "}
        <Link href={`/recuperar-senha?voltar=${encodeURIComponent(voltar)}` as Route} className="sdb-link">
          Pedir outro
        </Link>
      </p>
    </form>
  );
}
