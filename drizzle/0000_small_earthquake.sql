CREATE TABLE "mt_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"router_id" integer NOT NULL,
	"name" varchar(64) NOT NULL,
	"profile" varchar(64),
	"disabled" boolean DEFAULT false NOT NULL,
	"comment" text,
	"last_sync_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "routers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(64) NOT NULL,
	"host" varchar(128) NOT NULL,
	"port" integer DEFAULT 443 NOT NULL,
	"use_tls" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mt_users" ADD CONSTRAINT "mt_users_router_id_routers_id_fk" FOREIGN KEY ("router_id") REFERENCES "public"."routers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ux_router_name" ON "mt_users" USING btree ("router_id","name");