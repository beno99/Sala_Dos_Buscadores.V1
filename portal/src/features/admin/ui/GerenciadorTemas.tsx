"use client";
import { useState } from "react";
import { Button } from "@/components/ds/Button";
import { CampoTexto } from "@/components/ds/Campos";
import { Icon } from "@/components/ds/Icon";
import { ModalConfirmacao } from "@/components/ds/Modal";
import { Paginacao } from "@/components/ds/Paginacao";
import { Badge } from "@/components/ds/Selos";
import type { Tema } from "@/data/types";
import { paginar } from "@/features/admin/listas";
import { ITENS_POR_PAGINA } from "@/features/admin/regras/config";
import { apagarTemaAcao, criarTemaAcao, editarTemaAcao } from "@/server/admin/temas";

type Aviso = { tipo: "ok" | "erro"; texto: string };

export function GerenciadorTemas({ temasList }: { temasList: Tema[] }) {
  const [temas, setTemas] = useState(temasList);
  const [filtro, setFiltro] = useState("");
  const [pagina, setPagina] = useState(1);
  const [editando, setEditando] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [sinonimos, setSinonimos] = useState<string[]>([]);
  const [novoSinonimo, setNovoSinonimo] = useState("");
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [paraApagar, setParaApagar] = useState<Tema | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const filtrados = temas.filter((t) => t.nome.toLowerCase().includes(filtro.trim().toLowerCase()));
  const { itens, pagina: paginaAtual, totalPaginas } = paginar(filtrados, pagina, ITENS_POR_PAGINA);

  const adicionarSinonimo = () => {
    const valor = novoSinonimo.trim();
    if (valor && !sinonimos.includes(valor)) setSinonimos([...sinonimos, valor]);
    setNovoSinonimo("");
  };

  const limpar = () => {
    setEditando(null);
    setNome("");
    setSinonimos([]);
    setNovoSinonimo("");
  };

  const comecarEditar = (tema: Tema) => {
    setEditando(tema.slug);
    setNome(tema.nome);
    setSinonimos([...tema.sinonimos]);
    setAviso(null);
  };

  const salvar = async () => {
    if (!nome.trim() || sinonimos.length === 0) {
      setAviso({ tipo: "erro", texto: "Informe o nome e ao menos um sinônimo." });
      return;
    }
    setOcupado(true);
    const dados = { nome: nome.trim(), sinonimos };
    if (editando) {
      const r = await editarTemaAcao(editando, dados);
      setOcupado(false);
      if (!r.ok) return setAviso({ tipo: "erro", texto: r.mensagem });
      setTemas((prev) => prev.map((t) => (t.slug === editando ? { ...t, ...dados } : t)));
      setAviso({ tipo: "ok", texto: "Tema atualizado." });
    } else {
      const r = await criarTemaAcao(dados);
      setOcupado(false);
      if (!r.ok) return setAviso({ tipo: "erro", texto: r.mensagem });
      setTemas((prev) => [...prev, { ...dados, slug: r.slug, criadoEm: "", criadoPor: "" }]);
      setAviso({ tipo: "ok", texto: "Tema criado." });
    }
    limpar();
  };

  const confirmarApagar = async () => {
    if (!paraApagar) return;
    setOcupado(true);
    const r = await apagarTemaAcao(paraApagar.slug);
    setOcupado(false);
    setParaApagar(null);
    if (!r.ok) return setAviso({ tipo: "erro", texto: r.mensagem });
    setTemas((prev) => prev.filter((t) => t.slug !== paraApagar.slug));
    if (editando === paraApagar.slug) limpar();
    setAviso({ tipo: "ok", texto: "Tema apagado." });
  };

  return (
    <section className="sdb-material sdb-panel">
      {aviso && (
        <p
          className={aviso.tipo === "erro" ? "sdb-error-msg" : "sdb-help"}
          role={aviso.tipo === "erro" ? "alert" : "status"}
        >
          {aviso.texto}
        </p>
      )}

      <CampoTexto
        id="filtro-temas"
        label="Filtrar por nome"
        type="search"
        value={filtro}
        placeholder="Ex.: Morte"
        onChange={(e) => {
          setFiltro(e.target.value);
          setPagina(1);
        }}
      />

      <fieldset className="sdb-fieldset">
        <legend className="sdb-caption">{editando ? "Editar tema" : "Novo tema"}</legend>

        <CampoTexto
          id="nome-tema"
          label="Nome"
          value={nome}
          placeholder="Ex.: Morte"
          onChange={(e) => setNome(e.target.value)}
        />

        <div className="sdb-row">
          <CampoTexto
            id="novo-sinonimo"
            label="Sinônimos"
            help="Digite e pressione Enter ou Tab para adicionar."
            value={novoSinonimo}
            placeholder="Ex.: apos a morte"
            onChange={(e) => setNovoSinonimo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Tab") {
                if (!novoSinonimo.trim()) return;
                e.preventDefault();
                adicionarSinonimo();
              }
            }}
          />
          <Button variant="tinted" icon="mais" onClick={adicionarSinonimo}>
            Adicionar
          </Button>
        </div>

        {sinonimos.length > 0 && (
          <ul className="sdb-row list-none p-0 m-0" aria-label="Sinônimos do tema">
            {sinonimos.map((s) => (
              <li key={s}>
                <Badge variant="neutral">
                  {s}
                  <button
                    type="button"
                    aria-label={`Remover o sinônimo ${s}`}
                    onClick={() => setSinonimos(sinonimos.filter((x) => x !== s))}
                  >
                    <Icon name="fechar" size="sm" />
                  </button>
                </Badge>
              </li>
            ))}
          </ul>
        )}

        <div className="sdb-row">
          <Button variant="primary" loading={ocupado} onClick={() => void salvar()}>
            {editando ? "Salvar alterações" : "Criar tema"}
          </Button>
          {editando && (
            <Button variant="secondary" onClick={limpar}>
              Cancelar
            </Button>
          )}
        </div>
      </fieldset>

      <ul className="flex flex-col gap-3 list-none p-0 m-0" aria-label="Temas do acervo">
        {itens.length === 0 && <li className="sdb-hint">Nenhum tema encontrado.</li>}
        {itens.map((t) => (
          <li key={t.slug} className="sdb-material sdb-row sdb-row--between p-4">
            <div>
              <p className="sdb-body">{t.nome}</p>
              <div className="sdb-row">
                {t.sinonimos.map((s) => (
                  <Badge key={s} variant="neutral">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="sdb-row">
              <Button variant="secondary" size="sm" icon="editar" onClick={() => comecarEditar(t)}>
                Editar
              </Button>
              <Button variant="destructive" size="sm" icon="lixeira" onClick={() => setParaApagar(t)}>
                Apagar
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Paginacao
        pagina={paginaAtual}
        total={totalPaginas}
        onPagina={setPagina}
        rotulo="Paginação dos temas"
      />

      <ModalConfirmacao
        open={paraApagar !== null}
        titulo="Apagar este tema?"
        icone="lixeira"
        destrutivo
        rotuloConfirmar="Apagar tema"
        carregando={ocupado}
        onCancelar={() => setParaApagar(null)}
        onConfirmar={() => void confirmarApagar()}
      >
        <b>{paraApagar?.nome}</b>
        <p>O tema sai do acervo e das buscas. Artigos e vídeos que o usam perdem essa marcação.</p>
      </ModalConfirmacao>
    </section>
  );
}
