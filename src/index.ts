import fs from "fs";
import { getConnection } from "./db_client";
import { generateSessionToken, getIdFromToken } from "./helpers";
import { generate, init, initMocks } from "./mock";
import * as northern from "./schema/northern";
import * as registry from "./schema/registry";
import * as western from "./schema/western";

let co = "northern",
  skip = false; //true false
const clientSchemas: any = { registry, northern, western },
  schema: any = clientSchemas[co];
seedClient();

//process.env.TEST_VALUE
async function seedClient(): Promise<void> {
  await initMocks();
  let t0 = Date.now();
  const items: any[] = [
      { tblPrimary: "company" },
      { tblPrimary: "vendor", size: 300 },
      { tblPrimary: "lookup", size: 500 },
      {
        tblPrimary: "user",
        size: 32,
        tblSecondary: "userGroup",
        tblJoin: "userToUserGroup",
      },
      {
        tblPrimary: "well",
        tblSecondary: "companyToWell",
        tblJoin: "wellToUserGroup",
        size: 10000,
      },
      { tblPrimary: "wellbore" },
      {
        tblPrimary: "project",
        tblSecondary: "projectToWellbore",
        tblJoin: "projectToUser",
      },
    ],
    db: any = await getConnection(co),
    cached: any = {},
    conf: any = readLookups("lookups"),
    lLookups: any = readLookups("largeLookups");
  init(co, conf, lLookups);

  for await (const { tblPrimary, tblSecondary, tblJoin, size } of items) {
    let [values, secondary, joins]: any[] = await generate[tblPrimary](
      size,
      cached
    );
    cached[tblPrimary] = values;
    console.log("writing to:", tblPrimary, values.length);
    if (!skip) await writeTable(db, schema[tblPrimary], values);
    if (tblSecondary) {
      cached[tblSecondary] = secondary;
      console.log("also writing to:", tblSecondary, secondary?.length);
      if (!skip) await writeTable(db, schema[tblSecondary], secondary);
    }
    if (tblJoin) {
      console.log("also writing joins to:", tblJoin, joins?.length);
      if (!skip) await writeTable(db, schema[tblJoin], joins);
    }
    const result = await db.select().from(schema[tblPrimary]);
    console.log("finished writing to:", tblPrimary, result?.length);
  }
  console.log(`finished: ${Date.now() - t0}ms`);
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
