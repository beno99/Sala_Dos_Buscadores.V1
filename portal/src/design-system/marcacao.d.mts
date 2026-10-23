export type Marca = 'negrito' | 'italico' | 'sublinhado' | 'tachado' | 'termo' | 'obra' | 'link';
export type Alinhamento = 'esquerda' | 'centro' | 'direita';
export type BlocoTexto =
  | {tipo:'paragrafo'; texto:string; alinhamento?:Alinhamento; recuo?:0|1|2}
  | {tipo:'intertitulo'; texto:string; nivel?:2|3; alinhamento?:Alinhamento}
  | {tipo:'lista'; itens:string[]; ordenada:boolean}
  | {tipo:'destaque'; texto:string; atribuicao:string};
export interface Edicao { texto:string; trecho:string; inicio:number; fim:number; cursorInicio:number; cursorFim:number }
export interface Parte { tipo:'texto'|'strong'|'em'|'u'|'s'|'dfn'|'cite'|'a'|'ref'; texto:string; inicio:number; fim:number; href?:string; n?:number; conteudoInicio?:number; conteudoFim?:number }
export const MARCAS: Record<Marca,{abre:string;fecha:string;modelo:string;tipo:string}>;
export const ALTERNAVEIS: Marca[];
export function enderecoSeguro(valor:string): string|null;
export function renderizarTexto(texto:string): Parte[];
export function jaMarcado(texto:string,inicio:number,fim:number,marca:Marca): boolean;
export function aplicarMarcacao(texto:string,inicio:number,fim:number,marca:Marca): Edicao;
export function limparMarcacoes(texto:string,inicio:number,fim:number): Edicao;
export function citarFonte(texto:string,posicao:number,n:number): Edicao;
export function textoSemMarcas(texto:string): string;
export function textoDoBloco(bloco:string|BlocoTexto|{tipo:'imagem'}): string;
export function converterBloco(bloco:string|BlocoTexto,estilo:string): {bloco:BlocoTexto;aviso:string};
export function migrarTextoLegado(texto:string): string;
