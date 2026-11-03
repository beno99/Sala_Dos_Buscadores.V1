"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ds/Button";
import { CampoTexto } from "@/components/ds/Campos";
import { RadioGrupo } from "@/components/ds/CamposExtras";
import { Sheet } from "@/components/ds/Sheet";
import { useToast } from "@/components/ds/Toast";
import { SENHA_MINIMA, validarEmail, validarPseudonimo, validarSenha } from "@/features/auth/validacao";
import { criarUsuarioAcao } from "@/server/anfitriao/acoes-admin";
import { focarCampo } from "../AvisoSaida";

type Cargo = "membro" | "anfitriao" | "administrador";
const ORDEM = ["campo-avulso-nome", "campo-avulso-email", "campo-avulso-senha"];

export function SheetCriarUsuario({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const id = useId();
  const router = useRouter();
  const toast = useToast();
  const [pseudonimo, setPseudonimo] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [papel, setPapel] = useState<Cargo>("membro");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    setPseudonimo("");
    setEmail("");
    setSenha("");
    setPapel("membro");
    setErros({});
  }, [aberto]);

  const limpar = (campo: string) =>
    setErros((e) => {
      const { [campo]: _x, ...resto } = e;
      return resto;
    });

  const mostrarErros = (novos: Record<string, string>) => {
    setErros(novos);
    const primeiro = ORDEM.find((c) => c in novos);
    if (primeiro) requestAnimationFrame(() => focarCampo(primeiro));
  };

  const criar = async () => {
    const locais: Record<string, string> = {};
    const en = validarPseudonimo(pseudonimo);
    const ee = validarEmail(email);
    const es = validarSenha(senha);
    if (en) locais["campo-avulso-nome"] = en;
    if (ee) locais["campo-avulso-email"] = ee;
    if (es) locais["campo-avulso-senha"] = es;
    if (Object.keys(locais).length) return mostrarErros(locais);
    setEnviando(true);
    const r = await criarUsuarioAcao({ pseudonimo, email, senha, papel });
    setEnviando(false);
    if (!r.ok) {
      const doServidor = (r as { erros?: Record<string, string> }).erros;
      if (doServidor) mostrarErros(doServidor);
      else
        toast(r.mensagem.replace(/^Erro: /, ""), { variant: "erro", title: "Erro: a conta não foi criada" });
      return;
    }
    toast(r.mensagem);
    onFechar();
    router.refresh();
  };

  return (
    <Sheet aberto={aberto} onFechar={onFechar} rotuloId={`${id}-titulo`}>
      <div className="sdb-sheet__bar">
        <Button variant="plain" onClick={onFechar}>
          Cancelar
        </Button>
        <h2 id={`${id}-titulo`} className="sdb-sheet__title">
          Criar usuário
        </h2>
        <Button variant="primary" size="sm" loading={enviando} onClick={criar}>
          Criar
        </Button>
      </div>
      <div className="sdb-sheet__body">
        <p className="sdb-body-sm m-0">
          A conta já nasce confirmada e nenhum e-mail é enviado. Combine a senha com a pessoa por um canal
          seguro; ela pode trocá-la depois em “Esqueci minha senha”.
        </p>
        <CampoTexto
          id="campo-avulso-nome"
          label="Nome de exibição"
          maxLength={40}
          autoComplete="off"
          value={pseudonimo}
          error={erros["campo-avulso-nome"]}
          onChange={(e) => {
            setPseudonimo(e.target.value);
            limpar("campo-avulso-nome");
          }}
        />
        <CampoTexto
          id="campo-avulso-email"
          label="E-mail"
          type="email"
          inputMode="email"
          autoComplete="off"
          placeholder="nome@exemplo.com"
          value={email}
          error={erros["campo-avulso-email"]}
          onChange={(e) => {
            setEmail(e.target.value);
            limpar("campo-avulso-email");
          }}
        />
        <CampoTexto
          id="campo-avulso-senha"
          label="Senha inicial"
          type="password"
          autoComplete="new-password"
          help={`Mínimo de ${SENHA_MINIMA} caracteres.`}
          value={senha}
          error={erros["campo-avulso-senha"]}
          onChange={(e) => {
            setSenha(e.target.value);
            limpar("campo-avulso-senha");
          }}
        />
        <RadioGrupo<Cargo>
          legenda="Cargo"
          nome={`${id}-cargo`}
          valor={papel}
          onChange={setPapel}
          opcoes={[
            { value: "membro", label: "Buscador", help: "Lê o acervo e participa da comunidade." },
            {
              value: "anfitriao",
              label: "Anfitrião",
              help: "Mantém Salas próprias, revisadas pela curadoria antes de ir ao ar.",
            },
            {
              value: "administrador",
              label: "Curador",
              help: "Acesso total à Curadoria: publica, revisa anfitriões e gerencia usuários.",
            },
          ]}
        />
      </div>
    </Sheet>
  );
}
