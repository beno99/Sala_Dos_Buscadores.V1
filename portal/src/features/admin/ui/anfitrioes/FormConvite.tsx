"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ds/Button";
import { CampoTexto } from "@/components/ds/Campos";
import { AreaTexto } from "@/components/ds/CamposExtras";
import { useToast } from "@/components/ds/Toast";
import {
  ASSUNTO_CONVITE,
  corpoDoConvite,
  DIAS_VALIDADE_CONVITE,
  LIMITE_MENSAGEM_CONVITE,
  LIMITE_NOME_CONVITE,
  validarPersonalizacao,
} from "@/features/anfitriao/regras/convite";
import { validarEmail } from "@/features/auth/validacao";
import { ASSINATURA_EMAIL } from "@/lib/email";
import { convidarAcao } from "@/server/anfitriao/acoes-admin";
import { focarCampo } from "../AvisoSaida";

const ORDEM = ["campo-email", "campo-nome-convite", "campo-mensagem-convite"];
const LINK_DA_PREVIA = `[link pessoal do convite, válido por ${DIAS_VALIDADE_CONVITE} dias]`;

export function FormConvite() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);

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

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    const erroEmail = validarEmail(email);
    const locais = {
      ...(erroEmail ? { "campo-email": erroEmail } : {}),
      ...validarPersonalizacao({ nome, mensagem }),
    };
    if (Object.keys(locais).length) return mostrarErros(locais);
    setEnviando(true);
    const r = await convidarAcao(email, { nome, mensagem });
    setEnviando(false);
    if (!r.ok) {
      const doServidor = (r as { erros?: Record<string, string> }).erros;
      if (doServidor) mostrarErros(doServidor);
      else mostrarErros({ "campo-email": r.mensagem.replace(/^Erro: /, "") });
      return;
    }
    setEmail("");
    setNome("");
    setMensagem("");
    toast(r.mensagem);
    router.refresh();
  };

  const para = email.trim().toLowerCase();
  const corpo = `${corpoDoConvite({ nome, mensagem }, LINK_DA_PREVIA)}\n\n${ASSINATURA_EMAIL}`;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-4 max-[60rem]:grid-cols-1">
      <form className="sdb-material sdb-panel" noValidate onSubmit={enviar} aria-labelledby="titulo-convidar">
        <h2 id="titulo-convidar" className="sdb-headline">
          Convidar
        </h2>
        <CampoTexto
          id="campo-email"
          label="E-mail"
          type="email"
          inputMode="email"
          autoComplete="off"
          placeholder="nome@exemplo.com"
          help={`O convite vale ${DIAS_VALIDADE_CONVITE} dias e só pode ser usado uma vez. O e-mail fica na caixa de saída.`}
          value={email}
          error={erros["campo-email"]}
          onChange={(e) => {
            setEmail(e.target.value);
            limpar("campo-email");
          }}
        />
        <CampoTexto
          id="campo-nome-convite"
          label={
            <>
              Nome da pessoa <small>opcional</small>
            </>
          }
          maxLength={LIMITE_NOME_CONVITE}
          placeholder="Ex.: Helena"
          help="Abre o e-mail com a saudação pelo nome."
          value={nome}
          error={erros["campo-nome-convite"]}
          onChange={(e) => {
            setNome(e.target.value);
            limpar("campo-nome-convite");
          }}
        />
        <AreaTexto
          id="campo-mensagem-convite"
          label={
            <>
              Mensagem pessoal <small>opcional</small>
            </>
          }
          rows={6}
          contador
          maxLength={LIMITE_MENSAGEM_CONVITE}
          placeholder="Ex.: Lemos suas notas sobre o Corpus Hermeticum e gostaríamos de vê-las numa Sala própria, com as edições que você usa."
          help="Entra logo depois da saudação, antes do texto padrão do convite."
          value={mensagem}
          error={erros["campo-mensagem-convite"]}
          onChange={(e) => {
            setMensagem(e.target.value);
            limpar("campo-mensagem-convite");
          }}
        />
        <div>
          <Button type="submit" variant="primary" icon="enviar" loading={enviando}>
            Enviar convite
          </Button>
        </div>
      </form>

      <section className="sdb-material sdb-panel" aria-labelledby="titulo-previa-convite">
        <h2 id="titulo-previa-convite" className="sdb-headline">
          Prévia do e-mail
        </h2>
        <dl className="sdb-body-sm m-0 flex flex-col gap-1">
          <div className="flex gap-2">
            <dt className="sdb-secondary">Para:</dt>
            <dd className="m-0 min-w-0 break-words">{para || "e-mail da pessoa convidada"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="sdb-secondary">Assunto:</dt>
            <dd className="m-0 min-w-0">{ASSUNTO_CONVITE}</dd>
          </div>
        </dl>
        <p className="sdb-body-sm m-0 whitespace-pre-line break-words">{corpo}</p>
        <p className="sdb-footnote m-0">O link pessoal é gerado no envio.</p>
      </section>
    </div>
  );
}
