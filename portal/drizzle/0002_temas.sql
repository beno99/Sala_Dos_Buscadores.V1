CREATE TABLE "temas" (
	"slug" text PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"sinonimos" text[] NOT NULL,
	"criado_em" text NOT NULL,
	"criado_por" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "temas" ENABLE ROW LEVEL SECURITY;