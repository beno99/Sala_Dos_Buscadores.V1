"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { Button } from "@/components/ds/Button";
import { CampoTexto } from "@/components/ds/Campos";
import { confirmarEmailAcao, corrigirEmailPendenteAcao, reenviarVerificacaoAcao } from "./acoes";
import { useSessao } from "./SessaoProvider";
import { useEnvio } from "./useEnvio";
import { destinoAposLogin } from "./validacao";

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
  const [emailCorreto, setEmailCorreto] = useState("");
  const [confirmadoSemSessao, setConfirmadoSemSessao] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const confirmar = () =>
    enviar(async () => {
      const r = await confirmarEmailAcao(token ?? "");
      if (!r.ok) {
        setErro(r.erro);
        return;
      }
      if (!r.valor.mesmaSessao) {
        setConfirmadoSemSessao(true);
        return;
      }
      atualizar(r.valor.membro);
      router.push(destinoAposLogin(r.valor.membro) as Route);
      router.refresh();
    });

  const reenviar = () =>
    enviar(async () => {
      const r = await reenviarVerificacaoAcao();
      setErro(r.ok ? undefined : r.erro);
      setEnviado(r.ok);
    });

  if (confirmadoSemSessao)
    return (
      <div className="sdb-conta__form">
        <Alerta title="E-mail confirmado">
          A conta está confirmada. Entre com o e-mail e a senha dessa conta para continuar.
        </Alerta>
        {membro ? (
          <Button variant="primary" onClick={() => sair()}>
            Sair da sessão atual e entrar na conta confirmada
          </Button>
        ) : (
          <Link href={"/entrar" as Route} className="sdb-link">
            Entrar na conta confirmada
          </Link>
        )}
      </div>
    );

  if (token) {
    return (
      <div className="sdb-conta__form">
        <div className="sdb-conta__cabecalho">
          <h1 className="sdb-conta__titulo">Confirmar e-mail</h1>
          <p className="sdb-conta__lead">Toque no botão para confirmar que este e-mail é seu.</p>
        </div>
        {enviado ? (
          <Alerta title="Novo link solicitado">
            Abra o novo e-mail para confirmar. O link desta página foi substituído e não deve ser usado
            novamente. Confira também spam e lixo eletrônico.
          </Alerta>
        ) : erro ? (
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

      {erro && <Alerta variant="error" title={`Erro: ${erro}`} />}
      <p className="sdb-footnote">
        Confira também spam e lixo eletrônico. Você pode pedir um novo link a cada minuto.
      </p>
      {enviado && <Alerta title="Link reenviado">Confira a caixa de entrada de {membro.email}.</Alerta>}

      <Button variant="primary" size="lg" block loading={enviando} onClick={reenviar}>
        Reenviar e-mail
      </Button>
      {!membro.emailVerificadoEm && (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            enviar(async () => {
              const r = await corrigirEmailPendenteAcao(emailCorreto);
              setErro(r.ok ? r.valor.erroEnvio : r.erro);
              if (r.ok) {
                atualizar(r.valor.membro);
                setEnviado(r.valor.enviado);
                setEmailCorreto("");
              }
            });
          }}
        >
          <CampoTexto
            label="Corrigir endereço de e-mail"
            type="email"
            autoComplete="email"
            value={emailCorreto}
            onChange={(e) => setEmailCorreto(e.target.value)}
          />
          <Button type="submit" variant="secondary" loading={enviando}>
            Corrigir e enviar novo link
          </Button>
        </form>
      )}
      <p className="sdb-footnote sdb-conta__alternativa">
        Conta errada?{" "}
        <button type="button" className="sdb-link" onClick={() => sair()}>
          Sair
        </button>
      </p>
    </div>
  );
}
