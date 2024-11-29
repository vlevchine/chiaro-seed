import {
  drizzle,
  type BetterSQLite3Database,
} from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as northern from "./schema/northern";
import * as western from "./schema/western";
import * as registry from "./schema/registry";

const clientSchemas: any = { registry, northern, western };

export async function getConnection(name: string) {
  const schema: any = clientSchemas[name];
  const url = `./db/${name}.db`,
    sqlite = new Database(url),
    db: BetterSQLite3Database = drizzle(sqlite, { schema });
  return db;
}

export async function getMemoryConnection(root: string, name: string) {
  const url = ':memory:',
    sqlite = new Database(url), 
    schema = await import(`../../${root}/${name}/schema.ts`),
    db: BetterSQLite3Database<typeof schema> = drizzle(sqlite, { schema });
  return db;
}