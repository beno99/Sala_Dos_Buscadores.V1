CREATE TYPE "public"."formato" AS ENUM('texto', 'video');--> statement-breakpoint
CREATE TYPE "public"."origem_sala" AS ENUM('oficial', 'anfitriao');--> statement-breakpoint
CREATE TYPE "public"."placa" AS ENUM('bordo', 'grafite', 'bege');--> statement-breakpoint
CREATE TYPE "public"."proveniencia" AS ENUM('primaria', 'curado', 'especialista', 'comunidade', 'ia', 'anfitriao');--> statement-breakpoint
CREATE TYPE "public"."status_editorial" AS ENUM('rascunho', 'em_revisao', 'publicado', 'reprovado', 'arquivado');--> statement-breakpoint
CREATE TYPE "public"."tipo_conteudo" AS ENUM('artigo', 'fonte-primaria', 'verbete', 'video');--> statement-breakpoint
CREATE TYPE "public"."status_candidatura" AS ENUM('pendente', 'aprovada', 'recusada');--> statement-breakpoint
CREATE TYPE "public"."status_convite" AS ENUM('pendente', 'usado', 'revogado');--> statement-breakpoint
CREATE TYPE "public"."papel" AS ENUM('membro', 'anfitriao', 'administrador');--> statement-breakpoint
CREATE TABLE "citacoes" (
	"id" text PRIMARY KEY NOT NULL,
	"sala" text NOT NULL,
	"obra" text NOT NULL,
	"localizacao" text NOT NULL,
	"proveniencia" "proveniencia" NOT NULL,
	"rotulo_selo" text,
	"original" jsonb,
	"traducao" text NOT NULL,
	"rotulo_traducao" text,
	"referencia" text NOT NULL,
	"capa" "placa" NOT NULL,
	"inicial" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conteudos" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"sala" text NOT NULL,
	"tipo" "tipo_conteudo" NOT NULL,
	"titulo" text NOT NULL,
	"resumo" text NOT NULL,
	"temas" text[] NOT NULL,
	"periodo" text NOT NULL,
	"nivel" integer NOT NULL,
	"formato" "formato" NOT NULL,
	"proveniencia" "proveniencia" NOT NULL,
	"duracao_min" integer NOT NULL,
	"autoria" jsonb NOT NULL,
	"publicado_em" text NOT NULL,
	"corpo" jsonb NOT NULL,
	"citacao" text,
	"fontes" text[] NOT NULL,
	"link" jsonb,
	"imagem" text,
	"thumb" text,
	"anfitriao" jsonb,
	"status" "status_editorial" NOT NULL,
	"criado_em" text NOT NULL,
	"atualizado_em" text NOT NULL,
	"criado_por" text NOT NULL,
	"atualizado_por" text NOT NULL,
	"situacao_juridica" jsonb,
	"tema_divergente" boolean NOT NULL,
	"nota_divergencia" text NOT NULL,
	"producao_ia" boolean NOT NULL,
	"dono_id" text,
	"revisao" jsonb,
	"midias" jsonb,
	CONSTRAINT "conteudos_sala_slug_un" UNIQUE("sala","slug")
);
--> statement-breakpoint
CREATE TABLE "destaques" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"escolha" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fontes" (
	"id" text PRIMARY KEY NOT NULL,
	"titulo" text NOT NULL,
	"autor" text NOT NULL,
	"tradicao" text NOT NULL,
	"tipo" text NOT NULL,
	"referencia" text NOT NULL,
	"url" text,
	"capa" "placa" NOT NULL,
	"inicial" text NOT NULL,
	"criado_em" text NOT NULL,
	"atualizado_em" text NOT NULL,
	"criado_por" text NOT NULL,
	"atualizado_por" text NOT NULL,
	"proposta" jsonb
);
--> statement-breakpoint
CREATE TABLE "salas" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"nome" text NOT NULL,
	"tradicao" text NOT NULL,
	"tradicao_curta" text NOT NULL,
	"descricao" text NOT NULL,
	"periodo" text NOT NULL,
	"placa" "placa" NOT NULL,
	"atualizada_em" text NOT NULL,
	"inicial" text NOT NULL,
	"origem" "origem_sala" NOT NULL,
	"na_comparacao" boolean NOT NULL,
	"imagem" text,
	"link" text,
	"anfitriao" jsonb,
	"status" "status_editorial" NOT NULL,
	"criado_em" text NOT NULL,
	"atualizado_em" text NOT NULL,
	"criado_por" text NOT NULL,
	"atualizado_por" text NOT NULL,
	"dono_id" text,
	"revisao" jsonb,
	"publicada_em" text,
	"status_antes_de_arquivar" "status_editorial",
	"midia" text,
	CONSTRAINT "salas_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "versao_dados" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"versao" bigint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" text PRIMARY KEY NOT NULL,
	"sala" text NOT NULL,
	"titulo" text NOT NULL,
	"duracao" text NOT NULL,
	"tema" text NOT NULL,
	"nivel" integer NOT NULL,
	"episodio" text NOT NULL,
	"publicado_em" text NOT NULL,
	"url" text NOT NULL,
	"placa" "placa" NOT NULL,
	"imagem" text,
	"youtube_id" text NOT NULL,
	"artigos" text[] NOT NULL,
	"status" "status_editorial" NOT NULL,
	"criado_em" text NOT NULL,
	"atualizado_em" text NOT NULL,
	"criado_por" text NOT NULL,
	"atualizado_por" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidaturas" (
	"id" text PRIMARY KEY NOT NULL,
	"conta_id" text NOT NULL,
	"email" text NOT NULL,
	"nome" text NOT NULL,
	"credencial" text NOT NULL,
	"apresentacao" text NOT NULL,
	"link" text,
	"status" "status_candidatura" NOT NULL,
	"enviada_em" text NOT NULL,
	"decidida_em" text,
	"decidida_por" text,
	"motivo" text
);
--> statement-breakpoint
CREATE TABLE "convites" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"email" text NOT NULL,
	"criado_em" text NOT NULL,
	"expira_em" text NOT NULL,
	"criado_por" text NOT NULL,
	"status" "status_convite" NOT NULL,
	"usado_em" text,
	"revogado_em" text,
	CONSTRAINT "convites_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "perfis_anfitriao" (
	"conta_id" text PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"slug" text NOT NULL,
	"credencial" text NOT NULL,
	"apresentacao" text NOT NULL,
	"avatar" text,
	"link" text,
	"atualizado_em" text NOT NULL,
	CONSTRAINT "perfis_anfitriao_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "comentarios" (
	"id" text PRIMARY KEY NOT NULL,
	"publicacao_id" text NOT NULL,
	"autor_id" text NOT NULL,
	"pai_id" text,
	"texto" text NOT NULL,
	"imagem" jsonb,
	"estado" text NOT NULL,
	"criada_em" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "denuncias" (
	"id" text PRIMARY KEY NOT NULL,
	"denunciante_id" text NOT NULL,
	"alvo_tipo" text NOT NULL,
	"alvo_id" text NOT NULL,
	"motivo" text NOT NULL,
	"nota" text,
	"estado" text NOT NULL,
	"criada_em" text NOT NULL,
	"decidida_por" text,
	"motivo_decisao" text
);
--> statement-breakpoint
CREATE TABLE "publicacoes" (
	"id" text PRIMARY KEY NOT NULL,
	"autor_id" text NOT NULL,
	"tipo" text NOT NULL,
	"texto" text NOT NULL,
	"sala_slug" text,
	"temas" text[] NOT NULL,
	"imagem" jsonb,
	"citacao" jsonb,
	"conteudo_id" text,
	"pergunta_dirigida_a" text,
	"resposta_que_ajudou_id" text,
	"fixada" boolean NOT NULL,
	"estado" text NOT NULL,
	"criada_em" text NOT NULL,
	"editada_em" text
);
--> statement-breakpoint
CREATE TABLE "reacoes" (
	"alvo_tipo" text NOT NULL,
	"alvo_id" text NOT NULL,
	"pessoa" text NOT NULL,
	"tipo" text NOT NULL,
	CONSTRAINT "reacoes_alvo_tipo_alvo_id_pessoa_pk" PRIMARY KEY("alvo_tipo","alvo_id","pessoa")
);
--> statement-breakpoint
CREATE TABLE "salvos" (
	"pessoa" text NOT NULL,
	"publicacao_id" text NOT NULL,
	"criado_em" text NOT NULL,
	CONSTRAINT "salvos_pessoa_publicacao_id_pk" PRIMARY KEY("pessoa","publicacao_id")
);
--> statement-breakpoint
CREATE TABLE "seguindo" (
	"seguidor" text NOT NULL,
	"alvo_tipo" text NOT NULL,
	"alvo_id" text NOT NULL,
	CONSTRAINT "seguindo_seguidor_alvo_tipo_alvo_id_pk" PRIMARY KEY("seguidor","alvo_tipo","alvo_id")
);
--> statement-breakpoint
CREATE TABLE "sessoes" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"usuario_id" text NOT NULL,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL,
	"expira_em" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"senha_hash" text NOT NULL,
	"pseudonimo" text NOT NULL,
	"papel" "papel" DEFAULT 'membro' NOT NULL,
	"membro_desde" timestamp with time zone DEFAULT now() NOT NULL,
	"preferencias" jsonb,
	CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "perfis_buscador" (
	"usuario_id" text PRIMARY KEY NOT NULL,
	"foto_id" text,
	"capa_id" text,
	"sobre" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "progresso_estudo" (
	"usuario_id" text PRIMARY KEY NOT NULL,
	"dados" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "midias" (
	"id" text PRIMARY KEY NOT NULL,
	"chave" text NOT NULL,
	"tipo" text NOT NULL,
	"tamanho" integer NOT NULL,
	"dono_id" text NOT NULL,
	"criado_em" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auditoria" (
	"id" text PRIMARY KEY NOT NULL,
	"quando" text NOT NULL,
	"quem" text NOT NULL,
	"acao" text NOT NULL,
	"tipo_item" text NOT NULL,
	"item_id" text NOT NULL,
	"item_titulo" text NOT NULL,
	"mudancas" jsonb
);
--> statement-breakpoint
CREATE TABLE "emails_enviados" (
	"id" text PRIMARY KEY NOT NULL,
	"para" text NOT NULL,
	"assunto" text NOT NULL,
	"corpo" text NOT NULL,
	"quando" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "citacoes" ADD CONSTRAINT "citacoes_sala_salas_slug_fk" FOREIGN KEY ("sala") REFERENCES "public"."salas"("slug") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "conteudos" ADD CONSTRAINT "conteudos_sala_salas_slug_fk" FOREIGN KEY ("sala") REFERENCES "public"."salas"("slug") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_sala_salas_slug_fk" FOREIGN KEY ("sala") REFERENCES "public"."salas"("slug") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "candidaturas" ADD CONSTRAINT "candidaturas_conta_id_usuarios_id_fk" FOREIGN KEY ("conta_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perfis_anfitriao" ADD CONSTRAINT "perfis_anfitriao_conta_id_usuarios_id_fk" FOREIGN KEY ("conta_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_publicacao_id_publicacoes_id_fk" FOREIGN KEY ("publicacao_id") REFERENCES "public"."publicacoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessoes" ADD CONSTRAINT "sessoes_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perfis_buscador" ADD CONSTRAINT "perfis_buscador_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progresso_estudo" ADD CONSTRAINT "progresso_estudo_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "conteudos_dono_idx" ON "conteudos" USING btree ("dono_id");--> statement-breakpoint
CREATE INDEX "salas_dono_idx" ON "salas" USING btree ("dono_id");--> statement-breakpoint
CREATE INDEX "sessoes_usuario_idx" ON "sessoes" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX "auditoria_item_idx" ON "auditoria" USING btree ("item_id");