import "dotenv/config";
import { defineConfig } from "drizzle-kit";

console.log(
	"[drizzle.config] DATABASE_URL present?",
	Boolean(process.env.DATABASE_URL)
);

export default defineConfig({
	dialect: "postgresql",
	schema: "./drizzle/schema.ts",
	out: "./drizzle",
	dbCredentials: { url: process.env.DATABASE_URL! },
});
