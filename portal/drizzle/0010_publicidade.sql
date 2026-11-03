CREATE TABLE "publicidade_anuncios" (
	"id" text PRIMARY KEY NOT NULL,
	"dono_id" text NOT NULL,
	"status" text NOT NULL,
	"dados" jsonb NOT NULL,
	"versao" integer NOT NULL,
	"criado_em" text NOT NULL,
	"atualizado_em" text NOT NULL,
	CONSTRAINT "publicidade_status_valido" CHECK ("publicidade_anuncios"."status" in ('rascunho','publicado')),
	CONSTRAINT "publicidade_versao_positiva" CHECK ("publicidade_anuncios"."versao" > 0)
);
--> statement-breakpoint
ALTER TABLE "publicidade_anuncios" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "publicidade_imagens" (
	"id" text PRIMARY KEY NOT NULL,
	"dono_id" text NOT NULL,
	"chave" text NOT NULL,
	"tipo" text NOT NULL,
	"tamanho" integer NOT NULL,
	"criado_em" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "publicidade_imagens" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "publicidade_anuncios" ADD CONSTRAINT "publicidade_anuncios_dono_id_usuarios_id_fk" FOREIGN KEY ("dono_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publicidade_imagens" ADD CONSTRAINT "publicidade_imagens_dono_id_usuarios_id_fk" FOREIGN KEY ("dono_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "publicidade_anuncios_dono_idx" ON "publicidade_anuncios" USING btree ("dono_id");--> statement-breakpoint
CREATE INDEX "publicidade_anuncios_status_idx" ON "publicidade_anuncios" USING btree ("status");--> statement-breakpoint
CREATE INDEX "publicidade_imagens_dono_idx" ON "publicidade_imagens" USING btree ("dono_id");