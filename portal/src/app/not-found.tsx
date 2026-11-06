import type { Route } from "next";
import Link from "next/link";
import { IconeVolume } from "@/components/ds/EstadosInterface";
import { InterfaceIcon } from "@/components/ds/InterfaceIcon";

export default function NaoEncontrado() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <section className="sdb-ui-empty w-full max-w-[560px]" aria-labelledby="nao-encontrado-titulo">
        <IconeVolume simbolo="busca" />
        <h1 id="nao-encontrado-titulo" className="sdb-title-2 mt-6">
          Esta página não foi encontrada
        </h1>
        <p>
          O endereço pode estar incompleto ou o conteúdo mudou de lugar. Volte às Salas ou busque um tema no
          acervo.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link className="sdb-ui-primary" href={"/" as Route}>
            Ver as Salas
            <InterfaceIcon name="seta" />
          </Link>
          <Link className="sdb-ui-secondary" href={"/comparar" as Route}>
            Buscar por tema
          </Link>
        </div>
      </section>
    </main>
  );
}
