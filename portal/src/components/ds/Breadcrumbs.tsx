import type { Route } from "next";
import Link from "next/link";
import { truncar } from "@/lib/texto";

/** Caminho até a página atual, numa cápsula de vidro. O último item trunca em 34 caracteres. */
export function Breadcrumbs({ itens, atual }: { itens: { href: Route; rotulo: string }[]; atual: string }) {
  const curto = truncar(atual, 34);
  return (
    <nav className="sdb-crumbs" aria-label="Você está em">
      <ol>
        {itens.map((i) => (
          <li key={i.href}>
            <Link href={i.href}>{i.rotulo}</Link>
          </li>
        ))}
        <li>
          <span aria-current="page" title={curto !== atual ? atual : undefined}>
            {curto}
          </span>
        </li>
      </ol>
    </nav>
  );
}
