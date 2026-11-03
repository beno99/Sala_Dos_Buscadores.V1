"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ds/Button";
import { CampoTexto } from "@/components/ds/Campos";
import { RadioGrupo } from "@/components/ds/CamposExtras";
import { Sheet } from "@/components/ds/Sheet";
import { useToast } from "@/components/ds/Toast";
import { SENHA_MINIMA, validarSenha } from "@/features/auth/validacao";
import { definirSenhaProvisoriaAcao, enviarLinkSenhaAcao } from "@/server/anfitriao/acoes-admin";
import { focarCampo } from "../AvisoSaida";

type Modo = "link" | "provisoria";

/**
 * Redefinir a senha pela curadoria: envia o link de "Esqueci minha senha" ou
 * define uma senha provisória (não vale para contas da curadoria).
 */
export function SheetSenhaUsuario({
  usuario,
  onFechar,
}: {
  usuario: { id: string; pseudonimo: string; email: string; papel: string } | null;
  onFechar: () => void;
}) {
  const id = useId();
  const toast = useToast();
  const [modo, setModo] = useState<Modo>("link");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | undefined>();
  const [enviando, setEnviando] = useState(false);
  const curador = usuario?.papel === "administrador";

  const confirmar = async () => {
    if (!usuario || enviando) return;
    if (modo === "provisoria") {
      const e = validarSenha(senha);
      if (e) {
        setErro(e);
        return requestAnimationFrame(() => focarCampo("campo-senha-provisoria"));
      }
    }
    setEnviando(true);
    const r =
      modo === "link"
        ? await enviarLinkSenhaAcao(usuario.id)
        : await definirSenhaProvisoriaAcao(usuario.id, senha);
    setEnviando(false);
    if (!r.ok) {
      const doCampo = (r as { erros?: Record<string, string> }).erros?.["campo-senha-provisoria"];
      if (doCampo) setErro(doCampo);
      else
        toast(r.mensagem.replace(/^Erro: /, ""), {
          variant: "erro",
          title: "Erro: a senha não foi redefinida",
        });
      return;
    }
    toast(r.mensagem);
    onFechar();
  };

  return (
    <Sheet aberto={usuario !== null} onFechar={onFechar} rotuloId={`${id}-titulo`}>
      <div className="sdb-sheet__bar">
        <Button variant="plain" onClick={onFechar}>
          Cancelar
        </Button>
        <h2 id={`${id}-titulo`} className="sdb-sheet__title">
          Redefinir senha
        </h2>
        <Button variant="primary" size="sm" loading={enviando} onClick={confirmar}>
          {modo === "link" ? "Enviar link" : "Definir senha"}
        </Button>
      </div>
      <div className="sdb-sheet__body">
        <p className="sdb-body-sm m-0">
          Conta de {usuario?.pseudonimo} ({usuario?.email}).
        </p>
        {curador ? (
          <p className="sdb-body-sm m-0">
            Contas da curadoria só trocam a senha pelo link enviado ao próprio e-mail.
          </p>
        ) : (
          <RadioGrupo<Modo>
            legenda="Como redefinir"
            nome={`${id}-modo`}
            valor={modo}
            onChange={(v) => {
              setModo(v);
              setErro(undefined);
            }}
            opcoes={[
              {
                value: "link",
                label: "Enviar link por e-mail",
                help: "A pessoa recebe o link de “Esqueci minha senha”, válido por 30 minutos, e escolhe a nova senha.",
              },
              {
                value: "provisoria",
                label: "Definir senha provisória",
                help: "Você define a senha agora e a passa por um canal seguro. As sessões abertas da conta são encerradas.",
              },
            ]}
          />
        )}
        {modo === "provisoria" && !curador && (
          <CampoTexto
            id="campo-senha-provisoria"
            label="Senha provisória"
            type="password"
            autoComplete="new-password"
            help={`Mínimo de ${SENHA_MINIMA} caracteres.`}
            value={senha}
            error={erro}
            onChange={(e) => {
              setSenha(e.target.value);
              setErro(undefined);
            }}
          />
        )}
      </div>
    </Sheet>
  );
}
