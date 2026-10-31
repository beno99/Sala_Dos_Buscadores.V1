"use client";

import type { Route } from "next";
import Link from "next/link";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { cx } from "@/lib/cx";
import { Avatar } from "./Avatar";
import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";
import { type ItemMenu, Menu } from "./Menu";

export interface ItemNavegacaoApp {
  rotulo: string;
  icone: IconName;
  href?: Route;
  /** Sem href vira botão (ex.: "Sair"). */
  onClick?: () => void;
  ativo?: boolean;
  contagem?: number;
  /** Etiqueta curta ("nova"). */
  etiqueta?: string;
  /** Ação de sair: texto em `danger`. */
  perigo?: boolean;
}

export interface GrupoNavegacaoApp {
  titulo: string;
  itens: ItemNavegacaoApp[];
}

export interface PerfilLateral {
  iniciais: string;
  pseudonimo: string;
  /** Papel em caixa alta sobre o nome ("Buscador", "Anfitrião", "Curadoria"). */
  papel: string;
  /** Foto que a própria pessoa enviou; sem ela, iniciais. */
  foto?: string;
  /** "Membro desde set 2026". */
  descricao: string;
  menu: ItemMenu[];
}

/** Guarda o estado recolhido no navegador (localStorage protegido por try/catch). */
export function useLateralRecolhida(chave: string): [boolean, () => void] {
  const [recolhida, setRecolhida] = useState(false);
  useEffect(() => {
    try {
      setRecolhida(localStorage.getItem(chave) === "recolhida");
    } catch {
      // Sem acesso ao armazenamento: fica aberta.
    }
  }, [chave]);
  const alternar = useCallback(() => {
    setRecolhida((atual) => {
      const nova = !atual;
      try {
        localStorage.setItem(chave, nova ? "recolhida" : "aberta");
      } catch {
        // Preferência só desta visita.
      }
      return nova;
    });
  }, [chave]);
  return [recolhida, alternar];
}

function dicaSe(recolhida: boolean, rotulo: string) {
  return recolhida ? { "data-tip": rotulo, "data-tip-side": "right" } : {};
}

/**
 * Navegação lateral do app (NavegacaoLateral › app): marca e botão de
 * recolher, cartão de perfil, "Continuar", itens em grupos e cartões no rodapé.
 */
export function NavegacaoLateralApp({
  id,
  grupos,
  perfil,
  continuar,
  rodape,
  recolhida,
  onAlternar,
}: {
  id: string;
  grupos: GrupoNavegacaoApp[];
  perfil: PerfilLateral;
  /** Mini card "Continuar de onde parou" (Fase C). */
  continuar?: ReactNode;
  /** Cartões do rodapé (Fase C). */
  rodape?: ReactNode;
  recolhida: boolean;
  onAlternar: () => void;
}) {
  return (
    <nav
      id={id}
      className={cx("sdb-sidenav sdb-sidenav--app", recolhida && "is-collapsed")}
      aria-label="Navegação principal"
    >
      <div className="sdb-sidenav__brand">
        {/* biome-ignore lint/performance/noImgElement: logo fixa, sem necessidade de otimização do next/image */}
        <img src="/imagens/logo_sala.png" alt="" className="sdb-sidenav__logo" aria-hidden="true" />
        <Link href="/" className="sdb-sidenav__name">
          A Sala dos Buscadores
        </Link>
        <Button
          variant="secondary"
          size="sm"
          iconOnly
          icon="menuLateral"
          aria-label={recolhida ? "Expandir navegação" : "Recolher navegação"}
          aria-expanded={!recolhida}
          aria-controls={id}
          tip={recolhida ? "Expandir" : "Recolher"}
          tipSide="bottom"
          onClick={onAlternar}
        />
      </div>

      <Menu
        triggerClassName="sdb-sidenav__profile sdb-sidenav__profile--foto"
        triggerLabel={`Conta de ${perfil.pseudonimo}`}
        titulo={`Conectado como ${perfil.pseudonimo}`}
        items={perfil.menu}
        trigger={
          <>
            <Avatar iniciais={perfil.iniciais} foto={perfil.foto} tone="soft" />
            <span className="sdb-sidenav__who">
              <b>{perfil.papel}</b>
              <span>{perfil.pseudonimo}</span>
            </span>
            <Icon name="chevronBaixo" size="sm" />
          </>
        }
      />

      {continuar}

      {grupos.map((g) => (
        <div key={g.titulo} className="contents">
          <p className="sdb-sidenav__group">{g.titulo}</p>
          {g.itens.map((i) => {
            const conteudo = (
              <>
                <Icon name={i.icone} />
                <span className="sdb-sidenav__label">{i.rotulo}</span>
                {i.etiqueta && (
                  <span className={cx("sdb-sidenav__tag", i.etiqueta === "nova" && "sdb-sidenav__tag--nova")}>
                    {i.etiqueta}
                  </span>
                )}
                {i.contagem !== undefined && <span className="sdb-sidenav__count">{i.contagem}</span>}
              </>
            );
            return i.href ? (
              <Link
                key={i.rotulo}
                href={i.href}
                className="sdb-sidenav__item"
                aria-current={i.ativo ? "page" : undefined}
                {...dicaSe(recolhida, i.rotulo)}
              >
                {conteudo}
              </Link>
            ) : (
              <button
                key={i.rotulo}
                type="button"
                className={cx("sdb-sidenav__item", i.perigo && "sdb-sidenav__item--sair")}
                onClick={i.onClick}
                {...dicaSe(recolhida, i.rotulo)}
              >
                {conteudo}
              </button>
            );
          })}
        </div>
      ))}

      {rodape && <div className="sdb-sidenav__foot">{rodape}</div>}
    </nav>
  );
}

/** A mesma lista, sem cabeçalho nem rodapé, para o Drawer "Mais" do celular (`--sheet`). */
export function ListaNavegacaoSheet({
  grupos,
  onNavegar,
}: {
  grupos: GrupoNavegacaoApp[];
  onNavegar: () => void;
}) {
  return (
    <nav className="sdb-sidenav sdb-sidenav--sheet" aria-label="Mais seções">
      {grupos.map((g) => (
        <div key={g.titulo} className="contents">
          <p className="sdb-sidenav__group">{g.titulo}</p>
          {g.itens.map((i) =>
            i.href ? (
              <Link
                key={i.rotulo}
                href={i.href}
                className="sdb-sidenav__item"
                aria-current={i.ativo ? "page" : undefined}
                onClick={onNavegar}
              >
                <Icon name={i.icone} />
                <span className="sdb-sidenav__label">{i.rotulo}</span>
                {i.contagem !== undefined && <span className="sdb-sidenav__count">{i.contagem}</span>}
              </Link>
            ) : (
              <button
                key={i.rotulo}
                type="button"
                className={cx("sdb-sidenav__item", i.perigo && "sdb-sidenav__item--sair")}
                onClick={() => {
                  onNavegar();
                  i.onClick?.();
                }}
              >
                <Icon name={i.icone} />
                <span className="sdb-sidenav__label">{i.rotulo}</span>
              </button>
            ),
          )}
        </div>
      ))}
    </nav>
  );
}
