import fs from "fs";
import { eq } from 'drizzle-orm';
import { getConnection } from "./db_client";
import { generate, getTenants, testSession, init } from "./mock";
import {generateSessionToken, getIdFromToken} from './helpers'
import * as northern from "./schema/northern";
import * as registry from "./schema/registry";
import * as western from "./schema/western";

const co = "registry"; //"northern";

const clientSchemas: any = { registry, northern, western },
  schema: any = clientSchemas[co];
if (co === "registry") {
   // test()
  seedRegistry(["northern", "western", "eastern", "southern"]);
} else seedClient();

//process.env.TEST_VALUE
async function seedClient(): Promise<void> {
  let t0 = Date.now();
  const items: any[] = [
      ["company"],
      ["vendor", 300],
      ["user", 32],
      ["well", 10000],
      ["wellBore", 0, "well"],
      ["project", 0, "well", "user"],
    ],
    db: any = await getConnection(co),
    cached: any = {},
    conf: any = readLookups("lookups"),
    lLookups: any = readLookups("largeLookups");
  init(co, conf, lLookups);
  // const res = await db.query.user.findMany({with: {affiliation: true}});
  // console.log(res.filter((u: any) => u.affiliation))
  for await (const [tbl, prm, ch, ch1] of items) {
    //t0 = Date.now();
    if (ch && !cached[ch]) cached[ch] = await db.select().from(schema[ch]);
    if (ch1 && !cached[ch1]) cached[ch1] = await db.select().from(schema[ch1]);
    const values: any[] = await generate[tbl](prm, cached);
    //  const res = await writeTable(db, schema[tbl], values);
    // console.log(tbl, values.at(0));
    const result = await db.select().from(schema[tbl]);
    console.log(tbl, result?.length);
  }
  console.log(`finished: ${Date.now() - t0}ms`);
}
async function seedRegistry(ids: string[]): Promise<void> {
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
   // await writeTable(db, registry.session, [session]);
//   const session1 = await db.query.session.findFirst({
//     with: { tenant: { columns: { name: true, locale: true, timezone: true } } },
//     where: (item: any, ops: any) => ops.eq(item.id, 11),
//       });
}
async function test() {
      const token = await generateSessionToken("hello world");
      const t0 = Date.now();
      const id1 = await getIdFromToken(token);
      console.log(token);
      console.log(id1, Date.now() - t0);
}

async function writeTable(db: any, tbl: any, values: any[]) {
  const chunk = 1000,
    length = Math.ceil(values.length / chunk),
    arr = Array.from({ length }).map((e, i) => i);
  for await (const ind of arr) {
    const start = ind * chunk,
      vals = values.slice(start, start + chunk);
    await db.insert(tbl).values(vals);
  }
  return; //Promise.resolve();
}

function readLookups(name: string) {
  //!!! To update lookups per app.yaml / lookups object
  //use https://onlineyamltools.com/convert-yaml-to-json
  const _conf = fs.readFileSync(`./lookups/${name}.json`, {
    encoding: "utf8",
  });
  return JSON.parse(_conf);
}
