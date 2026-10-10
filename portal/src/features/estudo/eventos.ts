import type { EventoEstudo } from "./tipos";

/*
 * Canal entre as telas e a Moldura, que grava o evento e avisa as conquistas
 * novas. Os efeitos de um componente filho rodam antes dos do pai: um evento
 * emitido antes de a Moldura ouvir fica na fila e é entregue quando ela começa.
 */
type Ouvinte = (evento: EventoEstudo) => void;

let ouvinte: Ouvinte | null = null;
const fila: EventoEstudo[] = [];

export function emitirEstudo(evento: EventoEstudo) {
  if (ouvinte) ouvinte(evento);
  else fila.push(evento);
}

export function ouvirEstudo(fn: Ouvinte): () => void {
  ouvinte = fn;
  for (const evento of fila.splice(0)) fn(evento);
  return () => {
    if (ouvinte === fn) ouvinte = null;
  };
}
