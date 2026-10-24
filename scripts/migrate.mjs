import { readFile } from "node:fs/promises";
import postgres from "postgres";

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
const sql = postgres(url, { max: 1, prepare: false });

try {
  await sql.unsafe(schema);
  console.log("Schema applied.");
} finally {
  await sql.end();
}
