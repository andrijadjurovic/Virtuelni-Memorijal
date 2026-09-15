import { createClient } from "@libsql/client";
import { readFile } from "node:fs/promises";

const url = process.env.TURSO_DATABASE_URL?.trim();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

if (!url || !authToken) {
  console.error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required.");
  process.exit(1);
}

const client = createClient({ url, authToken });
const migration = await readFile("prisma/migrations/20260915181608_init_sqlite/migration.sql", "utf8");
const statements = migration.split(";\n").map((statement) => statement.trim()).filter(Boolean);

await client.batch(statements.map((sql) => ({ sql, args: [] })), "write");
console.log(`Applied ${statements.length} Turso schema statements.`);