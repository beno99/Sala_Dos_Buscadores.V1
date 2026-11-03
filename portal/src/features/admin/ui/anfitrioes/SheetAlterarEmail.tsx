"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ds/Button";
import { CampoTexto } from "@/components/ds/Campos";
import { Sheet } from "@/components/ds/Sheet";
import { useToast } from "@/components/ds/Toast";
import { validarEmail } from "@/features/auth/validacao";
import { alterarEmailAcao } from "@/server/anfitriao/acoes-admin";
import { focarCampo } from "../AvisoSaida";

/** A curadoria troca o e-mail de uma conta; a senha e o conteúdo continuam os mesmos. */
export function SheetAlterarEmail({
  usuario,
  onFechar,
}: {
  usuario: { id: string; pseudonimo: string; email: string } | null;
  onFechar: () => void;
}) {
  const id = useId();
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | undefined>();
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    setEmail(usuario?.email ?? "");
    setErro(undefined);
  }, [usuario]);

  const salvar = async () => {
    if (!usuario || enviando) return;
    const local = validarEmail(email);
    if (local) {
      setErro(local);
      return requestAnimationFrame(() => focarCampo("campo-novo-email"));
    }
    setEnviando(true);
    const r = await alterarEmailAcao(usuario.id, email);
    setEnviando(false);
    if (!r.ok) {
      const doCampo = (r as { erros?: Record<string, string> }).erros?.["campo-novo-email"];
      if (doCampo) {
        setErro(doCampo);
        requestAnimationFrame(() => focarCampo("campo-novo-email"));
      } else
        toast(r.mensagem.replace(/^Erro: /, ""), {
          variant: "erro",
          title: "Erro: o e-mail não foi alterado",
        });
      return;
    }
    toast(r.mensagem);
    onFechar();
    router.refresh();
  };

  return (
    <Sheet aberto={usuario !== null} onFechar={onFechar} rotuloId={`${id}-titulo`}>
      <div className="sdb-sheet__bar">
        <Button variant="plain" onClick={onFechar}>
          Cancelar
        </Button>
        <h2 id={`${id}-titulo`} className="sdb-sheet__title">
          Alterar e-mail
        </h2>
        <Button variant="primary" size="sm" loading={enviando} onClick={salvar}>
          Salvar
        </Button>
      </div>
      <div className="sdb-sheet__body">
        <p className="sdb-body-sm m-0">
          A conta de {usuario?.pseudonimo} passa a entrar com o novo e-mail, já confirmado. Senha, Salas,
          artigos e publicações continuam iguais. O e-mail antigo e o novo recebem um aviso.
        </p>
        <CampoTexto
          id="campo-novo-email"
          label="Novo e-mail"
          type="email"
          inputMode="email"
          autoComplete="off"
          help={usuario ? `Atual: ${usuario.email}` : undefined}
          value={email}
          error={erro}
          onChange={(e) => {
            setEmail(e.target.value);
            setErro(undefined);
          }}
        />
      </div>
    </Sheet>
  );
}
