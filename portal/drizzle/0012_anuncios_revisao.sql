-- Anúncios passam pela curadoria (mesmo ciclo de Salas e vídeos) e vídeos de
-- anfitrião ganham dono e revisão. Aditiva e idempotente: as colunas de vídeo
-- já existem em bancos que aplicaram a antiga 0010_anfitriao_videos_anuncios.
ALTER TYPE "public"."status_anuncio" ADD VALUE IF NOT EXISTS 'em_revisao';--> statement-breakpoint
ALTER TYPE "public"."status_anuncio" ADD VALUE IF NOT EXISTS 'reprovado';--> statement-breakpoint
ALTER TYPE "public"."status_anuncio" ADD VALUE IF NOT EXISTS 'arquivado';--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "dono_id" text;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "revisao" jsonb;--> statement-breakpoint
ALTER TABLE "anuncios" ADD COLUMN IF NOT EXISTS "revisao" jsonb;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "videos_dono_idx" ON "videos" USING btree ("dono_id");
