import type { Metadata } from "next";
import { AvisoNeutralidade } from "@/components/ds/AvisoNeutralidade";

export const metadata: Metadata = { title: "Sobre e políticas" };

const SECOES = [
  {
    id: "assistente",
    titulo: "Como funciona o assistente",
    texto: [
      "O assistente é uma inteligência artificial que consulta só o acervo das Salas. Cada resposta separa o trecho documental, a interpretação da equipe editorial e a síntese escrita pela IA, e numera as fontes.",
      "Quando as tradições divergem, a resposta mostra as diferenças sem dizer qual está certa. Quando o acervo não trata de um tema, ele diz isso em vez de preencher a lacuna.",
    ],
  },
  {
    id: "politica-editorial",
    titulo: "Política editorial",
    texto: [
      "Todo conteúdo mostra de onde vem: fonte primária, editorial curado, especialista ou comunidade. Toda afirmação é atribuída a uma fonte, e datas incertas ficam incertas.",
      "A curadoria organiza fontes, contextos e caminhos e deixa a conclusão com quem lê: curador de museu, não pregador.",
    ],
  },
  {
    id: "politica-publicidade",
    titulo: "Política de publicidade",
    texto: [
      "Os anúncios ajudam a manter o acervo aberto e passam por curadoria editorial antes de entrar. Não aceitamos charlatanismo, promessa de cura, manipulação religiosa, contagem regressiva ou urgência.",
      "Anúncios aparecem sempre com o rótulo “Publicidade” e o nome do anunciante, e nunca dentro da grade comparativa, das respostas do assistente ou da leitura de um conteúdo.",
    ],
  },
  {
    id: "termos",
    titulo: "Termos em linguagem simples",
    texto: [
      "A conta é gratuita e pessoal. Você aparece para outras pessoas só pelo pseudônimo. O acervo é para estudo; cite as fontes indicadas quando usar um trecho.",
    ],
  },
  {
    id: "privacidade",
    titulo: "Privacidade e LGPD",
    texto: [
      "Guardamos e-mail, pseudônimo, preferências e o seu progresso de estudo, só para manter a conta e sugerir conteúdos. Nada disso aparece para outras pessoas: não há perfil público, placar ou comparação entre membros.",
      "Religião ou convicção é opcional e só fica guardada com o seu consentimento (LGPD, art. 11). Em Ajustes, você muda ou apaga as respostas a qualquer momento.",
    ],
  },
];

/* TODO(redesign): aguarda referências; textos jurídicos finais dependem de revisão. */
export default function SobrePage() {
  return (
    <article className="flex max-w-read flex-col gap-8" aria-labelledby="titulo-sobre">
      <h1 id="titulo-sobre" className="sdb-title-1">
        Sobre e políticas
      </h1>
      {SECOES.map((s) => (
        <section
          key={s.id}
          id={s.id}
          className="flex scroll-mt-9 flex-col gap-3"
          aria-labelledby={`${s.id}-titulo`}
        >
          <h2 id={`${s.id}-titulo`} className="sdb-title-2">
            {s.titulo}
          </h2>
          {s.texto.map((p) => (
            <p key={p.slice(0, 24)} className="sdb-body-sm">
              {p}
            </p>
          ))}
        </section>
      ))}
      <AvisoNeutralidade />
    </article>
  );
}
