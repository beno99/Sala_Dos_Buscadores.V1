CREATE TABLE "redefinicoes_senha" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"usuario_id" text NOT NULL,
	"expira_em" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "redefinicoes_senha" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "citacoes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "conteudos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "destaques" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "fontes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "salas" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "videos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "candidaturas" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "convites" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "perfis_anfitriao" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "versao_dados" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "comentarios" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "denuncias" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "publicacoes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "reacoes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "salvos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "seguindo" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "sessoes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "usuarios" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "perfis_buscador" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "progresso_estudo" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "midias" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auditoria" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "emails_enviados" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "redefinicoes_senha" ADD CONSTRAINT "redefinicoes_senha_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "redefinicoes_usuario_idx" ON "redefinicoes_senha" USING btree ("usuario_id");