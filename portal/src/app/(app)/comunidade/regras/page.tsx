import { ButtonLink } from "@/components/ds/Button";

export const metadata = { title: "Regras da Comunidade" };

const REGRAS = [
  ["Respeito entre tradições", "Leituras diferentes convivem aqui. Discuta ideias, nunca pessoas."],
  ["Sem proselitismo", "Não pregue nem desqualifique crenças. Este é um lugar de estudo, não de conversão."],
  ["Sem conteúdo médico ou de cura", "Não prometa cura nem oriente tratamentos."],
  ["Sem dados pessoais de terceiros", "Não publique nomes, contatos ou histórias de outras pessoas."],
  ["Atribua suas fontes", "Ao afirmar algo sobre um texto, indique a obra e a passagem."],
] as const;

export default function RegrasDaComunidade() {
  return (
    <div className="sdb-community sdb-community-piece sdb-community-stack">
      <header className="sdb-community__head">
        <h1 className="sdb-title-1">Regras da Comunidade</h1>
        <ButtonLink href="/comunidade" variant="plain">
          Voltar à Comunidade
        </ButtonLink>
      </header>
      <p className="sdb-body-sm">
        A Comunidade é um caderno de estudos em voz alta. Publicações e comentários são de quem os escreve e
        não passam pela curadoria do acervo.
      </p>
      {REGRAS.map(([titulo, texto]) => (
        <section key={titulo}>
          <h2 className="sdb-headline">{titulo}</h2>
          <p className="sdb-body-sm">{texto}</p>
        </section>
      ))}
      <p className="sdb-footnote">
        Quem quebrar estas regras pode ter publicações e comentários ocultados pela curadoria.
      </p>
    </div>
  );
}
