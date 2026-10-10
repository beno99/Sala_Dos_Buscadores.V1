"use client";

import { type InputHTMLAttributes, type ReactNode, type Ref, useId, useRef, useState } from "react";
import { cx } from "@/lib/cx";
import { Icon } from "./Icon";

interface CampoTextoProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  ref?: Ref<HTMLInputElement>;
  label: ReactNode;
  help?: ReactNode;
  /** Mensagem de erro sem o prefixo; o componente escreve "Erro:". */
  error?: string;
  id?: string;
}

/** Campo de texto com rótulo sempre visível (CampoTexto). Senha ganha o botão de mostrar. */
export function CampoTexto({
  label,
  help,
  error,
  id,
  type = "text",
  disabled,
  className,
  ref,
  "aria-describedby": describedBy,
  ...rest
}: CampoTextoProps) {
  const gerado = useId();
  const campo = id ?? gerado;
  const [visivel, setVisivel] = useState(false);
  const entrada = useRef<HTMLInputElement | null>(null);
  const senha = type === "password";
  const busca = type === "search";
  const descritores =
    [describedBy, help && `${campo}-ajuda`, error && `${campo}-erro`].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cx("sdb-field", className)}>
      <label className="sdb-label" htmlFor={campo}>
        {label}
      </label>
      <div
        className={cx(
          "sdb-control",
          busca && "sdb-control--search",
          error && "is-error",
          disabled && "is-disabled",
        )}
      >
        {busca && <Icon name="busca" />}
        <input
          ref={(el) => {
            entrada.current = el;
            if (typeof ref === "function") return ref(el);
            if (ref) ref.current = el;
          }}
          id={campo}
          type={senha && visivel ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={descritores}
          disabled={disabled}
          {...rest}
        />
        {senha && (
          <button
            type="button"
            className="sdb-control__btn"
            aria-pressed={visivel}
            aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
            disabled={disabled}
            onClick={() => setVisivel(!visivel)}
          >
            <Icon name={visivel ? "olhoFechado" : "olho"} />
          </button>
        )}
        {busca && (
          <button
            type="button"
            className="sdb-control__btn"
            aria-label="Limpar busca"
            disabled={disabled || rest.readOnly}
            onClick={() => {
              const input = entrada.current;
              if (!input) return;
              // O setter nativo dispara o onChange do React também em campos controlados.
              Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, "");
              input.dispatchEvent(new Event("input", { bubbles: true }));
              input.focus();
            }}
          >
            <Icon name="fechar" size="sm" />
          </button>
        )}
      </div>
      {help && (
        <p id={`${campo}-ajuda`} className="sdb-help">
          {help}
        </p>
      )}
      {error && (
        <p id={`${campo}-erro`} className="sdb-error-msg">
          <Icon name="erro" />
          <span>
            <b>Erro:</b> {error}
          </span>
        </p>
      )}
    </div>
  );
}

/** Checkbox da biblioteca: marca entra com mola; ajuda em <small>. */
export function Checkbox({
  label,
  help,
  error,
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
  help?: ReactNode;
  error?: boolean;
}) {
  return (
    <label className="sdb-check">
      <input
        type="checkbox"
        className={error ? "is-error" : undefined}
        aria-invalid={error || undefined}
        {...rest}
      />{" "}
      <span>
        {label}
        {help && <small>{help}</small>}
      </span>
    </label>
  );
}
