import type { Metadata } from "next";
import { type Aba, UsuariosAdmin } from "@/features/admin/ui/anfitrioes/UsuariosAdmin";
import { listarCandidaturas, listarConvites } from "@/server/anfitriao/consultas";
import { acervo, contasDoDiretorio as listarContas } from "@/server/store";

export const metadata: Metadata = { title: "Usuários" };

const ABAS: Aba[] = ["usuarios", "candidaturas", "convites"];

/** Usuários, candidaturas e convites. Sem ranking nem pontuação de pessoas (RNF-DOM-05). */
export default async function Usuarios(props: PageProps<"/admin/usuarios">) {
  const { aba } = await props.searchParams;
  const salasPorDono = new Map<string, number>();
  for (const s of acervo().salas.values()) {
    if (s.revisao) salasPorDono.set(s.revisao.donoId, (salasPorDono.get(s.revisao.donoId) ?? 0) + 1);
  }
  const usuarios = listarContas()
    .sort((a, b) => a.pseudonimo.localeCompare(b.pseudonimo, "pt-BR"))
    .map((c) => ({
      id: c.id,
      pseudonimo: c.pseudonimo,
      email: c.email,
      papel: c.papel,
      membroDesde: c.membroDesde,
      nomePublico: acervo().perfis.get(c.id)?.nome,
      salas: salasPorDono.get(c.id) ?? 0,
    }));
  return (
    <>
      <header className="flex flex-col gap-3">
        <p className="sdb-meta sdb-secondary">Curadoria</p>
        <h1 className="sdb-title-1">Usuários</h1>
        <p className="sdb-body-sm sdb-secondary max-w-read">
          Papéis, candidaturas e convites de anfitrião. O papel de administrador não muda por aqui.
        </p>
      </header>
      <UsuariosAdmin
        abaInicial={ABAS.find((a) => a === aba) ?? "usuarios"}
        usuarios={usuarios}
        candidaturas={listarCandidaturas().map((c) => ({
          id: c.id,
          nome: c.nome,
          email: c.email,
          credencial: c.credencial,
          apresentacao: c.apresentacao,
          link: c.link,
          status: c.status,
          enviadaEm: c.enviadaEm,
          motivo: c.motivo,
        }))}
        convites={listarConvites().map((c) => ({
          id: c.id,
          email: c.email,
          criadoEm: c.criadoEm,
          expiraEm: c.expiraEm,
          situacao: c.situacao,
        }))}
      />
    </>
  );
}
