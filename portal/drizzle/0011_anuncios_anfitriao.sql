DROP TABLE IF EXISTS "anuncios";--> statement-breakpoint
CREATE TYPE "public"."status_anuncio" AS ENUM('rascunho', 'publicado');--> statement-breakpoint
CREATE TABLE "anuncios" (
	"id" text PRIMARY KEY NOT NULL,
	"dono_id" text NOT NULL,
	"status" "status_anuncio" NOT NULL,
	"midia" text,
	"foco_x" integer DEFAULT 50 NOT NULL,
	"foco_y" integer DEFAULT 50 NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"categoria" text DEFAULT '' NOT NULL,
	"titulo" text DEFAULT '' NOT NULL,
	"descricao" text DEFAULT '' NOT NULL,
	"href" text DEFAULT '' NOT NULL,
	"chamada" text DEFAULT '' NOT NULL,
	"anunciante" text DEFAULT '' NOT NULL,
	"criado_em" text NOT NULL,
	"atualizado_em" text NOT NULL,
	"publicado_em" text
);
--> statement-breakpoint
ALTER TABLE "anuncios" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "anuncios" ADD CONSTRAINT "anuncios_dono_id_usuarios_id_fk" FOREIGN KEY ("dono_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "anuncios_dono_idx" ON "anuncios" USING btree ("dono_id");