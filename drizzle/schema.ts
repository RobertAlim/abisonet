// drizzle/schema.ts
import {
	pgTable,
	serial,
	varchar,
	boolean,
	integer,
	timestamp,
	text,
	uniqueIndex,
} from "drizzle-orm/pg-core";

export const routers = pgTable("routers", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 64 }).notNull(),
	host: varchar("host", { length: 128 }).notNull(),
	port: integer("port").default(443).notNull(),
	useTls: boolean("use_tls").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const mtUsers = pgTable(
	"mt_users",
	{
		id: serial("id").primaryKey(),
		routerId: integer("router_id")
			.notNull()
			.references(() => routers.id),
		name: varchar("name", { length: 64 }).notNull(), // maps to /ip/hotspot/user name
		profile: varchar("profile", { length: 64 }),
		disabled: boolean("disabled").default(false).notNull(),
		comment: text("comment"),
		lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
	},
	(t) => ({
		uniqPerRouter: uniqueIndex("ux_router_name").on(t.routerId, t.name),
	})
);
