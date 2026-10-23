"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { Button } from "@/components/ds/Button";
import { CampoTexto } from "@/components/ds/Campos";
import { AreaTexto } from "@/components/ds/CamposExtras";
import { useToast } from "@/components/ds/Toast";
import type { Candidatura as DadosCandidatura } from "@/data/types";
import { formatarData } from "@/lib/texto";
import { candidatarAcao } from "@/server/anfitriao/acoes";
import { focarCampo } from "../../admin/ui/AvisoSaida";
import {
  type FormCandidatura,
  LIMITE_APRESENTACAO,
  LIMITE_CREDENCIAL,
  validarCandidatura,
} from "../regras/perfil";

const ORDEM = ["campo-nome", "campo-credencial", "campo-apresentacao", "campo-link"];

/**
 * "Quero ser anfitrião" (anfitriões §2.2): o membro se candidata; a curadoria
 * aprova ou recusa com motivo. Com uma candidatura pendente, só o aviso.
 */
export function Candidatura({ ultima, pseudonimo }: { ultima?: DadosCandidatura; pseudonimo: string }) {
  const router = useRouter();
  const toast = useToast();
  const [aberto, setAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState<FormCandidatura>({
    nome: ultima?.nome ?? pseudonimo,
    credencial: ultima?.credencial ?? "",
    apresentacao: ultima?.apresentacao ?? "",
    link: ultima?.link ?? "",
  });
  const [erros, setErros] = useState<Record<string, string>>({});

  const mudar = (parcial: Partial<FormCandidatura>, campo: string) => {
    setForm((f) => ({ ...f, ...parcial }));
    setErros((e) => {
      const { [campo]: _x, ...resto } = e;
      return resto;
    });
  };

  const mostrarErros = (novos: Record<string, string>) => {
    setErros(novos);
    const primeiro = ORDEM.find((c) => c in novos);
    if (primeiro) requestAnimationFrame(() => focarCampo(primeiro));
  };

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    const locais = validarCandidatura(form);
    if (Object.keys(locais).length) return mostrarErros(locais);
    setEnviando(true);
    const r = await candidatarAcao(form);
    setEnviando(false);
    if (!r.ok) {
      const errosDoServidor = (r as { erros?: Record<string, string> }).erros;
      if (errosDoServidor) mostrarErros(errosDoServidor);
      toast(r.mensagem.replace(/^Erro: /, ""), {
        variant: "erro",
        title: "Erro: a candidatura não foi enviada",
      });
      return;
    }
    toast(r.mensagem);
    setAberto(false);
    router.refresh();
  };

  if (ultima?.status === "pendente") {
    return (
      <Alerta title="Sua candidatura está em análise">
        Enviada em {formatarData(ultima.enviadaEm.slice(0, 10))}. A curadoria responde por e-mail e aqui, nos
        Ajustes.
      </Alerta>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {ultima?.status === "recusada" && (
        <Alerta variant="warning" title="Atenção: sua última candidatura foi recusada">
          Motivo da curadoria: {ultima.motivo}
          <br />
          Você pode ajustar e se candidatar de novo.
        </Alerta>
      )}
      <p className="sdb-body-sm">
        Anfitriões mantêm Salas próprias, com leituras assinadas. Tudo passa pela revisão da curadoria antes
        de ir ao ar, e o anfitrião segue as mesmas diretrizes do acervo: afirmações atribuídas a fontes, datas
        incertas como incertas, sem tom dogmático.
      </p>
      {!aberto ? (
        <div>
          <Button variant="tinted" icon="anfitriao" onClick={() => setAberto(true)}>
            Quero ser anfitrião
          </Button>
        </div>
      ) : (
        <form
          className="flex flex-col gap-4"
          noValidate
          onSubmit={enviar}
          aria-label="Candidatura a anfitrião"
        >
          <CampoTexto
            id="campo-nome"
            label="Nome público"
            help="Como aparece na assinatura das suas Salas e artigos."
            value={form.nome}
            error={erros["campo-nome"]}
            onChange={(e) => mudar({ nome: e.target.value }, "campo-nome")}
          />
          <CampoTexto
            id="campo-credencial"
            label="Credencial"
            maxLength={LIMITE_CREDENCIAL}
            placeholder="Ex.: Mestranda em história das religiões"
            help="Uma linha: de onde vem seu conhecimento do tema."
            value={form.credencial}
            error={erros["campo-credencial"]}
            onChange={(e) => mudar({ credencial: e.target.value }, "campo-credencial")}
          />
          <AreaTexto
            id="campo-apresentacao"
            label="Apresentação"
            rows={5}
            contador
            maxLength={LIMITE_APRESENTACAO}
            placeholder="Ex.: Estudo os códices de Nag Hammadi e gostaria de manter leituras comentadas do Evangelho de Tomé, sempre indicando a edição usada."
            value={form.apresentacao}
            error={erros["campo-apresentacao"]}
            onChange={(e) => mudar({ apresentacao: e.target.value }, "campo-apresentacao")}
          />
          <CampoTexto
            id="campo-link"
            label={
              <>
                Site ou canal <small>opcional</small>
              </>
            }
            type="url"
            inputMode="url"
            placeholder="https://"
            value={form.link}
            error={erros["campo-link"]}
            onChange={(e) => mudar({ link: e.target.value }, "campo-link")}
          />
          <div className="sdb-row">
            <Button variant="secondary" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={enviando}>
              Enviar candidatura
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
