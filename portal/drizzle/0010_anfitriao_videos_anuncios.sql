CREATE TABLE "anuncios" (
	"id" text PRIMARY KEY NOT NULL,
	"titulo" text NOT NULL,
	"descricao" text NOT NULL,
	"categoria" text,
	"href" text NOT NULL,
	"anunciante" text NOT NULL,
	"chamada" text NOT NULL,
	"texto_alternativo" text NOT NULL,
	"midia" text,
	"imagem" text,
	"publicado_em" text,
	"status" "status_editorial" NOT NULL,
	"criado_em" text NOT NULL,
	"atualizado_em" text NOT NULL,
	"criado_por" text NOT NULL,
	"atualizado_por" text NOT NULL,
	"dono_id" text NOT NULL,
	"revisao" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "anuncios" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "dono_id" text;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "revisao" jsonb;--> statement-breakpoint
CREATE INDEX "anuncios_dono_idx" ON "anuncios" USING btree ("dono_id");--> statement-breakpoint
CREATE INDEX "anuncios_status_idx" ON "anuncios" USING btree ("status");--> statement-breakpoint
CREATE INDEX "videos_dono_idx" ON "videos" USING btree ("dono_id");