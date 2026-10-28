import "server-only";
import { GetObjectCommand, NoSuchKey, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { ArmazenamentoDeArquivos } from "./midia.contratos";

/* Implementação S3 do armazenamento. As variáveis estão em .env.example. */

const chave = Symbol.for("sala-dos-buscadores.s3");
type ComS3 = typeof globalThis & { [chave]?: S3Client };

function exigir(nome: string): string {
  const v = process.env[nome];
  if (!v) throw new Error(`${nome} não definida. Copie .env.example para .env.local.`);
  return v;
}

function cliente(): S3Client {
  const g = globalThis as ComS3;
  g[chave] ??= new S3Client({
    endpoint: process.env.S3_ENDPOINT || undefined,
    region: process.env.S3_REGIAO ?? "us-east-1",
    // Supabase Storage e outros compatíveis endereçam o bucket no caminho, não no subdomínio.
    forcePathStyle: Boolean(process.env.S3_ENDPOINT),
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
    credentials: { accessKeyId: exigir("S3_CHAVE"), secretAccessKey: exigir("S3_SEGREDO") },
  });
  return g[chave];
}

export const armazenamentoS3: ArmazenamentoDeArquivos = {
  async enviar(objeto, bytes, tipo) {
    await cliente().send(
      new PutObjectCommand({ Bucket: exigir("S3_BUCKET"), Key: objeto, Body: bytes, ContentType: tipo }),
    );
  },
  async baixar(objeto) {
    try {
      const r = await cliente().send(new GetObjectCommand({ Bucket: exigir("S3_BUCKET"), Key: objeto }));
      return r.Body ? await r.Body.transformToByteArray() : null;
    } catch (e) {
      if (e instanceof NoSuchKey || (e as Error).name === "NoSuchKey") return null;
      throw e;
    }
  },
};
