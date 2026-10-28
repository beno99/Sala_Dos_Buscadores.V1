/* Armazenamento dos bytes das imagens: S3 (MinIO no docker-compose, R2 ou S3 em produção). */
export interface ArmazenamentoDeArquivos {
  enviar(chave: string, bytes: Uint8Array, tipo: string): Promise<void>;
  /** null quando o objeto não existe. */
  baixar(chave: string): Promise<Uint8Array | null>;
}
