"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Button } from "@/components/ds/Button";
import { CampoTexto } from "@/components/ds/Campos";
import { RadioGrupo, Select } from "@/components/ds/CamposExtras";
import { Icon } from "@/components/ds/Icon";
import { ModalConfirmacao } from "@/components/ds/Modal";
import { Paginacao } from "@/components/ds/Paginacao";
import { Segmented } from "@/components/ds/Segmented";
import { Sheet } from "@/components/ds/Sheet";
import { TabelaDados } from "@/components/ds/TabelaDados";
import { useToast } from "@/components/ds/Toast";
import type { StatusCandidatura, StatusConvite } from "@/data/types";
import { formatarData } from "@/lib/texto";
import {
  apagarConviteAcao,
  decidirCandidaturaAcao,
  excluirUsuarioAcao,
  promoverAcao,
  rebaixarAcao,
} from "@/server/anfitriao/acoes-admin";
import { SheetMotivo } from "../SheetMotivo";
import { FormConvite } from "./FormConvite";
import { SheetCriarUsuario } from "./SheetCriarUsuario";
import { SheetEditarUsuario } from "./SheetEditarUsuario";
import { SheetSenhaUsuario } from "./SheetSenhaUsuario";

export type Aba = "usuarios" | "candidaturas" | "convites";

export interface UsuarioVisual {
  id: string;
  pseudonimo: string;
  email: string;
  papel: "membro" | "anfitriao" | "administrador";
  membroDesde: string;
  emailVerificadoEm: string | null;
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

const POR_PAGINA = 10;

export interface FiltrosUsuarios {
  busca: string;
  perfil: string;
  situacao: string;
  pagina: number;
}

/** Busca, filtros, página e aba ficam no endereço: recarregar ou voltar mantém a mesma lista. */
function enderecoDosFiltros(aba: Aba, f: FiltrosUsuarios) {
  const q = new URLSearchParams();
  if (aba !== "usuarios") q.set("aba", aba);
  if (f.busca.trim()) q.set("busca", f.busca.trim());
  if (f.perfil) q.set("perfil", f.perfil);
  if (f.situacao) q.set("situacao", f.situacao);
  if (f.pagina > 1) q.set("pagina", String(f.pagina));
  const texto = q.toString();
  return `/admin/usuarios${texto ? `?${texto}` : ""}`;
}

const PAPEL: Record<UsuarioVisual["papel"], string> = {
  membro: "Buscador",
  anfitriao: "Anfitrião",
  administrador: "Curadoria",
};

const data = (iso: string) => formatarData(iso.slice(0, 10));

function SituacaoConvite({ s }: { s: StatusConvite }) {
  if (s === "pendente")
    return (
      <span className="sdb-badge sdb-badge--review">
        <Icon name="editar" size="sm" />
        Pendente
      </span>
    );
  if (s === "usado")
    return (
      <span className="sdb-badge sdb-badge--published">
        <Icon name="check" size="sm" />
        Usado
      </span>
    );
  return (
    <span className="sdb-badge sdb-badge--archived">
      <Icon name={s === "expirado" ? "relogio" : "cadeado"} size="sm" />
      {s === "expirado" ? "Expirado" : "Revogado"}
    </span>
  );
}

function SituacaoCandidatura({ s }: { s: StatusCandidatura }) {
  if (s === "pendente")
    return (
      <span className="sdb-badge sdb-badge--review">
        <Icon name="editar" size="sm" />
        Pendente
      </span>
    );
  if (s === "aprovada")
    return (
      <span className="sdb-badge sdb-badge--published">
        <Icon name="check" size="sm" />
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
  | { tipo: "excluir"; usuario: UsuarioVisual }
  | { tipo: "editar"; usuario: UsuarioVisual }
  | { tipo: "senha"; usuario: UsuarioVisual }
  | { tipo: "aprovar"; candidatura: CandidaturaVisual }
  | { tipo: "recusar"; candidatura: CandidaturaVisual }
  | { tipo: "apagar"; convite: ConviteVisual };

/** Usuários, candidaturas e convites (§6 · /admin/usuarios). */
export function UsuariosAdmin({
  abaInicial,
  filtrosIniciais,
  usuarios,
  candidaturas,
  convites,
}: {
  abaInicial: Aba;
  filtrosIniciais: FiltrosUsuarios;
  usuarios: UsuarioVisual[];
  candidaturas: CandidaturaVisual[];
  convites: ConviteVisual[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const { busca, perfil: papelFiltro, situacao: situacaoFiltro } = filtros;
  const normalizar = (v: string) =>
    v
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const filtrados = usuarios.filter(
    (u) =>
      (!papelFiltro || u.papel === papelFiltro) &&
      (!situacaoFiltro || (u.emailVerificadoEm ? "ativo" : "pendente") === situacaoFiltro) &&
      normalizar(`${u.pseudonimo} ${u.nomePublico ?? ""} ${u.email}`).includes(normalizar(busca.trim())),
  );
  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const pagina = Math.min(Math.max(1, filtros.pagina), paginas);
  const visiveis = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  const [aba, setAba] = useState<Aba>(abaInicial);
  const atualizar = (parcial: Partial<FiltrosUsuarios>) => {
    const novos = { ...filtros, pagina: 1, ...parcial };
    setFiltros(novos);
    window.history.replaceState(null, "", enderecoDosFiltros(aba, novos));
  };
  const irParaPagina = (p: number) => {
    atualizar({ pagina: p });
    document.getElementById("usuarios-painel-usuarios")?.scrollIntoView({ block: "start" });
  };
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [criando, setCriando] = useState(false);
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

  return (
    <div className="flex flex-col gap-6">
      <Segmented<Aba>
        abas="usuarios"
        label="Seções de usuários"
        value={aba}
        onChange={(v) => {
          setAba(v);
          window.history.replaceState(null, "", enderecoDosFiltros(v, filtros));
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
        <div className="mb-6 flex justify-end">
          <Button variant="primary" size="sm" icon="mais" onClick={() => setCriando(true)}>
            Criar usuário
          </Button>
        </div>
        <div className="mb-8 grid gap-x-6 gap-y-5 nav:grid-cols-3">
          <CampoTexto
            label="Buscar por nome ou e-mail"
            type="search"
            placeholder="Ex.: Alex"
            autoComplete="off"
            value={busca}
            onChange={(e) => atualizar({ busca: e.target.value })}
          />
          <Select
            label="Cargo"
            value={papelFiltro}
            onChange={(e) => atualizar({ perfil: e.target.value })}
            opcoes={[
              { value: "", label: "Todos os cargos" },
              ...Object.entries(PAPEL).map(([value, label]) => ({ value, label })),
            ]}
          />
          <Select
            label="Situação do cadastro"
            value={situacaoFiltro}
            onChange={(e) => atualizar({ situacao: e.target.value })}
            opcoes={[
              { value: "", label: "Todas as situações" },
              { value: "ativo", label: "Ativo" },
              { value: "pendente", label: "Pendente de confirmação" },
            ]}
          />
        </div>
        <TabelaDados<UsuarioVisual>
          legenda={`Contas · ${filtrados.length} de ${usuarios.length}${paginas > 1 ? ` · página ${pagina} de ${paginas}` : ""}`}
          itens={visiveis}
          chave={(u) => u.id}
          rotuloItem={(u) => u.pseudonimo}
          vazio="Nenhuma conta corresponde aos filtros."
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
            {
              id: "situacao",
              cabecalho: "Situação",
              celula: (u) => (u.emailVerificadoEm ? "Ativo" : "Pendente de confirmação"),
            },
            { id: "desde", cabecalho: "Desde", className: "sdb-tabular", celula: (u) => data(u.membroDesde) },
            {
              id: "acoes",
              cabecalho: "Ações",
              cabecalhoOculto: true,
              className: "sdb-table__actions",
              celula: (u) => (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPedido({ tipo: "editar", usuario: u })}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPedido({ tipo: "senha", usuario: u })}
                  >
                    Redefinir senha
                  </Button>
                  {u.papel === "membro" ? (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPedido({ tipo: "promover", usuario: u })}
                      >
                        Promover a anfitrião
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setPedido({ tipo: "excluir", usuario: u })}
                      >
                        Remover usuário
                      </Button>
                    </>
                  ) : u.papel === "anfitriao" ? (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPedido({ tipo: "rebaixar", usuario: u })}
                      >
                        Tirar o papel
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setPedido({ tipo: "excluir", usuario: u })}
                      >
                        Remover usuário
                      </Button>
                    </>
                  ) : null}
                </>
              ),
            },
          ]}
        />
        <div className="mt-6 flex justify-center">
          <Paginacao pagina={pagina} total={paginas} onPagina={irParaPagina} rotulo="Páginas de usuários" />
        </div>
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
          <FormConvite />
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
                  c.situacao !== "usado" ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPedido({ tipo: "apagar", convite: c })}
                    >
                      Apagar
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
        open={pedido?.tipo === "apagar"}
        titulo="Apagar o convite?"
        icone="lixeira"
        destrutivo
        rotuloConfirmar="Apagar"
        carregando={ocupado}
        onCancelar={() => setPedido(null)}
        onConfirmar={() => pedido?.tipo === "apagar" && executar(() => apagarConviteAcao(pedido.convite.id))}
      >
        O convite para {pedido?.tipo === "apagar" ? pedido.convite.email : ""} sai da lista e, se ainda valia,
        o link deixa de funcionar. O registro fica no Histórico. Depois, dá para enviar um convite novo para o
        mesmo e-mail.
      </ModalConfirmacao>

      <SheetCriarUsuario aberto={criando} onFechar={() => setCriando(false)} />

      <SheetEditarUsuario
        usuario={pedido?.tipo === "editar" ? pedido.usuario : null}
        onFechar={() => setPedido(null)}
      />

      <SheetSenhaUsuario
        key={pedido?.tipo === "senha" ? pedido.usuario.id : "fechado"}
        usuario={pedido?.tipo === "senha" ? pedido.usuario : null}
        onFechar={() => setPedido(null)}
      />

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
        modo="rebaixar"
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

      <ModalConfirmacao
        open={pedido?.tipo === "excluir" && pedido.usuario.papel === "membro"}
        titulo="Remover o usuário?"
        icone="lixeira"
        destrutivo
        rotuloConfirmar="Remover"
        carregando={ocupado}
        onCancelar={() => setPedido(null)}
        onConfirmar={() =>
          pedido?.tipo === "excluir" &&
          executar(() => excluirUsuarioAcao(pedido.usuario.id, { tipo: "manter" }))
        }
      >
        A conta de {pedido?.tipo === "excluir" ? pedido.usuario.pseudonimo : ""} é apagada de vez, com o
        progresso de estudo e o perfil. A pessoa recebe um e-mail. Isso não pode ser desfeito.
      </ModalConfirmacao>

      <SheetRebaixar
        modo="excluir"
        usuario={pedido?.tipo === "excluir" && pedido.usuario.papel === "anfitriao" ? pedido.usuario : null}
        destinos={usuarios.filter(
          (u) => u.papel === "anfitriao" && u.id !== (pedido?.tipo === "excluir" ? pedido.usuario.id : ""),
        )}
        carregando={ocupado}
        onFechar={() => setPedido(null)}
        onConfirmar={(opcao) =>
          pedido?.tipo === "excluir" && executar(() => excluirUsuarioAcao(pedido.usuario.id, opcao))
        }
      />
    </div>
  );
}

type Opcao = "manter" | "despublicar" | "transferir";

/**
 * Tirar o papel de anfitrião (§9) ou excluir a conta de vez: nos dois casos a
 * curadoria escolhe antes o que acontece com as Salas.
 */
function SheetRebaixar({
  modo,
  usuario,
  destinos,
  carregando,
  onFechar,
  onConfirmar,
}: {
  modo: "rebaixar" | "excluir";
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
          {modo === "excluir" ? "Excluir usuário" : "Tirar o papel de anfitrião"}
        </h2>
        <Button variant="destructive" size="sm" loading={carregando} onClick={confirmar}>
          {modo === "excluir" ? "Excluir conta" : "Confirmar"}
        </Button>
      </div>
      <div className="sdb-sheet__body">
        <p className="sdb-body-sm m-0">
          {modo === "excluir" ? (
            <>
              A conta de {usuario?.nomePublico ?? usuario?.pseudonimo} é apagada para sempre; isso não pode
              ser desfeito. O que estava em revisão volta a rascunho antes de a conta sumir.
            </>
          ) : (
            <>
              {usuario?.nomePublico ?? usuario?.pseudonimo} volta a ser membro. O que estava em revisão volta
              a rascunho em qualquer opção.
            </>
          )}
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
