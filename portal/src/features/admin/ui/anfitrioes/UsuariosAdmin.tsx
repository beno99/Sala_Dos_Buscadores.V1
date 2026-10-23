"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useId, useState } from "react";
import { Button } from "@/components/ds/Button";
import { CampoTexto } from "@/components/ds/Campos";
import { RadioGrupo, Select } from "@/components/ds/CamposExtras";
import { Icon } from "@/components/ds/Icon";
import { ModalConfirmacao } from "@/components/ds/Modal";
import { Segmented } from "@/components/ds/Segmented";
import { Sheet } from "@/components/ds/Sheet";
import { TabelaDados } from "@/components/ds/TabelaDados";
import { useToast } from "@/components/ds/Toast";
import type { StatusCandidatura, StatusConvite } from "@/data/types";
import { formatarData } from "@/lib/texto";
import {
  convidarAcao,
  decidirCandidaturaAcao,
  promoverAcao,
  rebaixarAcao,
  revogarConviteAcao,
} from "@/server/anfitriao/acoes-admin";
import { SheetMotivo } from "../SheetMotivo";

export type Aba = "usuarios" | "candidaturas" | "convites";

export interface UsuarioVisual {
  id: string;
  pseudonimo: string;
  email: string;
  papel: "membro" | "anfitriao" | "administrador";
  membroDesde: string;
  nomePublico?: string;
  salas: number;
}

export interface CandidaturaVisual {
  id: string;
  nome: string;
  email: string;
  credencial: string;
  apresentacao: string;
  link?: string;
  status: StatusCandidatura;
  enviadaEm: string;
  motivo?: string;
}

export interface ConviteVisual {
  id: string;
  email: string;
  criadoEm: string;
  expiraEm: string;
  situacao: StatusConvite;
}

const PAPEL: Record<UsuarioVisual["papel"], string> = {
  membro: "Membro",
  anfitriao: "Anfitrião",
  administrador: "Administrador",
};

const data = (iso: string) => formatarData(iso.slice(0, 10));

function SituacaoConvite({ s }: { s: StatusConvite }) {
  if (s === "pendente")
    return (
      <span className="sdb-badge">
        <i className="sdb-badge__dot sdb-badge__dot--half" />
        Pendente
      </span>
    );
  if (s === "usado")
    return (
      <span className="sdb-badge">
        <i className="sdb-badge__dot" />
        Usado
      </span>
    );
  return (
    <span className="sdb-badge sdb-badge--neutral">
      <Icon name={s === "expirado" ? "relogio" : "cadeado"} size="sm" />
      {s === "expirado" ? "Expirado" : "Revogado"}
    </span>
  );
}

function SituacaoCandidatura({ s }: { s: StatusCandidatura }) {
  if (s === "pendente")
    return (
      <span className="sdb-badge">
        <i className="sdb-badge__dot sdb-badge__dot--half" />
        Pendente
      </span>
    );
  if (s === "aprovada")
    return (
      <span className="sdb-badge">
        <i className="sdb-badge__dot" />
        Aprovada
      </span>
    );
  return (
    <span className="sdb-badge sdb-badge--critical">
      <Icon name="devolver" size="sm" />
      Recusada
    </span>
  );
}

type Pedido =
  | { tipo: "promover"; usuario: UsuarioVisual }
  | { tipo: "rebaixar"; usuario: UsuarioVisual }
  | { tipo: "aprovar"; candidatura: CandidaturaVisual }
  | { tipo: "recusar"; candidatura: CandidaturaVisual }
  | { tipo: "revogar"; convite: ConviteVisual };

/** Usuários, candidaturas e convites (§6 · /admin/usuarios). */
export function UsuariosAdmin({
  abaInicial,
  usuarios,
  candidaturas,
  convites,
}: {
  abaInicial: Aba;
  usuarios: UsuarioVisual[];
  candidaturas: CandidaturaVisual[];
  convites: ConviteVisual[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [aba, setAba] = useState<Aba>(abaInicial);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [email, setEmail] = useState("");
  const [erroEmail, setErroEmail] = useState<string | null>(null);
  const pendentes = candidaturas.filter((c) => c.status === "pendente").length;

  const executar = async (acao: () => Promise<{ ok: boolean; mensagem: string }>) => {
    setOcupado(true);
    const r = await acao();
    setOcupado(false);
    if (!r.ok) {
      toast(r.mensagem.replace(/^Erro: /, ""), { variant: "erro", title: "Erro: não foi possível concluir" });
      return false;
    }
    setPedido(null);
    toast(r.mensagem);
    router.refresh();
    return true;
  };

  const convidar = async (e: FormEvent) => {
    e.preventDefault();
    setOcupado(true);
    const r = await convidarAcao(email);
    setOcupado(false);
    if (!r.ok) {
      const campo = (r as { erros?: Record<string, string> }).erros?.["campo-email"];
      setErroEmail(campo ?? r.mensagem.replace(/^Erro: /, ""));
      return;
    }
    setEmail("");
    toast(r.mensagem);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <Segmented<Aba>
        abas="usuarios"
        label="Seções de usuários"
        value={aba}
        onChange={(v) => {
          setAba(v);
          window.history.replaceState(null, "", `/admin/usuarios${v === "usuarios" ? "" : `?aba=${v}`}`);
        }}
        options={[
          { value: "usuarios", label: "Usuários", count: usuarios.length },
          { value: "candidaturas", label: "Candidaturas", count: pendentes || undefined },
          { value: "convites", label: "Convites" },
        ]}
      />

      <div
        id="usuarios-painel-usuarios"
        role="tabpanel"
        aria-labelledby="usuarios-aba-usuarios"
        hidden={aba !== "usuarios"}
      >
        <TabelaDados<UsuarioVisual>
          legenda={`Contas · ${usuarios.length}`}
          itens={usuarios}
          chave={(u) => u.id}
          rotuloItem={(u) => u.pseudonimo}
          vazio="Nenhuma conta."
          colunas={[
            {
              id: "conta",
              cabecalho: "Conta",
              celula: (u) => (
                <>
                  <span className="sdb-table__title">
                    {u.papel === "anfitriao" || u.salas > 0 ? (
                      <Link href={`/admin/anfitrioes/${u.id}` as Route}>{u.nomePublico ?? u.pseudonimo}</Link>
                    ) : (
                      u.pseudonimo
                    )}
                  </span>
                  <span className="sdb-table__sub">{u.email}</span>
                </>
              ),
            },
            {
              id: "papel",
              cabecalho: "Papel",
              celula: (u) => (
                <span className={u.papel === "membro" ? "sdb-badge sdb-badge--neutral" : "sdb-badge"}>
                  {u.papel === "anfitriao" && <Icon name="anfitriao" size="sm" />}
                  {PAPEL[u.papel]}
                </span>
              ),
            },
            { id: "desde", cabecalho: "Desde", className: "sdb-tabular", celula: (u) => data(u.membroDesde) },
            {
              id: "acoes",
              cabecalho: "Ações",
              cabecalhoOculto: true,
              className: "sdb-table__actions",
              celula: (u) =>
                u.papel === "membro" ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPedido({ tipo: "promover", usuario: u })}
                  >
                    Promover a anfitrião
                  </Button>
                ) : u.papel === "anfitriao" ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPedido({ tipo: "rebaixar", usuario: u })}
                  >
                    Tirar o papel
                  </Button>
                ) : null,
            },
          ]}
        />
      </div>

      <div
        id="usuarios-painel-candidaturas"
        role="tabpanel"
        aria-labelledby="usuarios-aba-candidaturas"
        hidden={aba !== "candidaturas"}
      >
        <TabelaDados<CandidaturaVisual>
          legenda={`Candidaturas · ${pendentes} pendentes`}
          itens={candidaturas}
          chave={(c) => c.id}
          rotuloItem={(c) => c.nome}
          vazio="Nenhuma candidatura ainda."
          colunas={[
            {
              id: "nome",
              cabecalho: "Candidatura",
              celula: (c) => (
                <>
                  <span className="sdb-table__title">{c.nome}</span>
                  <span className="sdb-table__sub">
                    {c.credencial} · {c.email}
                  </span>
                  <span className="sdb-table__sub">{c.apresentacao}</span>
                  {c.link && (
                    <span className="sdb-table__sub">
                      <a className="sdb-link" href={c.link} target="_blank" rel="noopener noreferrer">
                        {c.link}
                      </a>
                    </span>
                  )}
                  {c.motivo && <span className="sdb-table__sub">Motivo da recusa: {c.motivo}</span>}
                </>
              ),
            },
            {
              id: "enviada",
              cabecalho: "Enviada",
              className: "sdb-tabular",
              celula: (c) => data(c.enviadaEm),
            },
            { id: "status", cabecalho: "Situação", celula: (c) => <SituacaoCandidatura s={c.status} /> },
            {
              id: "acoes",
              cabecalho: "Ações",
              cabecalhoOculto: true,
              className: "sdb-table__actions",
              celula: (c) =>
                c.status === "pendente" ? (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setPedido({ tipo: "aprovar", candidatura: c })}
                    >
                      Aprovar
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPedido({ tipo: "recusar", candidatura: c })}
                    >
                      Recusar
                    </Button>
                  </>
                ) : null,
            },
          ]}
        />
      </div>

      <div
        id="usuarios-painel-convites"
        role="tabpanel"
        aria-labelledby="usuarios-aba-convites"
        hidden={aba !== "convites"}
      >
        <div className="flex flex-col gap-4">
          <form
            className="sdb-material sdb-panel max-w-read"
            noValidate
            onSubmit={convidar}
            aria-label="Convidar anfitrião"
          >
            <h2 className="sdb-headline">Convidar</h2>
            <CampoTexto
              id="campo-email"
              label="E-mail"
              type="email"
              inputMode="email"
              placeholder="nome@exemplo.com"
              help="O convite vale 7 dias e só pode ser usado uma vez. O e-mail fica na caixa de saída."
              value={email}
              error={erroEmail ?? undefined}
              onChange={(e) => {
                setEmail(e.target.value);
                setErroEmail(null);
              }}
            />
            <div>
              <Button type="submit" variant="primary" icon="enviar" loading={ocupado && !pedido}>
                Convidar
              </Button>
            </div>
          </form>
          <TabelaDados<ConviteVisual>
            legenda={`Convites · ${convites.length}`}
            itens={convites}
            chave={(c) => c.id}
            rotuloItem={(c) => c.email}
            vazio="Nenhum convite enviado."
            colunas={[
              {
                id: "email",
                cabecalho: "E-mail",
                celula: (c) => <span className="sdb-table__title">{c.email}</span>,
              },
              {
                id: "criado",
                cabecalho: "Enviado",
                className: "sdb-tabular",
                celula: (c) => data(c.criadoEm),
              },
              {
                id: "expira",
                cabecalho: "Vale até",
                className: "sdb-tabular",
                celula: (c) => data(c.expiraEm),
              },
              { id: "situacao", cabecalho: "Situação", celula: (c) => <SituacaoConvite s={c.situacao} /> },
              {
                id: "acoes",
                cabecalho: "Ações",
                cabecalhoOculto: true,
                className: "sdb-table__actions",
                celula: (c) =>
                  c.situacao === "pendente" ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPedido({ tipo: "revogar", convite: c })}
                    >
                      Revogar
                    </Button>
                  ) : null,
              },
            ]}
          />
        </div>
      </div>

      <ModalConfirmacao
        open={pedido?.tipo === "promover"}
        titulo="Promover a anfitrião?"
        icone="anfitriao"
        rotuloConfirmar="Promover"
        carregando={ocupado}
        onCancelar={() => setPedido(null)}
        onConfirmar={() => pedido?.tipo === "promover" && executar(() => promoverAcao(pedido.usuario.id))}
      >
        {pedido?.tipo === "promover" ? pedido.usuario.pseudonimo : ""} passa a manter Salas próprias, sempre
        com a revisão da curadoria. Ao entrar, completa o perfil público.
      </ModalConfirmacao>

      <ModalConfirmacao
        open={pedido?.tipo === "aprovar"}
        titulo="Aprovar a candidatura?"
        icone="check"
        rotuloConfirmar="Aprovar"
        carregando={ocupado}
        onCancelar={() => setPedido(null)}
        onConfirmar={() =>
          pedido?.tipo === "aprovar" &&
          executar(() => decidirCandidaturaAcao(pedido.candidatura.id, "aprovar"))
        }
      >
        {pedido?.tipo === "aprovar" ? pedido.candidatura.nome : ""} vira anfitrião e recebe um e-mail. O
        perfil público começa com os dados da candidatura.
      </ModalConfirmacao>

      <ModalConfirmacao
        open={pedido?.tipo === "revogar"}
        titulo="Revogar o convite?"
        icone="cadeado"
        destrutivo
        rotuloConfirmar="Revogar"
        carregando={ocupado}
        onCancelar={() => setPedido(null)}
        onConfirmar={() =>
          pedido?.tipo === "revogar" && executar(() => revogarConviteAcao(pedido.convite.id))
        }
      >
        O link enviado para {pedido?.tipo === "revogar" ? pedido.convite.email : ""} deixa de funcionar.
      </ModalConfirmacao>

      <SheetMotivo
        aberto={pedido?.tipo === "recusar"}
        titulo="Recusar a candidatura"
        rotuloConfirmar="Recusar"
        carregando={ocupado}
        onFechar={() => setPedido(null)}
        onConfirmar={(motivo) =>
          pedido?.tipo === "recusar" &&
          executar(() => decidirCandidaturaAcao(pedido.candidatura.id, "recusar", motivo))
        }
      >
        <p className="sdb-body-sm m-0">
          {pedido?.tipo === "recusar" ? pedido.candidatura.nome : ""} vê o motivo nos Ajustes e no e-mail, e
          pode se candidatar de novo.
        </p>
      </SheetMotivo>

      <SheetRebaixar
        usuario={pedido?.tipo === "rebaixar" ? pedido.usuario : null}
        destinos={usuarios.filter(
          (u) => u.papel === "anfitriao" && u.id !== (pedido?.tipo === "rebaixar" ? pedido.usuario.id : ""),
        )}
        carregando={ocupado}
        onFechar={() => setPedido(null)}
        onConfirmar={(opcao) =>
          pedido?.tipo === "rebaixar" && executar(() => rebaixarAcao(pedido.usuario.id, opcao))
        }
      />
    </div>
  );
}

type Opcao = "manter" | "despublicar" | "transferir";

/** Tirar o papel de anfitrião (§9): a curadoria escolhe o que acontece com as Salas. */
function SheetRebaixar({
  usuario,
  destinos,
  carregando,
  onFechar,
  onConfirmar,
}: {
  usuario: UsuarioVisual | null;
  destinos: UsuarioVisual[];
  carregando: boolean;
  onFechar: () => void;
  onConfirmar: (
    opcao: { tipo: "manter" } | { tipo: "despublicar" } | { tipo: "transferir"; para: string },
  ) => void;
}) {
  const id = useId();
  const [opcao, setOpcao] = useState<Opcao | null>(null);
  const [destino, setDestino] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const confirmar = () => {
    if (!opcao) return setErro("escolha o que acontece com as Salas.");
    if (opcao === "transferir") {
      if (!destino) return setErro("escolha o anfitrião que recebe as Salas.");
      return onConfirmar({ tipo: "transferir", para: destino });
    }
    onConfirmar({ tipo: opcao });
  };

  return (
    <Sheet
      aberto={Boolean(usuario)}
      onFechar={() => {
        setOpcao(null);
        setDestino("");
        setErro(null);
        onFechar();
      }}
      rotuloId={`${id}-titulo`}
    >
      <div className="sdb-sheet__bar">
        <Button variant="plain" onClick={onFechar}>
          Cancelar
        </Button>
        <h2 id={`${id}-titulo`} className="sdb-sheet__title">
          Tirar o papel de anfitrião
        </h2>
        <Button variant="destructive" size="sm" loading={carregando} onClick={confirmar}>
          Confirmar
        </Button>
      </div>
      <div className="sdb-sheet__body">
        <p className="sdb-body-sm m-0">
          {usuario?.nomePublico ?? usuario?.pseudonimo} volta a ser membro. O que estava em revisão volta a
          rascunho em qualquer opção.
        </p>
        <RadioGrupo<Opcao>
          id={`${id}-opcao`}
          legenda="O que acontece com as Salas"
          nome={`${id}-opcao`}
          valor={opcao}
          error={erro && !opcao ? erro : undefined}
          onChange={(v) => {
            setOpcao(v);
            setErro(null);
          }}
          opcoes={[
            {
              value: "manter",
              label: "Manter publicado e congelado",
              help: "Nada sai do ar e ninguém edita. A curadoria só pode arquivar ou transferir depois.",
            },
            {
              value: "despublicar",
              label: "Despublicar tudo",
              help: "Salas e artigos vão para arquivado. Nada é apagado.",
            },
            {
              value: "transferir",
              label: "Transferir para outro anfitrião",
              help: "As Salas mudam de dono; os artigos já publicados mantêm a assinatura do autor original.",
            },
          ]}
        />
        {opcao === "transferir" && (
          <Select
            id={`${id}-destino`}
            label="Anfitrião que recebe"
            value={destino}
            error={erro && !destino ? erro : undefined}
            opcoes={[
              { value: "", label: destinos.length ? "Escolha o anfitrião" : "Não há outro anfitrião" },
              ...destinos.map((d) => ({ value: d.id, label: d.nomePublico ?? d.pseudonimo })),
            ]}
            onChange={(e) => {
              setDestino(e.target.value);
              setErro(null);
            }}
          />
        )}
      </div>
    </Sheet>
  );
}
