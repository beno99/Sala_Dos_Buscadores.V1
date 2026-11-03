CREATE TABLE "bloqueios_mensagens" (
	"quem_id" text NOT NULL,
	"bloqueado_id" text NOT NULL,
	"criado_em" text NOT NULL,
	CONSTRAINT "bloqueios_mensagens_quem_id_bloqueado_id_pk" PRIMARY KEY("quem_id","bloqueado_id")
);
--> statement-breakpoint
ALTER TABLE "bloqueios_mensagens" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "mensagens_diretas" (
	"id" text PRIMARY KEY NOT NULL,
	"conversa" text NOT NULL,
	"remetente_id" text NOT NULL,
	"destinatario_id" text NOT NULL,
	"texto" text NOT NULL,
	"anexos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"criada_em" text NOT NULL,
	"lida_em" text
);
--> statement-breakpoint
ALTER TABLE "mensagens_diretas" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "mensagens_curadoria" ADD COLUMN "anexos" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "bloqueios_mensagens" ADD CONSTRAINT "bloqueios_mensagens_quem_id_usuarios_id_fk" FOREIGN KEY ("quem_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bloqueios_mensagens" ADD CONSTRAINT "bloqueios_mensagens_bloqueado_id_usuarios_id_fk" FOREIGN KEY ("bloqueado_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensagens_diretas" ADD CONSTRAINT "mensagens_diretas_remetente_id_usuarios_id_fk" FOREIGN KEY ("remetente_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensagens_diretas" ADD CONSTRAINT "mensagens_diretas_destinatario_id_usuarios_id_fk" FOREIGN KEY ("destinatario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "mensagens_diretas_conversa_idx" ON "mensagens_diretas" USING btree ("conversa","criada_em");--> statement-breakpoint
CREATE INDEX "mensagens_diretas_destinatario_idx" ON "mensagens_diretas" USING btree ("destinatario_id","lida_em");--> statement-breakpoint
CREATE INDEX "mensagens_diretas_remetente_idx" ON "mensagens_diretas" USING btree ("remetente_id","criada_em");