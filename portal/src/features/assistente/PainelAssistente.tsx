"use client";

import { useEffect, useRef, useState } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { AvisoNeutralidade } from "@/components/ds/AvisoNeutralidade";
import { CampoPerguntaIA } from "./CampoPerguntaIA";
import { type Turno, useConversa } from "./ConversaProvider";
import { IndicadorConsulta } from "./IndicadorConsulta";
import { MensagemAssistente } from "./MensagemAssistente";
import { type Escopo, responder, SUGESTOES } from "./motor";

function textoEstado(ultimo: Turno | undefined): string {
  if (!ultimo) return "Enter envia · Shift + Enter quebra a linha.";
  switch (ultimo.estado) {
    case "consultando":
      return "Consultando o acervo… use o botão quadrado para interromper.";
    case "interrompida":
      return "Consulta interrompida. Sua pergunta foi mantida no campo.";
    case "erro":
      return "Erro: não foi possível consultar o acervo. Sua pergunta foi mantida; tente de novo.";
    case "concluida": {
      const n = ultimo.resposta?.fontes.length ?? 0;
      if (n === 0) return "Resposta pronta, marcada como síntese da IA, sem trecho do acervo.";
      return `Resposta pronta com ${n} ${n === 1 ? "fonte citada" : "fontes citadas"}.`;
    }
  }
}

/** Tela de conversa com o assistente (RF-26 a RF-31). */
export function PainelAssistente({
  perguntaInicial = "",
  escopoInicial = "todo",
}: {
  perguntaInicial?: string;
  escopoInicial?: Escopo;
}) {
  const { turnos, gerando, perguntar, gerarNovamente, interromper } = useConversa();
  const [valor, setValor] = useState(perguntaInicial);
  const [escopo, setEscopo] = useState<Escopo>(escopoInicial);
  const fim = useRef<HTMLDivElement>(null);
  const ultimo = turnos.at(-1);

  // biome-ignore lint/correctness/useExhaustiveDependencies: rola quando chega um turno novo ou muda o estado do último.
  useEffect(() => {
    if (turnos.length === 0) return;
    const reduzido = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    fim.current?.scrollIntoView({ behavior: reduzido ? "auto" : "smooth", block: "nearest" });
  }, [turnos.length, ultimo?.estado]);

  const enviar = async () => {
    const pergunta = valor.trim();
    if (!pergunta) return;
    setValor("");
    const estado = await perguntar(pergunta, escopo);
    if (estado === "interrompida" || estado === "erro") setValor((atual) => atual || pergunta);
  };

  return (
    <div className="sdb-journey-assistant__conversation">
      {turnos.length === 0 && (
        <Alerta title="Como o assistente responde">
          Ele consulta só o acervo das Salas. Cada resposta separa o trecho documental, a interpretação da
          equipe editorial e a síntese escrita pela IA, e numera as fontes. Quando as tradições divergem, a
          resposta mostra as diferenças sem dizer qual está certa.
        </Alerta>
      )}

      <div className="sdb-journey-assistant__turns" aria-live="off">
        {turnos.map((t) => {
          const previa = responder(t.pergunta, t.escopo);
          return (
            <div key={t.id} className="sdb-journey-assistant__turn">
              <p className="sdb-bubble">{t.pergunta}</p>
              {t.estado === "concluida" && t.resposta ? (
                <MensagemAssistente
                  resposta={t.resposta}
                  duracaoMs={(t.fim ?? t.inicio) - t.inicio}
                  gerando={gerando}
                  onGerarNovamente={() => gerarNovamente(t.id)}
                />
              ) : (
                <IndicadorConsulta
                  pergunta={t.pergunta}
                  estado={t.estado}
                  etapa={t.etapa}
                  inicio={t.inicio}
                  fim={t.fim}
                  salas={previa.salasConsultadas}
                  trechos={previa.trechosLidos}
                  onInterromper={interromper}
                />
              )}
            </div>
          );
        })}
        <div ref={fim} />
      </div>

      <CampoPerguntaIA
        valor={valor}
        onChange={setValor}
        onEnviar={enviar}
        onInterromper={interromper}
        gerando={gerando}
        erro={ultimo?.estado === "erro"}
        escopo={escopo}
        onEscopo={setEscopo}
        sugestoes={SUGESTOES}
        estado={textoEstado(ultimo)}
      />

      <div className="sdb-journey-assistant__neutrality">
        <AvisoNeutralidade />
      </div>
    </div>
  );
}
