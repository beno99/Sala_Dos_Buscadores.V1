"use client";

import { useState } from "react";
import { Avatar } from "@/components/ds/Avatar";
import { AvisoNeutralidade } from "@/components/ds/AvisoNeutralidade";
import { Button } from "@/components/ds/Button";
import { LinhaFonte } from "@/components/ds/CardFonte";
import { Icon, type IconName } from "@/components/ds/Icon";
import { SeloProveniencia } from "@/components/ds/Selos";
import { TextoMarcado } from "@/components/ds/TextoMarcado";
import { useCopiar, useToast } from "@/components/ds/Toast";
import type { TrechoResposta } from "@/data/types";
import { emitirEstudo } from "@/features/estudo/eventos";
import { formatarSegundos } from "@/lib/texto";
import type { Resposta } from "./motor";

const ICONE_TRECHO: Record<TrechoResposta["tipo"], IconName> = {
  doc: "fontePrimaria",
  editorial: "curado",
  ai: "ia",
};

/** Texto puro da resposta, com as fontes, para copiar. */
export function textoParaCopiar(r: Resposta): string {
  const limpar = (t: string) => t.replace(/[*_]/g, "");
  const corpo = r.trechos.map((t) => `${t.rotulo}\n${limpar(t.texto)}`).join("\n\n");
  const fontes = r.fontes.map((f, i) => `[${i + 1}] ${f.titulo} · ${f.referencia}`).join("\n");
  return `Assistente de IA (síntese por IA)\n\n${corpo}${fontes ? `\n\nFontes citadas\n${fontes}` : ""}`;
}

/**
 * Resposta do assistente (MensagemAssistente): identificada como IA (RF-27),
 * com fontes numeradas (RF-28) e três tipos de trecho visualmente distintos
 * (RF-29): documental, interpretação editorial e síntese da IA.
 */
export function MensagemAssistente({
  resposta,
  duracaoMs,
  onGerarNovamente,
  gerando,
}: {
  resposta: Resposta;
  duracaoMs: number;
  onGerarNovamente: () => void;
  gerando: boolean;
}) {
  const [avaliacao, setAvaliacao] = useState<"util" | "naoUtil" | null>(null);
  const toast = useToast();
  const copiar = useCopiar();
  const ancora = (n: number) => `#${resposta.id}-f${n}`;

  const avaliar = (valor: "util" | "naoUtil") => {
    const nova = avaliacao === valor ? null : valor;
    setAvaliacao(nova);
    if (nova === "util") toast("Obrigado. A avaliação ajuda a curadoria.", { icon: "util" });
    if (nova === "naoUtil")
      toast("Obrigado. A equipe da Sala vai revisar esta resposta.", { icon: "naoUtil" });
  };

  return (
    <>
      <article className="sdb-msg" aria-labelledby={`${resposta.id}-quem`}>
        <Avatar ai className="sdb-msg__avatar" />
        <div>
          <div className="sdb-msg__who">
            <b id={`${resposta.id}-quem`}>Assistente de IA</b>
            <SeloProveniencia tipo="ia" />
            <span className="sdb-footnote">
              {resposta.trechosLidos} trechos · {resposta.salasConsultadas}{" "}
              {resposta.salasConsultadas === 1 ? "Sala" : "Salas"} · {formatarSegundos(duracaoMs)}
            </span>
          </div>
        </div>
        <div className="sdb-msg__content">
          {resposta.trechos.map((t) => (
            <section key={`${t.tipo}-${t.rotulo}`} className={`sdb-seg sdb-seg--${t.tipo}`}>
              <div className="sdb-seg__label">
                <Icon name={ICONE_TRECHO[t.tipo]} size="sm" />
                {t.rotulo}
              </div>
              <p>
                <TextoMarcado texto={t.texto} hrefRef={ancora} />
                {t.tipo !== "ai" &&
                  t.refs.map((n) => (
                    <a key={n} className="sdb-ref" href={ancora(n)} aria-label={`Fonte ${n}`}>
                      {n}
                    </a>
                  ))}
              </p>
            </section>
          ))}

          {resposta.fontes.length > 0 ? (
            <div className="sdb-spec" style={{ gap: 8, marginTop: 4 }}>
              <span className="sdb-caption">Fontes citadas</span>
              {/* Abrir uma das fontes conta para a conquista "Com as fontes". */}
              <div className="sdb-list" onClickCapture={() => emitirEstudo({ tipo: "fontes" })}>
                {resposta.fontes.map((f, i) => (
                  <LinhaFonte
                    key={f.titulo}
                    id={`${resposta.id}-f${i + 1}`}
                    numero={i + 1}
                    titulo={f.titulo}
                    referencia={f.referencia}
                    capa={f.capa}
                    inicial={f.inicial}
                    href={f.href}
                    proveniencia={f.proveniencia}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="sdb-footnote">
              Nenhuma fonte do acervo foi usada nesta resposta; o texto acima é marcado como síntese da IA.
            </p>
          )}
        </div>
        <div className="sdb-msg__actions">
          <Button
            iconOnly
            icon="copiar"
            aria-label="Copiar resposta com as fontes"
            tip="Copiar com as fontes"
            onClick={() => copiar(textoParaCopiar(resposta), "Resposta copiada com as fontes.")}
          />
          <Button
            iconOnly
            icon="util"
            aria-label="Útil"
            aria-pressed={avaliacao === "util"}
            tip="Útil"
            onClick={() => avaliar("util")}
          />
          <Button
            iconOnly
            icon="naoUtil"
            aria-label="Não útil"
            aria-pressed={avaliacao === "naoUtil"}
            tip="Não útil"
            onClick={() => avaliar("naoUtil")}
          />
          <Button variant="glass" size="sm" icon="regenerar" disabled={gerando} onClick={onGerarNovamente}>
            Gerar novamente
          </Button>
        </div>
      </article>
      <AvisoNeutralidade variante="discreto" />
    </>
  );
}
