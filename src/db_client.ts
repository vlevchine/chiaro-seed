import {
  drizzle,
  type BetterSQLite3Database,
} from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

export async function getConnection(name: string) {
  const url = `./db/${name}.db`,
    sqlite = new Database(url),
    db: BetterSQLite3Database = drizzle(sqlite);
  return db;
}

export async function getMemoryConnection(root: string, name: string) {
  const url = ':memory:',
    sqlite = new Database(url), 
    schema = await import(`../../${root}/${name}/schema.ts`),
    db: BetterSQLite3Database<typeof schema> = drizzle(sqlite, { schema });
  return db;
}