"use client";

import type { Route } from "next";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { Button } from "@/components/ds/Button";
import { CampoTexto } from "@/components/ds/Campos";
import { solicitarRedefinicaoAcao } from "./acoes";
import { useEnvio } from "./useEnvio";
import { validarEmail } from "./validacao";

/** Recuperação de senha por link temporário (RF-03), simulada. */
export function FormRecuperar({ voltar }: { voltar: string }) {
  const { enviando, enviar } = useEnvio();
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string>();
  const [validade, setValidade] = useState<number | null>(null);

  const submeter = async (e: FormEvent) => {
    e.preventDefault();
    const problema = validarEmail(email);
    if (problema) {
      setErro(problema);
      return;
    }
    const r = await enviar(() => solicitarRedefinicaoAcao(email));
    if (r.ok) setValidade(r.valor.validadeMin);
  };

  return (
    <form className="sdb-conta__form" noValidate onSubmit={submeter} aria-labelledby="titulo-recuperar">
      <div className="sdb-conta__cabecalho">
        <h1 id="titulo-recuperar" className="sdb-conta__titulo">
          Redefinir senha
        </h1>
        <p className="sdb-conta__lead">Enviamos um link temporário para o e-mail da conta.</p>
      </div>

      {validade !== null ? (
        <Alerta title="Link enviado">
          Se houver uma conta com {email.trim()}, ela recebe um link válido por {validade} minutos. Neste
          protótipo nenhum e-mail é enviado de verdade.
        </Alerta>
      ) : (
        <>
          <CampoTexto
            label="E-mail da conta"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            error={erro}
            onChange={(e) => {
              setEmail(e.target.value);
              setErro(undefined);
            }}
          />
          <Button type="submit" variant="primary" size="lg" block loading={enviando}>
            Enviar link
          </Button>
        </>
      )}

      <p className="sdb-footnote sdb-conta__alternativa">
        Lembrou a senha?{" "}
        <Link href={`/entrar?voltar=${encodeURIComponent(voltar)}` as Route} className="sdb-link">
          Entrar
        </Link>
      </p>
    </form>
  );
}
