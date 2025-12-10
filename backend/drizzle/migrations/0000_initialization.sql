CREATE TYPE "public"."job_status" AS ENUM('pending', 'running', 'success', 'failed');--> statement-breakpoint
CREATE TYPE "public"."job_trigger" AS ENUM('cron', 'manual');--> statement-breakpoint
CREATE TABLE "etl_job_log" (
	"id" text PRIMARY KEY NOT NULL,
	"job_name" text NOT NULL,
	"status" "job_status" DEFAULT 'pending' NOT NULL,
	"triggered_by" "job_trigger" NOT NULL,
	"start_time" timestamp with time zone DEFAULT now() NOT NULL,
	"end_time" timestamp with time zone,
	"log_message" text
);
--> statement-breakpoint
CREATE TABLE "job_schedules" (
	"id" text PRIMARY KEY NOT NULL,
	"job_name" text NOT NULL,
	"cron_expression" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "job_schedules_job_name_unique" UNIQUE("job_name")
);
--> statement-breakpoint
