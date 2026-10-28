/* Armazenamento dos bytes das imagens: S3 (Supabase Storage ou outro compatível). */
export interface ArmazenamentoDeArquivos {
  enviar(chave: string, bytes: Uint8Array, tipo: string): Promise<void>;
  /** null quando o objeto não existe. */
  baixar(chave: string): Promise<Uint8Array | null>;
}
