import { eq } from "drizzle-orm";
import fs from "fs";
import { getConnection } from "./db_client";
import { generateSessionToken, getIdFromToken } from "./helpers";
import { generate, getTenants, init, testSession, initMocks } from "./mock";
import * as northern from "./schema/northern";
import * as registry from "./schema/registry";
import * as western from "./schema/western";

let comp = "northern";
const co: string = "";
//const co: string = "northern";
//const co: string = "registry";

const clientSchemas: any = { registry, northern, western },
  schema: any = clientSchemas[co];
if (co === "registry") {
  seedRegistry(["northern", "western", "eastern", "southern"]);
} else if (co) {
  seedClient();
} else test();

async function test() {
  const id = "RaKeJd69v1";
  const db: any = await getConnection(comp),
    schema = clientSchemas[comp],
    well = schema.well,
    result: any = await db.query.well.findFirst({
      // where: eq(well.id, id),
      with: {
        wellbores: true,
        projects: true,
        stakeHolders: { with: { company: { columns: { name: true } } } },
        operator: true,
      },
    });
  console.log("testing", result);
  console.log(result.stakeHolders.map((e: any) => e.company));
}
//process.env.TEST_VALUE
async function seedClient(): Promise<void> {
  await initMocks();
  let t0 = Date.now();
  const items: any[] = [
      { tblPrimary: "company" },
      { tblPrimary: "vendor", size: 300 },
      { tblPrimary: "user", size: 32 },
      { tblPrimary: "well", tblSecondary: "companyToWell", size: 10000 },
      { tblPrimary: "wellbore" },
      { tblPrimary: "project", tblSecondary: "projectToWellbore" },
    ],
    db: any = await getConnection(co),
    cached: any = {},
    conf: any = readLookups("lookups"),
    lLookups: any = readLookups("largeLookups");
  init(co, conf, lLookups);
  // const res = await db.query.user.findMany({with: {affiliation: true}});
  // console.log(res.filter((u: any) => u.affiliation))
  for await (const { tblPrimary, tblSecondary, size } of items) {
    // if (ch && !cached[ch]) cached[ch] = await db.select().from(schema[ch]);
    // if (ch1 && !cached[ch1]) cached[ch1] = await db.select().from(schema[ch1]);

    let secondary,
      values: any[] = await generate[tblPrimary](size, cached);
    if (tblSecondary) {
      secondary = values[1];
      values = values[0];
    }
    cached[tblPrimary] = values;

    console.log("writing to:", tblPrimary, values.length);
    await writeTable(db, schema[tblPrimary], values);
    if (tblSecondary) {
      console.log("also writing to:", tblSecondary, secondary?.length);
      await writeTable(db, schema[tblSecondary], secondary);
    }
    const result = await db.select().from(schema[tblPrimary]);
    console.log("finished writing to:", tblPrimary, result?.length);
  }
  console.log(`finished: ${Date.now() - t0}ms`);
}
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
  // await writeTable(db, registry.session, [session]);
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

function readLookups(name: string) {
  //!!! To update lookups per app.yaml / lookups object
  //use https://onlineyamltools.com/convert-yaml-to-json
  const _conf = fs.readFileSync(`./lookups/${name}.json`, {
    encoding: "utf8",
  });
  return JSON.parse(_conf);
}
