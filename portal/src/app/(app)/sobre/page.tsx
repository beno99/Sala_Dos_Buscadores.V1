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
      "Guardamos os dados necessários para manter sua conta e seu estudo. Seu e-mail, suas preferências e seu histórico detalhado de estudo não são exibidos nos perfis da Comunidade. O pseudônimo e a foto do seu perfil podem ser vistos por outras pessoas autenticadas no Portal. Publicações e interações na Comunidade também aparecem para seus participantes.",
      "Com a exibição de níveis habilitada, suas publicações relacionadas a uma Sala podem mostrar o nível de estudo nessa Sala. Você pode desativar essa exibição em Ajustes. Seu histórico detalhado de leituras permanece privado.",
      "Os perfis públicos de Anfitriões apresentam sua assinatura, apresentação e materiais publicados. Público aqui significa acessível às contas do Portal: o acesso ao acervo exige login. Não há ranking público de progresso entre pessoas.",
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
          className="sdb-policy-section flex flex-col gap-3"
          tabIndex={-1}
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
