"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { Button } from "@/components/ds/Button";
import { CampoTexto, Checkbox } from "@/components/ds/Campos";
import { Chip } from "@/components/ds/Chip";
import { Icon } from "@/components/ds/Icon";
import { Sheet } from "@/components/ds/Sheet";
import { salaPorSlug, temaPorSlug, todasAsSalas, todosOsTemas } from "@/data/catalogo";
import type { SalaSlug, TemaSlug } from "@/data/types";
import { useSessao } from "@/features/auth/SessaoProvider";
import { salvarPreferenciasAcao } from "./acoes";
import {
  type EntradaPreferencias,
  FINALIDADE_CONVICCAO,
  OPCOES_CONVICCAO,
  OUTRA_MAXIMO,
  type Preferencias,
  resumoConviccao,
  type ValorConviccao,
} from "./preferencias";

const TOTAL = 4;

const alternar = <T,>(lista: T[], v: T) => (lista.includes(v) ? lista.filter((x) => x !== v) : [...lista, v]);

/**
 * Onboarding de primeiro acesso (Onboarding): boas-vindas, interesses,
 * religião ou convicção (opcional, com consentimento) e resumo. Abre depois
 * do cadastro e no primeiro login sem preferências; "Refazer preferências",
 * em Ajustes, abre de novo com as respostas atuais.
 */
export function Onboarding({
  aberto,
  inicial = null,
  onConcluir,
}: {
  aberto: boolean;
  inicial?: Preferencias | null;
  onConcluir: () => void;
}) {
  const id = useId();
  const { atualizar } = useSessao();
  const titulo = useRef<HTMLHeadingElement>(null);
  const [etapa, setEtapa] = useState(0);
  const [temas, setTemas] = useState<TemaSlug[]>(inicial?.temas ?? []);
  const [salas, setSalas] = useState<SalaSlug[]>(inicial?.salas ?? []);
  const [conviccao, setConviccao] = useState<ValorConviccao[]>(() => {
    const c = inicial?.conviccao;
    if (c?.tipo === "nao-informar") return ["nao-informar"];
    return c?.tipo === "informada" ? [...c.opcoes] : [];
  });
  const [outra, setOutra] = useState(
    inicial?.conviccao.tipo === "informada" ? (inicial.conviccao.outra ?? "") : "",
  );
  const [consentimento, setConsentimento] = useState(inicial?.conviccao.tipo === "informada");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState<Preferencias | null>(null);
  const primeira = useRef(true);

  // Leva o foco ao título de cada etapa nova (o primeiro título recebe o foco ao abrir).
  // biome-ignore lint/correctness/useExhaustiveDependencies: roda a cada troca de etapa.
  useEffect(() => {
    if (!aberto) return;
    const t = setTimeout(() => titulo.current?.focus(), primeira.current ? 40 : 0);
    primeira.current = false;
    return () => clearTimeout(t);
  }, [etapa, aberto]);

  const informada = conviccao.some((c) => c !== "nao-informar");
  const faltaConsentimento = informada && !consentimento;

  const marcarConviccao = (v: ValorConviccao, marcado: boolean) => {
    setErro(null);
    if (v === "nao-informar") {
      setConviccao(marcado ? ["nao-informar"] : []);
      setConsentimento(false);
      return;
    }
    setConviccao((atual) => {
      const sem = atual.filter((x) => x !== "nao-informar");
      return marcado ? [...sem, v] : sem.filter((x) => x !== v);
    });
  };

  const salvar = async (entrada: EntradaPreferencias, depois: () => void) => {
    setSalvando(true);
    setErro(null);
    const r = await salvarPreferenciasAcao(entrada);
    setSalvando(false);
    if (!r.ok) {
      setErro(r.erro);
      return;
    }
    atualizar(r.valor);
    setSalvo(r.valor.preferencias);
    depois();
  };

  const continuarConviccao = () => {
    if (faltaConsentimento) {
      setErro("marque a autorização para guardar esta informação, ou escolha «Prefiro não informar».");
      return;
    }
    void salvar({ temas, salas, conviccao, outra, consentimento }, () => setEtapa(3));
  };

  const pularConviccao = () => {
    setConviccao([]);
    setConsentimento(false);
    void salvar({ temas, salas, conviccao: [], consentimento: false }, () => setEtapa(3));
  };

  // Esc vale como "Pular" de todas as etapas restantes: guarda os interesses já escolhidos.
  const pularTudo = () => {
    if (salvo || salvando) return onConcluir();
    void salvar({ temas, salas, conviccao: [], consentimento: false }, onConcluir);
  };

  const tituloEtapa = (texto: string) => (
    <h2 ref={titulo} id={`${id}-titulo`} className="sdb-onboarding__title" tabIndex={-1}>
      {texto}
    </h2>
  );

  return (
    <Sheet aberto={aberto} onFechar={pularTudo} rotuloId={`${id}-titulo`} className="sdb-onboarding">
      <div className="sdb-onboarding__top">
        <span className="sdb-onboarding__status" aria-live="polite">
          Etapa {etapa + 1} de {TOTAL}
        </span>
        <div className="sdb-dots" aria-hidden="true">
          {Array.from({ length: TOTAL }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: os pontos são fixos, um por etapa.
            <button key={i} type="button" tabIndex={-1} aria-current={i === etapa} />
          ))}
        </div>
      </div>

      {erro && (
        <div className="px-6 pt-3">
          <Alerta variant="error" title={`Erro: ${erro}`} />
        </div>
      )}

      {etapa === 0 && (
        <section className="sdb-onboarding__step">
          {tituloEtapa("Boas-vindas à Sala dos Buscadores")}
          <p className="sdb-onboarding__lead">
            Aqui cada tradição fala com as próprias fontes, organizada em Salas. Duas perguntas rápidas ajudam
            a sugerir por onde começar. As duas são opcionais e todo o acervo continua aberto.
          </p>
          <div className="sdb-onboarding__actions" style={{ padding: "8px 0 0" }}>
            <span />
            <Button variant="primary" onClick={() => setEtapa(1)}>
              Continuar
            </Button>
          </div>
        </section>
      )}

      {etapa === 1 && (
        <section className="sdb-onboarding__step">
          {tituloEtapa("Que assuntos interessam a você?")}
          <p className="sdb-onboarding__lead">
            Escolha quantos quiser. Isso só muda a ordem das sugestões; nada do acervo fica escondido.
          </p>
          <div className="sdb-onboarding__options" role="group" aria-label="Temas">
            {todosOsTemas().map((t) => (
              <Chip
                key={t.slug}
                pressed={temas.includes(t.slug)}
                onClick={() => setTemas((x) => alternar(x, t.slug))}
              >
                {t.nome}
              </Chip>
            ))}
          </div>
          <div className="sdb-onboarding__options" role="group" aria-label="Salas">
            {todasAsSalas().map((s) => (
              <Chip
                key={s.slug}
                arc
                pressed={salas.includes(s.slug)}
                onClick={() => setSalas((x) => alternar(x, s.slug))}
              >
                {s.nome}
              </Chip>
            ))}
          </div>
          <div className="sdb-onboarding__actions" style={{ padding: "8px 0 0" }}>
            <Button
              variant="plain"
              onClick={() => {
                setTemas([]);
                setSalas([]);
                setEtapa(2);
              }}
            >
              Pular por agora
            </Button>
            <Button variant="secondary" onClick={() => setEtapa(0)}>
              Voltar
            </Button>
            <Button variant="primary" onClick={() => setEtapa(2)}>
              Continuar
            </Button>
          </div>
        </section>
      )}

      {etapa === 2 && (
        <section className="sdb-onboarding__step">
          {tituloEtapa("Você tem uma religião ou convicção?")}
          <p className="sdb-onboarding__purpose">
            <Icon name="cadeado" />
            <span>{FINALIDADE_CONVICCAO}</span>
          </p>
          <fieldset className="sdb-fieldset">
            <legend className="sdb-sr">Religião ou convicção</legend>
            <div className="sdb-onboarding__checks">
              {OPCOES_CONVICCAO.map((o) => (
                <Checkbox
                  key={o.valor}
                  label={o.rotulo}
                  checked={conviccao.includes(o.valor)}
                  onChange={(e) => marcarConviccao(o.valor, e.target.checked)}
                />
              ))}
            </div>
          </fieldset>
          {conviccao.includes("outra") && (
            <CampoTexto
              label="Qual?"
              maxLength={OUTRA_MAXIMO}
              value={outra}
              onChange={(e) => {
                setOutra(e.target.value);
                setErro(null);
              }}
            />
          )}
          {informada && (
            <div className="sdb-consent">
              <Checkbox
                label="Autorizo guardar esta informação para sugerir conteúdos."
                checked={consentimento}
                onChange={(e) => {
                  setConsentimento(e.target.checked);
                  setErro(null);
                }}
              />
              <p className="sdb-help" style={{ paddingLeft: 34 }}>
                Dado sensível (LGPD, art. 11). Você pode revogar em Ajustes a qualquer momento.
              </p>
            </div>
          )}
          <div className="sdb-onboarding__actions" style={{ padding: "8px 0 0" }}>
            <Button variant="plain" onClick={pularConviccao} disabled={salvando}>
              Pular
            </Button>
            <Button variant="secondary" onClick={() => setEtapa(1)}>
              Voltar
            </Button>
            <Button
              variant="primary"
              aria-disabled={faltaConsentimento}
              loading={salvando}
              onClick={continuarConviccao}
            >
              Continuar
            </Button>
          </div>
        </section>
      )}

      {etapa === 3 && salvo && (
        <section className="sdb-onboarding__step">
          {tituloEtapa("Preferências salvas")}
          <ul className="sdb-onboarding__summary">
            <li>
              Interesses
              <span>
                {[
                  ...salvo.temas.map((t) => temaPorSlug(t)?.nome),
                  ...salvo.salas.map((s) => salaPorSlug(s)?.nome),
                ]
                  .filter(Boolean)
                  .join(", ") || "Nenhum escolhido"}
              </span>
            </li>
            <li>
              Religião ou convicção <span>{resumoConviccao(salvo.conviccao)}</span>
            </li>
          </ul>
          <p className="sdb-onboarding__lead">
            Dá para mudar ou apagar tudo em Ajustes, em "Refazer preferências".
          </p>
          <div className="sdb-onboarding__actions" style={{ padding: "8px 0 0" }}>
            <Button variant="secondary" onClick={() => setEtapa(2)}>
              Voltar
            </Button>
            <Button variant="primary" onClick={onConcluir}>
              Ir para o Portal
            </Button>
          </div>
        </section>
      )}
    </Sheet>
  );
}
