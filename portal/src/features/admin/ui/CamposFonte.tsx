"use client";

import { CampoTexto } from "@/components/ds/Campos";
import { RadioGrupo, Select } from "@/components/ds/CamposExtras";
import { CardFonte } from "@/components/ds/CardFonte";
import type { Placa, TipoFonte } from "@/data/types";
import type { FormFonte } from "../formularios";

const TIPOS: TipoFonte[] = ["Fonte primária", "Tradução comentada", "Estudo acadêmico", "Edição crítica"];

export const PLACAS: { value: Placa; label: string }[] = [
  { value: "bordo", label: "Bordô" },
  { value: "grafite", label: "Grafite" },
  { value: "bege", label: "Bege" },
];

/** Campos de uma fonte bibliográfica, com pré-visualização pelo Card de fonte. */
export function CamposFonte({
  form,
  erros,
  mudar,
  prefixo = "campo-fonte",
}: {
  form: FormFonte;
  erros: Record<string, string>;
  mudar: (parcial: Partial<FormFonte>, ...campos: string[]) => void;
  prefixo?: string;
}) {
  const id = (c: string) => `${prefixo}-${c}`;
  const erro = (c: string) => erros[`campo-fonte-${c}`];
  return (
    <div className="flex flex-col gap-5">
      <CampoTexto
        id={id("titulo")}
        label="Título da obra"
        placeholder="Ex.: The Nag Hammadi Scriptures"
        value={form.titulo}
        error={erro("titulo")}
        onChange={(e) => mudar({ titulo: e.target.value }, "campo-fonte-titulo")}
      />
      <CampoTexto
        id={id("autor")}
        label="Autor, editor ou tradutor"
        placeholder="Ex.: Marvin Meyer (ed.)"
        help="Com o papel entre parênteses: (ed.), (trad.), (autora)."
        value={form.autor}
        error={erro("autor")}
        onChange={(e) => mudar({ autor: e.target.value }, "campo-fonte-autor")}
      />
      <CampoTexto
        id={id("tradicao")}
        label="Tradição"
        placeholder="Ex.: Gnosticismo cristão"
        value={form.tradicao}
        error={erro("tradicao")}
        onChange={(e) => mudar({ tradicao: e.target.value }, "campo-fonte-tradicao")}
      />
      <Select
        id={id("tipo")}
        label="Tipo de fonte"
        value={form.tipo}
        error={erro("tipo")}
        opcoes={TIPOS.map((t) => ({ value: t, label: t }))}
        onChange={(e) => mudar({ tipo: e.target.value as TipoFonte }, "campo-fonte-tipo")}
      />
      <CampoTexto
        id={id("referencia")}
        label="Referência"
        placeholder="Ex.: HarperOne, 2007"
        help="Editora e ano, ou o documento de origem."
        value={form.referencia}
        error={erro("referencia")}
        onChange={(e) => mudar({ referencia: e.target.value }, "campo-fonte-referencia")}
      />
      <CampoTexto
        id={id("url")}
        label="Endereço na internet (opcional)"
        type="url"
        inputMode="url"
        placeholder="https://www.cambridge.org/…"
        help="Só para edições com acesso legítimo. Abre em nova aba."
        value={form.url}
        error={erro("url")}
        onChange={(e) => mudar({ url: e.target.value }, "campo-fonte-url")}
      />
      <RadioGrupo<Placa>
        id={id("capa")}
        legenda="Capa composta"
        nome={id("capa")}
        valor={form.capa}
        help="Placa da marca com a inicial. Nunca a capa de uma editora sem licença."
        opcoes={PLACAS}
        onChange={(capa) => mudar({ capa })}
      />
      <CampoTexto
        id={id("inicial")}
        label="Inicial da capa"
        maxLength={1}
        placeholder={form.titulo.trim()[0]?.toUpperCase() ?? "N"}
        help="Uma letra. Em branco, usa a primeira letra do título."
        value={form.inicial}
        onChange={(e) => mudar({ inicial: e.target.value.toUpperCase() })}
      />
      <div className="flex flex-col gap-2">
        <span className="sdb-caption">Pré-visualização</span>
        <CardFonte
          fonte={{
            id: form.id ?? "previa",
            titulo: form.titulo || "Título da obra",
            autor: form.autor || "Autor (papel)",
            tradicao: form.tradicao || "Tradição",
            tipo: form.tipo,
            referencia: form.referencia || "Editora, ano",
            capa: form.capa,
            inicial: (form.inicial || form.titulo.trim()[0] || "?").toUpperCase(),
          }}
        />
      </div>
    </div>
  );
}
