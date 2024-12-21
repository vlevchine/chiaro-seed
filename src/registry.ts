import { eq } from "drizzle-orm";
import fs from "fs";
import { getConnection } from "./db_client";
import { generateSessionToken, getIdFromToken } from "./helpers";
import { generate, getTenants, init, testSession, initMocks } from "./mock";
import * as northern from "./schema/northern";
import * as registry from "./schema/registry";
import * as western from "./schema/western";

const co: string = "registry";

const clientSchemas: any = { registry, northern, western },
  schema: any = clientSchemas[co];
seedRegistry(["northern", "western", "eastern", "southern"]);

async function seedRegistry(ids: string[]): Promise<void> {
  await initMocks();
  const db: any = await getConnection(co),
    tenantId = ids[0],
    tenant_db: any = await getConnection(tenantId),
    tenants = getTenants(ids);
  // await writeTable(db, registry.tenant, tenants);
  const user = await tenant_db
      .select()
      .from(clientSchemas[tenantId].user)
      .where(eq(clientSchemas[tenantId].user.id, 1)),
    session = testSession(tenants[0], user[0]);
  await db.insert(registry.session).values([session]);

  //   const session1 = await db.query.session.findFirst({
  //     with: { tenant: { columns: { name: true, locale: true, timezone: true } } },
  //     where: (item: any, ops: any) => ops.eq(item.id, 11),
  //       });
}
async function testTokens() {
  const token = await generateSessionToken("hello world");
  const t0 = Date.now();
  const id1 = await getIdFromToken(token);
  console.log(token);
  console.log(id1, Date.now() - t0);
}

async function writeTable(db: any, tbl: any, values: any[]) {
  const chunk = 500,
    length = Math.ceil(values.length / chunk),
    arr = Array.from({ length }).map((e, i) => i);
  for await (const ind of arr) {
    const start = ind * chunk,
      vals = values.slice(start, start + chunk);
    await db.insert(tbl).values(vals);
  }
  return; //Promise.resolve();
}
