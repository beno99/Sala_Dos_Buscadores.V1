/*
 * Semente do banco: o acervo oficial (Salas, fontes, conteúdos, citações e
 * vídeos de src/data/semente) e a conta de administrador. Idempotente: o
 * acervo só entra num banco sem Salas; a conta, se o e-mail ainda não existe.
 * Rodada por scripts/seed.ts (npm run db:seed).
 */
import bcrypt from "bcryptjs";
import { CITACOES } from "@/data/semente/citacoes";
import { CONTEUDOS } from "@/data/semente/conteudos";
import { FONTES } from "@/data/semente/fontes";
import { SALAS } from "@/data/semente/salas";
import { VIDEOS } from "@/data/semente/videos";
import type { Gravacao } from "@/modules/acervo/acervo.contratos";
import { acervoRepositorio } from "@/modules/acervo/acervo.repositorio";
import { CUSTO_BCRYPT, novoIdConta } from "@/modules/conta/casos-de-uso/registrar";
import { contaRepositorio } from "@/modules/conta/conta.repositorio";

const AUTOR = "Importação do acervo oficial";

type Relato = (linha: string) => void;

async function criarAdmin({ email, senha }: { email: string; senha: string }, relatar: Relato) {
  if (await contaRepositorio.porEmail(email)) return relatar(`Administrador ${email} já existe.`);
  await contaRepositorio.criar({
    id: novoIdConta(),
    pseudonimo: "Editoria do acervo",
    email,
    senhaHash: await bcrypt.hash(senha, CUSTO_BCRYPT),
    papel: "administrador",
  });
  relatar(`Administrador ${email} criado.`);
}

function gravacoesDoAcervo(): Gravacao[] {
  const g: Gravacao[] = [];
  const dia = (d: string) => `${d}T09:00:00.000Z`;
  for (const s of SALAS) {
    g.push({
      tipo: "gravar",
      colecao: "salas",
      id: s.slug,
      valor: {
        ...s,
        id: s.slug,
        status: "publicado",
        publicadaEm: s.atualizadaEm,
        criadoEm: dia(s.atualizadaEm),
        atualizadoEm: dia(s.atualizadaEm),
        criadoPor: AUTOR,
        atualizadoPor: AUTOR,
      },
    });
  }
  for (const f of FONTES) {
    const quando = "2026-06-01T09:00:00.000Z";
    g.push({
      tipo: "gravar",
      colecao: "fontes",
      id: f.id,
      valor: { ...f, criadoEm: quando, atualizadoEm: quando, criadoPor: AUTOR, atualizadoPor: AUTOR },
    });
  }
  for (const c of CONTEUDOS) {
    const id = `c-${c.slug}`;
    const { divergencia, ...resto } = c;
    g.push({
      tipo: "gravar",
      colecao: "conteudos",
      id,
      valor: {
        ...resto,
        id,
        status: "publicado",
        criadoEm: dia(c.publicadoEm),
        atualizadoEm: dia(c.publicadoEm),
        criadoPor: AUTOR,
        atualizadoPor: AUTOR,
        // Textos do acervo: trechos curtos com referência; o Caibalion (1908) é domínio público.
        situacaoJuridica:
          c.proveniencia === "primaria" && c.sala === "caibalion"
            ? { tipo: "dominio-publico" }
            : { tipo: "trecho-permitido" },
        temaDivergente: Boolean(divergencia),
        notaDivergencia: divergencia ?? "",
        producaoIA: c.proveniencia === "ia",
      },
    });
  }
  for (const c of CITACOES) g.push({ tipo: "gravar", colecao: "citacoes", id: c.id, valor: c });
  for (const v of VIDEOS) {
    const { conteudos, ...resto } = v;
    g.push({
      tipo: "gravar",
      colecao: "videos",
      id: v.id,
      valor: {
        ...resto,
        status: "publicado",
        criadoEm: dia(v.publicadoEm),
        atualizadoEm: dia(v.publicadoEm),
        criadoPor: AUTOR,
        atualizadoPor: AUTOR,
        // As URLs do acervo inicial são buscas provisórias no YouTube, sem ID de vídeo.
        youtubeId: "",
        artigos: (conteudos ?? []).map((slug) => `c-${slug}`),
      },
    });
  }
  return g;
}

async function popularAcervo(relatar: Relato) {
  const atual = await acervoRepositorio.carregar();
  if (atual.colecoes.salas.size > 0) return relatar("O acervo já tem Salas; nada a importar.");
  const gravacoes = gravacoesDoAcervo();
  for (const g of gravacoes) await acervoRepositorio.aplicar(g);
  relatar(`Acervo importado: ${gravacoes.length} registros.`);
}

/** Conta de administrador e acervo oficial, sem duplicar o que já existe. */
export async function semear(admin: { email: string; senha: string }, relatar: Relato = () => {}) {
  await criarAdmin(admin, relatar);
  await popularAcervo(relatar);
}
