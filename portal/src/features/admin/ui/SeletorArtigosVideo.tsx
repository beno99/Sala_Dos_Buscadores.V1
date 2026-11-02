"use client";
import { useState, useTransition } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { Button } from "@/components/ds/Button";
import { CampoTexto } from "@/components/ds/Campos";
import { formatarData } from "@/lib/texto";
import type { ResultadoAcao } from "@/server/admin/editorial";
import { STATUS_ROTULO } from "../regras/csv";
import { type ArtigoLigavel, artigosParaVincular } from "../regras/vinculos-video";

export function SeletorArtigosVideo({
  artigos,
  sala,
  selecionados,
  onMudar,
  atualizar,
  erro,
}: {
  artigos: ArtigoLigavel[];
  sala: { slug: string; nome: string };
  selecionados: string[];
  onMudar: (ids: string[]) => void;
  atualizar: (sala: string) => Promise<ResultadoAcao<ArtigoLigavel[]>>;
  erro?: string;
}) {
  const [listaArtigos, setListaArtigos] = useState(artigos);
  const [buscaArtigos, setBuscaArtigos] = useState("");
  const [limiteArtigos, setLimiteArtigos] = useState(10);
  const [erroArtigos, setErroArtigos] = useState("");
  const [atualizandoArtigos, iniciarAtualizacao] = useTransition();
  const atualizarArtigos = () =>
    iniciarAtualizacao(async () => {
      setErroArtigos("");
      try {
        const resultado = await atualizar(sala.slug);
        if (resultado.ok) setListaArtigos(resultado.valor);
        else setErroArtigos(resultado.mensagem);
      } catch {
        setErroArtigos("Não foi possível atualizar os artigos. Tente novamente.");
      }
    });
  const doMesmoSala = artigosParaVincular(listaArtigos, sala.slug, buscaArtigos);
  const visiveis = doMesmoSala.slice(0, limiteArtigos);
  return (
    <section className="sdb-material sdb-panel" aria-labelledby="sec-artigos">
      <h2 id="sec-artigos" className="sdb-headline">
        Artigos ligados
      </h2>
      <p className="sdb-help">
        O vídeo aparece em “Vídeos relacionados” na página de cada artigo publicado escolhido.
      </p>
      <CampoTexto
        id="busca-artigos-video"
        label="Buscar artigos do acervo"
        type="search"
        value={buscaArtigos}
        onChange={(e) => {
          setBuscaArtigos(e.target.value);
          setLimiteArtigos(10);
        }}
        help="A busca considera todos os artigos disponíveis, inclusive os que ainda não aparecem na lista."
      />
      <div className="sdb-row">
        <p className="sdb-footnote" role="status">
          {new Set(selecionados).size} artigo(s) selecionado(s)
        </p>
        <Button variant="secondary" disabled={atualizandoArtigos} onClick={atualizarArtigos}>
          {atualizandoArtigos ? "Atualizando…" : erroArtigos ? "Tentar novamente" : "Atualizar artigos"}
        </Button>
      </div>
      {erroArtigos && (
        <Alerta variant="error" title="Não foi possível atualizar">
          {erroArtigos}
        </Alerta>
      )}
      {erro && (
        <p id="campo-artigos" className="sdb-error-msg" tabIndex={-1}>
          {erro}
        </p>
      )}
      {selecionados
        .filter((id) => !listaArtigos.some((a) => a.id === id))
        .map((id) => (
          <label key={id} className="sdb-check">
            <input type="checkbox" checked onChange={() => onMudar(selecionados.filter((a) => a !== id))} />
            <span>
              Artigo indisponível nesta lista
              <small>Vínculo preservado: {id}. Desmarque para remover apenas a associação.</small>
            </span>
          </label>
        ))}
      {doMesmoSala.length === 0 ? (
        <p className="sdb-hint">
          {buscaArtigos
            ? "Nenhum artigo encontrado para esta busca."
            : "Não há artigos elegíveis. Sem artigo, o vídeo fica só na Sala."}
        </p>
      ) : (
        <fieldset className="sdb-fieldset" aria-busy={atualizandoArtigos}>
          <legend className="sdb-caption">{buscaArtigos ? "Resultados da busca" : "Artigos recentes"}</legend>
          {visiveis.map((a) => (
            <label key={a.id} className="sdb-check">
              <input
                type="checkbox"
                checked={selecionados.includes(a.id)}
                onChange={(e) =>
                  onMudar(
                    e.target.checked
                      ? [...new Set([...selecionados, a.id])]
                      : selecionados.filter((id) => id !== a.id),
                  )
                }
              />
              <span>
                {a.titulo}
                <small>
                  {a.sala} · {STATUS_ROTULO[a.status]} · Criado em {formatarData(a.criadoEm.slice(0, 10))}
                  {a.status !== "publicado" &&
                    " · Aparece no portal quando o artigo e o vídeo forem publicados"}
                </small>
              </span>
            </label>
          ))}
          <p className="sdb-footnote">
            {visiveis.length} de {doMesmoSala.length} artigos
          </p>
          {visiveis.length < doMesmoSala.length && (
            <Button variant="secondary" onClick={() => setLimiteArtigos((n) => n + 10)}>
              Carregar mais artigos
            </Button>
          )}
        </fieldset>
      )}
    </section>
  );
}
