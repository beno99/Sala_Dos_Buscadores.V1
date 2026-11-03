"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ds/Button";
import { CampoTexto } from "@/components/ds/Campos";
import { Sheet } from "@/components/ds/Sheet";
import { useToast } from "@/components/ds/Toast";
import { validarEmail, validarPseudonimo } from "@/features/auth/validacao";
import { editarUsuarioAcao } from "@/server/anfitriao/acoes-admin";
import { focarCampo } from "../AvisoSaida";

const ORDEM = ["campo-editar-nome", "campo-editar-email"];

/** A curadoria edita nome de exibição e e-mail; senha, papel e conteúdo não mudam aqui. */
export function SheetEditarUsuario({
  usuario,
  onFechar,
}: {
  usuario: { id: string; pseudonimo: string; email: string } | null;
  onFechar: () => void;
}) {
  const id = useId();
  const router = useRouter();
  const toast = useToast();
  const [pseudonimo, setPseudonimo] = useState("");
  const [email, setEmail] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    setPseudonimo(usuario?.pseudonimo ?? "");
    setEmail(usuario?.email ?? "");
    setErros({});
  }, [usuario]);

  const mostrarErros = (novos: Record<string, string>) => {
    setErros(novos);
    const primeiro = ORDEM.find((c) => c in novos);
    if (primeiro) requestAnimationFrame(() => focarCampo(primeiro));
  };

  const salvar = async () => {
    if (!usuario || enviando) return;
    const locais: Record<string, string> = {};
    const en = validarPseudonimo(pseudonimo);
    const ee = validarEmail(email);
    if (en) locais["campo-editar-nome"] = en;
    if (ee) locais["campo-editar-email"] = ee;
    if (Object.keys(locais).length) return mostrarErros(locais);
    setEnviando(true);
    const r = await editarUsuarioAcao(usuario.id, { pseudonimo, email });
    setEnviando(false);
    if (!r.ok) {
      const doServidor = (r as { erros?: Record<string, string> }).erros;
      if (doServidor) mostrarErros(doServidor);
      else
        toast(r.mensagem.replace(/^Erro: /, ""), {
          variant: "erro",
          title: "Erro: o usuário não foi alterado",
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
          Editar usuário
        </h2>
        <Button variant="primary" size="sm" loading={enviando} onClick={salvar}>
          Salvar
        </Button>
      </div>
      <div className="sdb-sheet__body">
        <p className="sdb-body-sm m-0">
          Senha, papel, Salas, artigos e publicações continuam iguais. Se o e-mail mudar, o novo já vale como
          confirmado e os dois endereços recebem um aviso.
        </p>
        <CampoTexto
          id="campo-editar-nome"
          label="Nome de exibição"
          maxLength={40}
          autoComplete="off"
          value={pseudonimo}
          error={erros["campo-editar-nome"]}
          onChange={(e) => {
            setPseudonimo(e.target.value);
            setErros(({ "campo-editar-nome": _x, ...r }) => r);
          }}
        />
        <CampoTexto
          id="campo-editar-email"
          label="E-mail"
          type="email"
          inputMode="email"
          autoComplete="off"
          help={usuario ? `Atual: ${usuario.email}` : undefined}
          value={email}
          error={erros["campo-editar-email"]}
          onChange={(e) => {
            setEmail(e.target.value);
            setErros(({ "campo-editar-email": _x, ...r }) => r);
          }}
        />
      </div>
    </Sheet>
  );
}
