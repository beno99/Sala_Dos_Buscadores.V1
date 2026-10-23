"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { Breadcrumbs } from "@/components/ds/Breadcrumbs";
import { Button } from "@/components/ds/Button";
import { SeloStatus } from "@/components/ds/Curadoria";
import { ModalConfirmacao } from "@/components/ds/Modal";
import { Segmented } from "@/components/ds/Segmented";
import { useToast } from "@/components/ds/Toast";
import { salaPorSlug } from "@/data/catalogo";
import type { SalaSlug, StatusEditorial } from "@/data/types";
import { excluirFonteAcao, salvarFonteAcao } from "@/server/admin/acoes";
import type { FormFonte } from "../formularios";
import { AvisoSaida, focarCampo } from "./AvisoSaida";
import { CamposFonte } from "./CamposFonte";

export interface UsoFonte {
  id: string;
  titulo: string;
  sala: SalaSlug;
  status: StatusEditorial;
}

const ORDEM = ["titulo", "autor", "tradicao", "tipo", "referencia", "url"].map((c) => `campo-fonte-${c}`);

/** Cadastro e edição de fonte bibliográfica (RNF-DOM-01). */
export function EditorFonte({
  inicial,
  usos,
  historico,
}: {
  inicial: FormFonte;
  usos: UsoFonte[];
  historico?: ReactNode;
}) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState(inicial);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [sujo, setSujo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [excluir, setExcluir] = useState(false);
  const [aba, setAba] = useState<"edicao" | "historico">("edicao");
  const publicados = usos.filter((u) => u.status === "publicado");

  const salvar = async () => {
    setSalvando(true);
    const r = await salvarFonteAcao(form);
    setSalvando(false);
    if (!r.ok) {
      setErros(r.erros ?? {});
      const primeiro = ORDEM.find((c) => r.erros?.[c]);
      if (primeiro) requestAnimationFrame(() => focarCampo(primeiro));
      toast("O foco foi para o primeiro campo com erro.", { variant: "erro", title: r.mensagem });
      return;
    }
    setSujo(false);
    toast(r.mensagem);
    if (!form.id) router.replace(`/admin/fontes/${r.valor.id}` as Route);
    else router.refresh();
  };

  const confirmarExclusao = async () => {
    if (!form.id) return;
    const r = await excluirFonteAcao(form.id);
    setExcluir(false);
    if (r.ok) {
      toast(r.mensagem, { icon: "lixeira" });
      router.push("/admin/fontes" as Route);
    } else toast("Nada foi excluído.", { variant: "erro", title: r.mensagem });
  };

  const titulo = form.titulo.trim() || (form.id ? "Sem título" : "Nova fonte");

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        itens={[
          { href: "/admin" as Route, rotulo: "Curadoria" },
          { href: "/admin/fontes" as Route, rotulo: "Fontes" },
        ]}
        atual={titulo}
      />
      <h1 className="sdb-title-1">{titulo}</h1>
      {form.id && (
        <Segmented<"edicao" | "historico">
          abas="item"
          label="Seções da fonte"
          value={aba}
          onChange={setAba}
          options={[
            { value: "edicao", label: "Edição" },
            { value: "historico", label: "Histórico" },
          ]}
        />
      )}
      <div
        id="item-painel-edicao"
        role="tabpanel"
        aria-labelledby={form.id ? "item-aba-edicao" : undefined}
        hidden={aba !== "edicao"}
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem] xl:items-start">
          <form
            className="sdb-material sdb-panel"
            noValidate
            aria-label="Dados da fonte"
            onSubmit={(e) => {
              e.preventDefault();
              void salvar();
            }}
          >
            <CamposFonte
              form={form}
              erros={erros}
              mudar={(parcial, ...campos) => {
                setForm((f) => ({ ...f, ...parcial }));
                setSujo(true);
                if (campos.length)
                  setErros((e) => Object.fromEntries(Object.entries(e).filter(([k]) => !campos.includes(k))));
              }}
            />
            <div>
              <Button type="submit" variant="primary" loading={salvando}>
                {form.id ? "Salvar fonte" : "Cadastrar fonte"}
              </Button>
            </div>
          </form>
          <aside className="flex flex-col gap-4" aria-label="Onde é usada">
            <section className="sdb-material sdb-panel" aria-labelledby="titulo-usos">
              <h2 id="titulo-usos" className="sdb-headline">
                Onde é usada
              </h2>
              {usos.length === 0 ? (
                <p className="sdb-hint">Nenhum conteúdo cita esta fonte.</p>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-3 p-0">
                  {usos.map((u) => (
                    <li key={u.id} className="flex flex-col gap-1">
                      <Link className="sdb-link" href={`/admin/salas/${u.sala}/artigos/${u.id}` as Route}>
                        {u.titulo || "Sem título"}
                      </Link>
                      <span className="sdb-row">
                        <SeloStatus status={u.status} />
                        <span className="sdb-footnote">{salaPorSlug(u.sala)?.nome}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            {form.id &&
              (publicados.length ? (
                <Alerta title="Esta fonte não pode ser excluída">
                  É citada por {publicados.length}{" "}
                  {publicados.length === 1 ? "conteúdo publicado" : "conteúdos publicados"}. Você pode
                  editá-la; para excluir, retire-a desses conteúdos antes.
                </Alerta>
              ) : (
                <div>
                  <Button variant="destructive" icon="lixeira" onClick={() => setExcluir(true)}>
                    Excluir fonte
                  </Button>
                </div>
              ))}
          </aside>
        </div>
      </div>
      {form.id && (
        <div
          id="item-painel-historico"
          role="tabpanel"
          aria-labelledby="item-aba-historico"
          hidden={aba !== "historico"}
        >
          {historico}
        </div>
      )}
      <ModalConfirmacao
        open={excluir}
        titulo="Excluir esta fonte?"
        icone="lixeira"
        destrutivo
        rotuloConfirmar="Excluir"
        onCancelar={() => setExcluir(false)}
        onConfirmar={confirmarExclusao}
      >
        <b>{form.titulo}</b>
        <br />
        {usos.length
          ? `Ela sai também de ${usos.length} ${usos.length === 1 ? "rascunho que a cita" : "rascunhos que a citam"}. `
          : ""}
        A exclusão não pode ser desfeita; fica registrada no histórico.
      </ModalConfirmacao>
      <AvisoSaida sujo={sujo && !salvando} onDescartar={() => setSujo(false)} />
    </div>
  );
}
