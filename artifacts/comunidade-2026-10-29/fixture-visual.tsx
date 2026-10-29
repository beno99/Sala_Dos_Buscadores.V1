import React from 'react';
import {createRoot} from 'react-dom/client';
import {FeedComunidade} from '/Users/benonibrandao/Desktop/Portal_Sala_Buscadores/portal/src/features/comunidade/ui/FeedComunidade';
import {ToastProvider} from '/Users/benonibrandao/Desktop/Portal_Sala_Buscadores/portal/src/components/ds/Toast';
// Fixture visual isolada: não grava no banco nem é uma rota do portal.
const agora='2026-10-29T12:00:00Z';
const pessoas=[['lucia','Lúcia Mendes','LM'],['tomas','Tomás Arruda','TA'],['rafael','Rafael Souza','RS'],['helena','Helena Varga','HV']].map(([id,nome,iniciais])=>({id,nome,iniciais,href:'/perfil/'+id,anfitriao:id==='helena'}));
const textos=[
'Voltei ao Poimandres, especialmente aos §§24–26. Estou anotando como o tratado descreve a subida da alma e quais palavras variam entre traduções.\n\nQuero separar melhor a passagem citada da minha interpretação. Como vocês organizam essas notas?',
'Esta passagem abriu uma pergunta nas minhas notas: que sentido de “mente” os autores empregam? Compartilho a referência para estudarmos seu contexto.',
'Como vocês comparam o “conhecer a si mesmo” do dito 3 do Evangelho de Tomé com o vocabulário do Poimandres, sem tratar os textos como equivalentes?',
'Encontrei esta passagem no acervo. A referência por parágrafos ajuda a voltar ao texto durante a conversa.'
];
const publicacoes=['reflexao','citacao','pergunta','achado'].map((tipo,i)=>({id:'visual-'+i,autorId:pessoas[i].id,autor:pessoas[i],tipo,texto:textos[i],salaSlug:i===1?'caibalion':'corpus-hermeticum',salaNome:i===1?'O Caibalion':'Corpus Hermeticum',temas:['conhecimento-interior'],nivel:{valor:2,assunto:'Corpus Hermeticum'},estado:'visivel',fixada:false,criadaEm:'2026-10-29T10:00:00Z',curtidas:5,comentarios:i===0?[{id:'c1',publicacaoId:'visual-0',autorId:'helena',autor:pessoas[3],texto:'Eu começaria indicando a edição e a passagem usadas na comparação.',estado:'visivel',criadaEm:'2026-10-29T11:00:00Z',curtidas:2}]:[],...(i===1?{citacao:{trecho:'O TODO é MENTE; o Universo é Mental.',obra:'O Caibalion',passagem:'Capítulo II · 1908'}}:{}),...(i===2?{dirigidaA:pessoas[3]}:{}),...(i===3?{conteudo:{id:'p',sala:'corpus-hermeticum',slug:'poimandres-subida',titulo:'Poimandres, §24–26: a subida pelas esferas',proveniencia:'primaria'}}:{})}));
if (location.search.includes('longo')) publicacoes[0].texto = textos[0]+'\n\n'+textos[0]+'\n\n'+textos[0]+'\n\nÚltimo parágrafo da leitura.';
const modelo={pessoa:pessoas[0],publicacoes,seguindo:[publicacoes[3]],pessoas,seguindoPessoas:[pessoas[3],pessoas[2]],seguindoSalas:[],salvos:[],curtidas:[],numeros:{publicacoes:8,seguidores:12,seguindo:6},nivel:{valor:2,assunto:'Corpus Hermeticum'},debate:[{tema:'alma',temaNome:'Alma',sala:'corpus-hermeticum',salaNome:'Corpus Hermeticum',conversas:5}],agora};
createRoot(document.getElementById('root')!).render(<ToastProvider><FeedComunidade modelo={modelo as any}/></ToastProvider>);
