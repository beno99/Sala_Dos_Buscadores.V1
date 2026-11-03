CREATE TABLE "mensagens_curadoria" (
	"id" text PRIMARY KEY NOT NULL,
	"anfitriao_id" text NOT NULL,
	"autor_id" text NOT NULL,
	"texto" text NOT NULL,
	"criada_em" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mensagens_curadoria" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "mensagens_curadoria" ADD CONSTRAINT "mensagens_curadoria_anfitriao_id_usuarios_id_fk" FOREIGN KEY ("anfitriao_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "mensagens_curadoria_anfitriao_idx" ON "mensagens_curadoria" USING btree ("anfitriao_id","criada_em");