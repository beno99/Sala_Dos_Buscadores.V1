"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { Button } from "@/components/ds/Button";
import { CampoTexto, Checkbox } from "@/components/ds/Campos";
import { Icon } from "@/components/ds/Icon";
import { useToast } from "@/components/ds/Toast";
import { useSessao } from "@/features/auth/SessaoProvider";
import { SENHA_MINIMA, validarPseudonimo, validarSenha } from "@/features/auth/validacao";
import { cadastrarPorConviteAcao } from "@/server/anfitriao/acoes";

type Erros = { pseudonimo?: string; senha?: string; consentimento?: string; geral?: string };

/**
 * Cadastro pelo link do convite (anfitriões §2.3): a conta nasce como
 * anfitrião, com o e-mail travado no do convite. Depois, o perfil público.
 */
export function FormCadastroConvite({ token, email }: { token: string; email: string }) {
  const router = useRouter();
  const toast = useToast();
  const { atualizar } = useSessao();
  const [pseudonimo, setPseudonimo] = useState("");
  const [senha, setSenha] = useState("");
  const [consentimento, setConsentimento] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erros, setErros] = useState<Erros>({});

  const limpar = (campo: keyof Erros) => setErros((x) => ({ ...x, [campo]: undefined, geral: undefined }));

  const submeter = async (e: FormEvent) => {
    e.preventDefault();
    const novos: Erros = {
      pseudonimo: validarPseudonimo(pseudonimo) ?? undefined,
      senha: validarSenha(senha) ?? undefined,
      consentimento: consentimento ? undefined : "marque a concordância para criar a conta.",
    };
    if (Object.values(novos).some(Boolean)) {
      setErros(novos);
      return;
    }
    setEnviando(true);
    const r = await cadastrarPorConviteAcao(token, { pseudonimo, senha });
    setEnviando(false);
    if (!r.ok) {
      const porCampo = (r as { erros?: Record<string, string> }).erros ?? {};
      setErros(
        porCampo.pseudonimo || porCampo.senha
          ? { pseudonimo: porCampo.pseudonimo, senha: porCampo.senha }
          : { geral: r.mensagem.replace(/^Erro: /, "") },
      );
      return;
    }
    atualizar(r.valor);
    toast("Conta de anfitrião criada. Agora, seu perfil público.");
    router.push("/anfitriao/perfil?boas-vindas=1" as Route);
    router.refresh();
  };

  return (
    <form className="sdb-conta__form" noValidate onSubmit={submeter} aria-labelledby="titulo-convite">
      <div className="sdb-conta__cabecalho">
        <h1 id="titulo-convite" className="sdb-conta__titulo">
          Criar conta de anfitrião
        </h1>
        <p className="sdb-conta__lead">
          A curadoria convidou você para manter uma Sala própria. Tudo o que você escrever passa pela revisão
          dela antes de ir ao ar. Depois do cadastro, você completa o perfil público.
        </p>
      </div>

      {erros.geral && <Alerta variant="error" title={`Erro: ${erros.geral}`} />}

      <CampoTexto
        label="E-mail"
        type="email"
        value={email}
        readOnly
        aria-readonly="true"
        help="O e-mail do convite. Para usar outro, peça um novo convite à curadoria."
      />
      <CampoTexto
        label="Pseudônimo"
        autoComplete="nickname"
        maxLength={40}
        value={pseudonimo}
        error={erros.pseudonimo}
        help="Nome da conta. A assinatura pública você define em seguida, no perfil."
        onChange={(e) => {
          setPseudonimo(e.target.value);
          limpar("pseudonimo");
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
        Criar conta de anfitrião
      </Button>
    </form>
  );
}
