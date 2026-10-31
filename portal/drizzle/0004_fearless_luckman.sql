CREATE TABLE "verificacoes_email" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"usuario_id" text NOT NULL,
	"expira_em" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "verificacoes_email" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "email_verificado_em" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "verificacoes_email" ADD CONSTRAINT "verificacoes_email_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "verificacoes_usuario_idx" ON "verificacoes_email" USING btree ("usuario_id");