"use client";

import {
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cx } from "@/lib/cx";

interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "min" | "max" | "value" | "defaultValue"> {
  label: ReactNode;
  ref?: Ref<HTMLInputElement>;
  min?: number;
  max?: number;
  value?: number;
  defaultValue?: number;
  /** Unidade ou frase do valor atual, como "até {v} d.C.". */
  format?: string;
  minLabel?: ReactNode;
  maxLabel?: ReactNode;
}

/** Intervalo contínuo (Slider), com valor atual e extremidades sempre visíveis. */
export function Slider({
  label,
  min = 0,
  max = 100,
  step,
  value,
  defaultValue,
  format = "{v}",
  minLabel,
  maxLabel,
  id,
  className,
  onChange,
  style,
  ref,
  ...rest
}: SliderProps) {
  const gerado = useId();
  const campo = id ?? gerado;
  const entrada = useRef<HTMLInputElement | null>(null);
  const inicial = defaultValue ?? (min + max) / 2;
  const [local, setLocal] = useState(value ?? inicial);
  const atual = local;
  const texto = format.replace("{v}", String(atual));
  const preenchimento = max > min ? ((atual - min) / (max - min)) * 100 : 0;

  // min/max/step podem sanitizar o valor: o DOM é a referência para a leitura.
  // biome-ignore lint/correctness/useExhaustiveDependencies: props nativas alteram a sanitização mesmo quando o valor não muda.
  useLayoutEffect(() => {
    const input = entrada.current;
    if (!input) return;
    // Reaplicar pelo setter nativo também sanitiza alterações de min/max.
    // biome-ignore lint/correctness/noSelfAssign: o setter de range tem efeitos de sanitização.
    input.value = input.value;
    setLocal(input.valueAsNumber);
  }, [value, min, max, step]);

  useEffect(() => {
    const formulario = entrada.current?.form;
    const reset = (event: Event) => {
      queueMicrotask(() => {
        if (!event.defaultPrevented && value === undefined && entrada.current)
          setLocal(entrada.current.valueAsNumber);
      });
    };
    formulario?.addEventListener("reset", reset);
    return () => formulario?.removeEventListener("reset", reset);
  }, [value]);

  return (
    <div className={cx("sdb-field", className)}>
      <label className="sdb-label" htmlFor={campo}>
        <span id={`${campo}-rotulo`}>{label}</span>
        <small>
          <output htmlFor={campo} id={`${campo}-valor`}>
            {texto}
          </output>
        </small>
      </label>
      <input
        {...rest}
        ref={(el) => {
          entrada.current = el;
          if (typeof ref === "function") return ref(el);
          if (ref) ref.current = el;
        }}
        id={campo}
        className="sdb-slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        defaultValue={value === undefined ? inicial : undefined}
        aria-valuetext={texto}
        aria-labelledby={rest["aria-labelledby"] ?? `${campo}-rotulo`}
        style={{ ...style, "--val": `${preenchimento}%` } as CSSProperties}
        onChange={(e) => {
          if (value === undefined) setLocal(e.target.valueAsNumber);
          onChange?.(e);
        }}
      />
      <div className="sdb-slider-scale">
        <span>{minLabel ?? min}</span>
        <span>{maxLabel ?? max}</span>
      </div>
    </div>
  );
}
