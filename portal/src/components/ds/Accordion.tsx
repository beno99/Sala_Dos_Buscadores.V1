"use client";

import {
  type CSSProperties,
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useEffect,
  useId,
  useState,
} from "react";
import { cx } from "@/lib/cx";
import { Icon } from "./Icon";

const GrupoUnico = createContext<{
  aberto: string | null | undefined;
  abrir: Dispatch<SetStateAction<string | null | undefined>>;
} | null>(null);

/** Lista agrupada (inset grouped). Com `single`, só um item fica aberto por vez. */
export function Accordion({
  single,
  className,
  children,
}: {
  single?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const [aberto, abrir] = useState<string | null | undefined>(undefined);
  const lista = <div className={cx("sdb-list", className)}>{children}</div>;
  return single ? <GrupoUnico.Provider value={{ aberto, abrir }}>{lista}</GrupoUnico.Provider> : lista;
}

interface AccordionItemProps {
  title: ReactNode;
  defaultOpen?: boolean;
  disabled?: boolean;
  /** Classe do contêiner do item (ex.: `sdb-gloss__item` no glossário). */
  className?: string;
  bodyClassName?: string;
  /** Ajustes em linha iguais aos dos exemplos da biblioteca (ex.: chips no Filtro de tema). */
  bodyStyle?: CSSProperties;
  children: ReactNode;
  /** Chamado com o novo estado quando a pessoa abre ou fecha o item. */
  onToggle?: (aberto: boolean) => void;
}

export function AccordionItem({
  title,
  defaultOpen,
  disabled,
  className,
  bodyClassName,
  bodyStyle,
  children,
  onToggle,
}: AccordionItemProps) {
  const id = useId();
  const grupo = useContext(GrupoUnico);
  const [local, setLocal] = useState(Boolean(defaultOpen));
  const aberto = grupo ? (grupo.aberto === undefined ? Boolean(defaultOpen) : grupo.aberto === id) : local;
  const abrirGrupo = grupo?.abrir;
  useEffect(() => {
    if (defaultOpen) abrirGrupo?.((atual) => (atual === undefined ? id : atual));
  }, [defaultOpen, abrirGrupo, id]);

  const alternar = () => {
    onToggle?.(!aberto);
    if (grupo) {
      grupo.abrir(aberto ? null : id);
    } else setLocal(!local);
  };

  return (
    <div className={className}>
      <button
        type="button"
        className="sdb-acc-trigger"
        aria-expanded={aberto}
        aria-controls={`${id}-painel`}
        id={`${id}-gatilho`}
        disabled={disabled}
        onClick={alternar}
      >
        {typeof title === "string" ? <span>{title}</span> : title}
        <Icon name="chevronDireita" className="sdb-chev" />
      </button>
      <div
        id={`${id}-painel`}
        className={cx("sdb-acc-panel", aberto && "is-open")}
        role="region"
        aria-labelledby={`${id}-gatilho`}
        inert={!aberto}
      >
        <div>
          <div className={cx("sdb-acc-body", bodyClassName)} style={bodyStyle}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
