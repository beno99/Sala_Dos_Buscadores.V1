/* Regras dos formulários de conta. Mensagens sem o prefixo "Erro:", que o campo acrescenta. */

export const SENHA_MINIMA = 10;

export function validarEmail(email: string): string | null {
  const v = email.trim();
  if (!v) return "escreva seu e-mail. Ex.: nome@exemplo.com";
  if (!v.includes("@")) return "falta o @. Ex.: nome@exemplo.com";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "falta o domínio depois do @. Ex.: nome@exemplo.com";
  return null;
}

export function validarSenha(senha: string): string | null {
  if (!senha) return "escreva sua senha.";
  if (senha.length < SENHA_MINIMA) return `a senha precisa ter ao menos ${SENHA_MINIMA} caracteres.`;
  return null;
}

/** Pseudônimo é a identidade pública (RF-04): não pedimos nome civil. */
export function validarPseudonimo(pseudonimo: string): string | null {
  const v = pseudonimo.trim();
  if (v.length < 2) return "escolha um pseudônimo com ao menos 2 caracteres.";
  if (v.length > 40) return "use no máximo 40 caracteres.";
  if (v.includes("@")) return "o pseudônimo não pode ser um e-mail, porque fica visível para outras pessoas.";
  return null;
}

/** Aceita só caminhos internos, para o "voltar" não levar a outro site. */
export function destinoSeguro(voltar: string | null | undefined): string {
  return voltar?.startsWith("/") && !voltar.startsWith("//") ? voltar : "/";
}
