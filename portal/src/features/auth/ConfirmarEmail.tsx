"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { Button } from "@/components/ds/Button";
import { confirmarEmailAcao, reenviarVerificacaoAcao } from "./acoes";
import { useSessao } from "./SessaoProvider";
import { useEnvio } from "./useEnvio";

/**
 * Verificação de e-mail obrigatória (RF-01): enquanto `emailVerificadoEm` for
 * nulo, o layout do app manda sempre para aqui. Com `token` (link do
 * e-mail), confirma ao toque — não ao carregar a página, porque scanners de
 * segurança de caixa de entrada abrem o link antes da pessoa.
 */
export function ConfirmarEmail({ token }: { token?: string }) {
  const router = useRouter();
  const { membro, atualizar, sair } = useSessao();
  const { enviando, enviar } = useEnvio();
  const [erro, setErro] = useState<string>();
  const [enviado, setEnviado] = useState(false);

  const confirmar = () =>
    enviar(async () => {
      const r = await confirmarEmailAcao(token ?? "");
      if (!r.ok) {
        setErro(r.erro);
        return;
      }
      atualizar(r.valor);
      router.push("/" as Route);
      router.refresh();
    });

  const reenviar = () =>
    enviar(async () => {
      await reenviarVerificacaoAcao();
      setEnviado(true);
    });

  if (token) {
    return (
      <div className="sdb-conta__form">
        <div className="sdb-conta__cabecalho">
          <h1 className="sdb-conta__titulo">Confirmar e-mail</h1>
          <p className="sdb-conta__lead">Toque no botão para confirmar que este e-mail é seu.</p>
        </div>
        {erro ? (
          <Alerta variant="error" title={`Erro: ${erro}`}>
            {membro && !membro.emailVerificadoEm ? (
              <Button variant="secondary" size="sm" loading={enviando} onClick={reenviar}>
                Pedir um novo link
              </Button>
            ) : (
              <Link href={"/entrar" as Route} className="sdb-link">
                Entrar na conta
              </Link>
            )}
          </Alerta>
        ) : (
          <Button variant="primary" size="lg" block loading={enviando} onClick={confirmar}>
            Confirmar e-mail
          </Button>
        )}
      </div>
    );
  }

  if (!membro) {
    return (
      <div className="sdb-conta__form">
        <Alerta title="Confirme pelo e-mail">
          Abra o link que mandamos pro seu e-mail para liberar o acesso, ou{" "}
          <Link href={"/entrar" as Route} className="sdb-link">
            entre na conta
          </Link>
          .
        </Alerta>
      </div>
    );
  }

  return (
    <div className="sdb-conta__form">
      <div className="sdb-conta__cabecalho">
        <h1 className="sdb-conta__titulo">Confirme seu e-mail</h1>
        <p className="sdb-conta__lead">
          Enviamos um link de confirmação para {membro.email}. Abra-o para liberar o acesso ao acervo.
        </p>
      </div>

      {enviado && <Alerta title="Link reenviado">Confira a caixa de entrada de {membro.email}.</Alerta>}

      <Button variant="primary" size="lg" block loading={enviando} onClick={reenviar}>
        Reenviar e-mail
      </Button>
      <p className="sdb-footnote sdb-conta__alternativa">
        Conta errada?{" "}
        <button type="button" className="sdb-link" onClick={() => sair()}>
          Sair
        </button>
      </p>
    </div>
  );
}
