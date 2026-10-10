"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ds/Button";
import { Select } from "@/components/ds/CamposExtras";
import { Badge } from "@/components/ds/Selos";
import { useToast } from "@/components/ds/Toast";
import type { GrupoVaga } from "@/features/destaques/vagas";
import { definirVagaDestaqueAcao, moverVagaDestaqueAcao } from "@/server/admin/acoes";

export interface GrupoEditavel {
  grupo: GrupoVaga;
  nome: string;
  ajuda: string;
  vagas: { nome: string; escolhido: string | null; titulo: string; automatica: boolean }[];
  opcoes: { value: string; label: string }[];
}

/** Vagas de Destaques: escolher, trocar, reordenar e esvaziar. Vaga vazia fica automática. */
export function EditorDestaques({ grupos }: { grupos: GrupoEditavel[] }) {
  const router = useRouter();
  const toast = useToast();
  const [pendente, iniciar] = useTransition();
  const executar = (acao: () => Promise<{ ok: boolean; mensagem: string }>) =>
    iniciar(async () => {
      const r = await acao();
      toast(r.mensagem);
      if (r.ok) router.refresh();
    });

  return (
    <div className="flex flex-col gap-8">
      {grupos.map((g) => (
        <section key={g.grupo} className="flex flex-col gap-4" aria-labelledby={`grupo-${g.grupo}`}>
          <div className="flex flex-col gap-1">
            <h2 id={`grupo-${g.grupo}`} className="sdb-title-2">
              {g.nome}
            </h2>
            <p className="sdb-footnote m-0">{g.ajuda}</p>
          </div>
          <ol className="sdb-list m-0 list-none p-0">
            {g.vagas.map((v, i) => (
              <li key={v.nome} className="sdb-list-row flex-wrap">
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Select
                    label={v.nome}
                    value={v.escolhido ?? ""}
                    disabled={pendente}
                    opcoes={[{ value: "", label: "Automática (publicado mais recente)" }, ...g.opcoes]}
                    onChange={(e) =>
                      executar(() => definirVagaDestaqueAcao(g.grupo, i, e.target.value || null))
                    }
                  />
                  {v.automatica && (
                    <p className="sdb-help m-0">
                      <Badge variant="neutral">Automática</Badge> Agora: {v.titulo}
                    </p>
                  )}
                </div>
                {g.vagas.length > 1 && (
                  <div className="sdb-row" style={{ gap: 4 }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      iconOnly
                      icon="chevronEsquerda"
                      aria-label={`Subir ${v.nome}`}
                      disabled={pendente || i === 0}
                      onClick={() => executar(() => moverVagaDestaqueAcao(g.grupo, i, -1))}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      iconOnly
                      icon="chevronDireita"
                      aria-label={`Descer ${v.nome}`}
                      disabled={pendente || i === g.vagas.length - 1}
                      onClick={() => executar(() => moverVagaDestaqueAcao(g.grupo, i, 1))}
                    />
                  </div>
                )}
                {v.escolhido && (
                  <Button
                    variant="plain"
                    size="sm"
                    disabled={pendente}
                    onClick={() => executar(() => definirVagaDestaqueAcao(g.grupo, i, null))}
                  >
                    Esvaziar
                  </Button>
                )}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
