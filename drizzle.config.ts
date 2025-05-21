
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "better-sqlite3",
  driver: "better-sqlite3",
  dbCredentials: {
    url: "sqlite.db"
  },
});
