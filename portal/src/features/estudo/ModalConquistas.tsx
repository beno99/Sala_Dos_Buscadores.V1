"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ds/Button";
import { ConquistaLinha, type ConquistaVisual } from "@/components/ds/Conquista";
import { Sheet } from "@/components/ds/Sheet";

/**
 * Níveis e conquistas, privados. Duas vistas no mesmo Modal: as conquistas
 * (obtidas e bloqueadas, com o critério) e "Como os níveis funcionam".
 */
export function ModalConquistas({
  aberto,
  vistaInicial,
  conquistas,
  onFechar,
}: {
  aberto: boolean;
  vistaInicial: "conquistas" | "niveis";
  conquistas: ConquistaVisual[];
  onFechar: () => void;
}) {
  const id = useId();
  const [vista, setVista] = useState(vistaInicial);
  useEffect(() => {
    if (aberto) setVista(vistaInicial);
  }, [aberto, vistaInicial]);
  const obtidas = conquistas.filter((c) => c.obtida);
  const bloqueadas = conquistas.filter((c) => !c.obtida);

  return (
    <Sheet aberto={aberto} onFechar={onFechar} rotuloId={`${id}-titulo`}>
      <div className="sdb-sheet__bar">
        {vista === "niveis" ? (
          <Button variant="plain" icon="chevronEsquerda" onClick={() => setVista("conquistas")}>
            Conquistas
          </Button>
        ) : (
          <span />
        )}
        <h2 id={`${id}-titulo`} className="sdb-sheet__title">
          {vista === "conquistas" ? "Suas conquistas" : "Como os níveis funcionam"}
        </h2>
        <Button variant="plain" onClick={onFechar}>
          Fechar
        </Button>
      </div>
      <div className="sdb-sheet__body">
        {vista === "conquistas" ? (
          <>
            <p className="sdb-footnote m-0">
              {obtidas.length} de {conquistas.length} obtidas. Só você vê: não há placar nem comparação entre
              pessoas.
            </p>
            {obtidas.length > 0 && (
              <section aria-labelledby={`${id}-obtidas`} className="flex flex-col gap-2">
                <h3 id={`${id}-obtidas`} className="sdb-caption">
                  Obtidas
                </h3>
                <div className="sdb-list">
                  {obtidas.map((c) => (
                    <div key={c.id} className="px-4">
                      <ConquistaLinha c={c} />
                    </div>
                  ))}
                </div>
              </section>
            )}
            {bloqueadas.length > 0 && (
              <section aria-labelledby={`${id}-bloqueadas`} className="flex flex-col gap-2">
                <h3 id={`${id}-bloqueadas`} className="sdb-caption">
                  Ainda bloqueadas
                </h3>
                <div className="sdb-list">
                  {bloqueadas.map((c) => (
                    <div key={c.id} className="px-4">
                      <ConquistaLinha c={c} />
                    </div>
                  ))}
                </div>
              </section>
            )}
            <Button variant="secondary" onClick={() => setVista("niveis")}>
              Como os níveis funcionam
            </Button>
          </>
        ) : (
          <>
            <p className="sdb-body-sm m-0">
              Cada Sala e cada tema têm um nível só seu, na mesma escada do acervo: Iniciante, Intermediário e
              Avançado. Ele sobe com leituras concluídas, não com pontos.
            </p>
            <ul className="sdb-body-sm m-0 flex flex-col gap-2 pl-5">
              <li>Iniciante: ao começar um assunto.</li>
              <li>Intermediário: com metade dos conteúdos do assunto lidos até o fim.</li>
              <li>Avançado: com todos os conteúdos do assunto lidos.</li>
            </ul>
            <p className="sdb-body-sm m-0">
              Uma leitura conta quando você chega ao fim do texto. Os níveis medem só o estudo no acervo e não
              dizem nada sobre crença ou espiritualidade. Em Ajustes, você desliga níveis e conquistas.
            </p>
          </>
        )}
      </div>
    </Sheet>
  );
}
