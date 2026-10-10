import type { EscolhaDestaques } from "@/features/destaques/vagas";

/*
 * Escolha inicial da curadoria para a página Destaques (ids do acervo
 * editorial: `c-<slug>` para conteúdos). Mesma escolha do mockup aprovado.
 */
export const DESTAQUES_INICIAIS: EscolhaDestaques = {
  video: ["v-poimandres"],
  cards: [
    "c-sete-principios-hermeticos",
    "c-poimandres-a-mente-que-fala",
    "c-evangelho-de-tome-114-ditos",
    "c-caibalion-principio-do-mentalismo",
  ],
  // A primeira vaga vai para o centro do mosaico.
  artigos: [
    "c-o-que-e-um-apocrifo",
    "c-quem-foram-os-tres-iniciados",
    "c-tratado-xiii-renascimento-silencio",
    "c-documento-47-mundos-das-mansoes",
    "c-apocalipse-de-pedro-imagens-do-alem",
  ],
};
