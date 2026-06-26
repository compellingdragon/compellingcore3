import "dotenv/config";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("Set DATABASE_URL before running npm run db:setup.");

const here = path.dirname(fileURLToPath(import.meta.url));
const migration = await readFile(path.join(here, "../db/001_init.sql"), "utf8");
const sql = postgres(connectionString, { prepare: false, max: 1 });

try {
  await sql.unsafe(migration);
  console.log("CompellingCore database is ready.");
} finally {
  await sql.end();
}
