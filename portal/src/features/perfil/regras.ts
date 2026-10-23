/* Regras puras do Perfil do buscador. */

export const LIMITE_SOBRE = 500;

/** "Sobre a sua busca": texto livre e opcional, só a própria pessoa vê. */
export function validarSobre(bruto: string): { ok: true; texto: string } | { ok: false; erro: string } {
  const texto = String(bruto ?? "").trim();
  if (texto.length > LIMITE_SOBRE) {
    return { ok: false, erro: `Erro: o texto passa de ${LIMITE_SOBRE} caracteres. Encurte um pouco.` };
  }
  return { ok: true, texto };
}
