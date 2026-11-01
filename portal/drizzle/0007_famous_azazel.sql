ALTER TABLE "videos" RENAME COLUMN "tema" TO "temas";--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "temas" TYPE text[] USING ARRAY["temas"]::text[];