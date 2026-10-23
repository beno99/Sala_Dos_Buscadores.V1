"use client";

import { useEffect, useState } from "react";
import { cx } from "@/lib/cx";
import { classesDoBotao } from "./Button";
import { Icon } from "./Icon";
import { useToast } from "./Toast";

/**
 * Botão de compartilhar (Botão › [data-share]): "Copiar link" copia o endereço
 * e confirma com o toast; onde houver menu do sistema (navigator.share), vira
 * "Compartilhar" e abre o menu com o título e o link. Cancelar não mostra
 * nada. Se a área de transferência for recusada, o toast mostra o link para
 * selecionar. Nunca ícones de marca.
 */
export function BotaoCompartilhar({ titulo, url }: { titulo: string; url?: string }) {
  const toast = useToast();
  const [nativo, setNativo] = useState(false);
  useEffect(() => setNativo(typeof navigator.share === "function"), []);

  const endereco = () => url ?? window.location.href;
  const copiar = async () => {
    const link = endereco();
    try {
      await navigator.clipboard.writeText(link);
      toast("Link copiado.");
    } catch {
      toast("Selecione o link e copie.", { title: "Não foi possível copiar", select: link, duration: 9000 });
    }
  };
  const compartilhar = async () => {
    if (!nativo) return copiar();
    try {
      await navigator.share({ title: titulo, url: endereco() });
    } catch (e) {
      if ((e as { name?: string } | null)?.name !== "AbortError") await copiar();
    }
  };

  return (
    <button
      type="button"
      className={cx(classesDoBotao({ variant: "secondary", size: "sm" }), "sdb-share", nativo && "is-native")}
      onClick={() => void compartilhar()}
    >
      {nativo ? (
        <span className="sdb-share__native">
          <Icon name="compartilhar" size="sm" />
          Compartilhar
        </span>
      ) : (
        <span className="sdb-share__copy">
          <Icon name="copiar" size="sm" />
          Copiar link
        </span>
      )}
    </button>
  );
}
