import { inicialDoTitulo } from "@/lib/texto";
import { Icon } from "./Icon";

/** Fallback editorial; não substitui uma imagem disponível. */
export function InicialCapa({ titulo }: { titulo: string }) {
  return (
    <span className="sdb-display-l" aria-hidden="true">
      {inicialDoTitulo(titulo) || <Icon name="biblioteca" />}
    </span>
  );
}
