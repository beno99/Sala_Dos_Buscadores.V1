import type { Formato, Nivel, Proveniencia, TipoConteudo } from "./types";

export const NIVEL_ROTULO: Record<Nivel, string> = {
  1: "Iniciante",
  2: "Intermediário",
  3: "Avançado",
};

export const NIVEL_AJUDA: Record<Nivel, string> = {
  1: "Contexto e vocabulário",
  2: "Leitura comentada",
  3: "Crítica textual e línguas originais",
};

export const PROVENIENCIA_ROTULO: Record<Proveniencia, string> = {
  primaria: "Fonte primária",
  curado: "Editorial curado",
  especialista: "Especialista",
  comunidade: "Comunidade",
  ia: "Síntese por IA",
  anfitriao: "Anfitrião",
};

export const PROVENIENCIA_AJUDA: Record<Proveniencia, string> = {
  primaria: "Texto antigo transcrito ou traduzido, sem comentário.",
  curado: "Escrito e revisado pela equipe da Sala.",
  especialista: "Assinado por pesquisador com credencial verificada.",
  comunidade: "Enviado por leitor e revisado antes de publicar.",
  ia: "Produzido pelo assistente a partir do acervo, sempre com fontes.",
  anfitriao: "Escrito por um anfitrião na própria Sala e aprovado pela curadoria antes de ir ao ar.",
};

export const TIPO_ROTULO: Record<TipoConteudo, string> = {
  artigo: "Artigo",
  "fonte-primaria": "Fonte primária",
  verbete: "Glossário",
  video: "Vídeo",
};

export const FORMATO_ROTULO: Record<Formato, string> = {
  texto: "Texto",
  video: "Vídeo",
};
