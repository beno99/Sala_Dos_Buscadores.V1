"use client";

import {
  type ReactNode,
  type Ref,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cx } from "@/lib/cx";
import { Icon } from "./Icon";

function MensagemErro({ id, erro }: { id: string; erro?: string }) {
  if (!erro) return null;
  return (
    <p id={id} className="sdb-error-msg">
      <Icon name="erro" />
      <span>
        <b>Erro:</b> {erro}
      </span>
    </p>
  );
}

interface AreaTextoProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  ref?: Ref<HTMLTextAreaElement>;
  id?: string;
  label: ReactNode;
  help?: ReactNode;
  error?: string;
  /** Mostra o contador "n / limite" a partir do maxLength. */
  contador?: boolean;
}

/** Área de texto (AreaTexto): várias linhas, texto em serifa de leitura, contador opcional. */
export function AreaTexto({
  id,
  label,
  help,
  error,
  contador,
  maxLength,
  value,
  defaultValue,
  onChange,
  disabled,
  ref,
  "aria-describedby": describedBy,
  className,
  ...rest
}: AreaTextoProps) {
  const gerado = useId();
  const campo = id ?? gerado;
  const area = useRef<HTMLTextAreaElement | null>(null);
  const [tamanhoLocal, setTamanhoLocal] = useState(String(defaultValue ?? "").length);
  useEffect(() => {
    const formulario = area.current?.form;
    const reset = () => setTamanhoLocal(String(area.current?.defaultValue ?? "").length);
    formulario?.addEventListener("reset", reset);
    return () => formulario?.removeEventListener("reset", reset);
  }, []);
  const descritores = [
    describedBy,
    help && `${campo}-ajuda`,
    error && `${campo}-erro`,
    contador && `${campo}-contador`,
  ]
    .filter(Boolean)
    .join(" ");
  const tamanho = value !== undefined ? String(value).length : tamanhoLocal;
  return (
    <div className={cx("sdb-field", className)}>
      <label className="sdb-label" htmlFor={campo}>
        {label}
      </label>
      <div className={cx("sdb-control sdb-control--area", error && "is-error", disabled && "is-disabled")}>
        <textarea
          ref={(el) => {
            area.current = el;
            if (typeof ref === "function") return ref(el);
            if (ref) ref.current = el;
          }}
          id={campo}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          onChange={(e) => {
            setTamanhoLocal(e.target.value.length);
            onChange?.(e);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={descritores || undefined}
          {...rest}
        />
      </div>
      {contador && (
        <span id={`${campo}-contador`} className="sdb-counter">
          {tamanho.toLocaleString("pt-BR")} /{" "}
          {maxLength !== undefined && maxLength >= 0 ? maxLength.toLocaleString("pt-BR") : "∞"}
        </span>
      )}
      {help && (
        <p id={`${campo}-ajuda`} className="sdb-help">
          {help}
        </p>
      )}
      <MensagemErro id={`${campo}-erro`} erro={error} />
    </div>
  );
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  id?: string;
  label: ReactNode;
  help?: ReactNode;
  error?: string;
  opcoes: { value: string; label: string; disabled?: boolean }[];
}

/** Select nativo da biblioteca, com o ícone chevronDuplo. */
export function Select({
  id,
  label,
  help,
  error,
  opcoes,
  className,
  disabled,
  "aria-describedby": describedBy,
  ...rest
}: SelectProps) {
  const gerado = useId();
  const campo = id ?? gerado;
  const descritores = [describedBy, help && `${campo}-ajuda`, error && `${campo}-erro`]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cx("sdb-field", className)}>
      <label className="sdb-label" htmlFor={campo}>
        {label}
      </label>
      <div className={cx("sdb-control", error && "is-error", disabled && "is-disabled")}>
        <select
          disabled={disabled}
          id={campo}
          aria-invalid={error ? true : undefined}
          aria-describedby={descritores || undefined}
          {...rest}
        >
          {opcoes.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <Icon name="chevronDuplo" size="sm" />
      </div>
      {help && (
        <p id={`${campo}-ajuda`} className="sdb-help">
          {help}
        </p>
      )}
      <MensagemErro id={`${campo}-erro`} erro={error} />
    </div>
  );
}

interface RadioGrupoProps<T extends string> {
  id?: string;
  legenda: ReactNode;
  nome: string;
  valor: T | null;
  onChange: (v: T) => void;
  opcoes: { value: T; label: ReactNode; help?: ReactNode; disabled?: boolean }[];
  help?: ReactNode;
  error?: string;
}

/** Escolha única visível (Radio) em fieldset com legenda. */
export function RadioGrupo<T extends string>({
  id,
  legenda,
  nome,
  valor,
  onChange,
  opcoes,
  help,
  error,
}: RadioGrupoProps<T>) {
  const gerado = useId();
  const campo = id ?? gerado;
  const descritores = [help && `${campo}-ajuda`, error && `${campo}-erro`].filter(Boolean).join(" ");
  return (
    <fieldset id={campo} className="sdb-fieldset" aria-describedby={descritores || undefined} tabIndex={-1}>
      <legend className="sdb-caption">{legenda}</legend>
      {help && (
        <p id={`${campo}-ajuda`} className="sdb-help">
          {help}
        </p>
      )}
      {opcoes.map((o) => (
        <label key={o.value} className="sdb-check">
          <input
            type="radio"
            name={nome}
            value={o.value}
            checked={valor === o.value}
            disabled={o.disabled}
            aria-invalid={error ? true : undefined}
            onChange={() => onChange(o.value)}
          />{" "}
          <span>
            {o.label}
            {o.help && <small>{o.help}</small>}
          </span>
        </label>
      ))}
      <MensagemErro id={`${campo}-erro`} erro={error} />
    </fieldset>
  );
}
