CREATE TABLE "match_message" (
	"id" text PRIMARY KEY NOT NULL,
	"match_id" text NOT NULL,
	"user_id" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "match_result" (
	"id" text PRIMARY KEY NOT NULL,
	"match_id" text NOT NULL,
	"reported_by" text NOT NULL,
	"winner_side" integer NOT NULL,
	"score" text DEFAULT '' NOT NULL,
	"no_shows" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "match_message_matchId_idx" ON "match_message" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "match_result_matchId_idx" ON "match_result" USING btree ("match_id");