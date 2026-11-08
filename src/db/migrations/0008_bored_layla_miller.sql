CREATE TABLE "announcement_enrichments" (
	"id" serial PRIMARY KEY NOT NULL,
	"announcement_id" integer NOT NULL,
	"external_ktu_id" varchar(128) NOT NULL,
	"is_btech_relevant" boolean DEFAULT true NOT NULL,
	"category" varchar(64) DEFAULT 'Other Notifications' NOT NULL,
	"is_category_manual_override" boolean DEFAULT false NOT NULL,
	"short_description" text,
	"full_description" text,
	"academic_year" varchar(32),
	"semester" varchar(32),
	"source_url" text NOT NULL,
	"original_pdf_url" text,
	"extracted_details" jsonb NOT NULL,
	"processing_status" varchar(32) DEFAULT 'pending' NOT NULL,
	"poster_status" varchar(32) DEFAULT 'not_generated' NOT NULL,
	"suggested_template_id" varchar(64),
	"content_hash" varchar(64) NOT NULL,
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generated_posters" (
	"id" serial PRIMARY KEY NOT NULL,
	"announcement_id" integer NOT NULL,
	"template_id" varchar(64) NOT NULL,
	"format_key" varchar(32) NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"export_format" varchar(16) DEFAULT 'png' NOT NULL,
	"rendered_fields" jsonb NOT NULL,
	"custom_overrides" jsonb NOT NULL,
	"file_url" text NOT NULL,
	"generation_mode" varchar(16) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"fetch_interval_minutes" integer DEFAULT 15 NOT NULL,
	"poster_generation_mode" varchar(32) DEFAULT 'manual_approval' NOT NULL,
	"default_export_format" varchar(32) DEFAULT 'instagram_portrait' NOT NULL,
	"btech_only_filter" boolean DEFAULT true NOT NULL,
	"official_ktu_sources" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poster_templates" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"style_key" varchar(64) NOT NULL,
	"description" text NOT NULL,
	"default_categories" jsonb NOT NULL,
	"design_tokens" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_name" varchar(128) NOT NULL,
	"status" varchar(32) NOT NULL,
	"fetched_count" integer DEFAULT 0 NOT NULL,
	"new_btech_count" integer DEFAULT 0 NOT NULL,
	"updated_count" integer DEFAULT 0 NOT NULL,
	"posters_triggered" integer DEFAULT 0 NOT NULL,
	"duration_ms" integer NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "announcement_enrichments" ADD CONSTRAINT "announcement_enrichments_announcement_id_announcements_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_posters" ADD CONSTRAINT "generated_posters_announcement_id_announcements_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_posters" ADD CONSTRAINT "generated_posters_template_id_poster_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."poster_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "enrichments_announcement_id_idx" ON "announcement_enrichments" USING btree ("announcement_id");--> statement-breakpoint
CREATE INDEX "enrichments_category_idx" ON "announcement_enrichments" USING btree ("category");--> statement-breakpoint
CREATE INDEX "enrichments_poster_status_idx" ON "announcement_enrichments" USING btree ("poster_status");--> statement-breakpoint
CREATE INDEX "enrichments_btech_idx" ON "announcement_enrichments" USING btree ("is_btech_relevant");--> statement-breakpoint
CREATE INDEX "generated_posters_announcement_idx" ON "generated_posters" USING btree ("announcement_id");
