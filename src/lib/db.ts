import postgres from "postgres";

type Sql = ReturnType<typeof postgres>;

const globalForDb = globalThis as unknown as { __tokenledgerSql?: Sql };

export function getDb(): Sql {
  if (globalForDb.__tokenledgerSql) return globalForDb.__tokenledgerSql;

  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and point it at Postgres.",
    );
  }

  const sql = postgres(url, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 15,
    prepare: false,
  });

  globalForDb.__tokenledgerSql = sql;
  return sql;
}
