import fs from "fs";
import { getConnection } from "./db_client";
import { generate, init } from "./mock";
import * as northern from "./schema/northern";
import * as western from "./schema/western";

const co = "northern";

const clientSchemas = { northern, western },
  schema: any = clientSchemas[co];
seed();
//process.env.TEST_VALUE
async function seed(): Promise<void> {
  let t0 = Date.now();;
  const items: any[] = [
      ["company"],
      ["vendor", 300],
      ["user", 32],
      ["well", 10000],
     ["wellBore", 0, "well"],
       ['project', 0, "well", "user"]
    ],
    db: any = await getConnection(co),
    cached: any = {},
    conf: any = readLookups("lookups"),
    lLookups: any = readLookups("largeLookups");
  init(co, conf, lLookups);

  for await (const [tbl, prm, ch, ch1] of items) {
    //t0 = Date.now();
      if (ch && !cached[ch]) cached[ch] = await db.select().from(schema[ch]);
      if (ch1 && !cached[ch1]) cached[ch1] = await db.select().from(schema[ch1]);
    const values: any[] = generate[tbl](prm, cached);
      const res = await writeTable(db, schema[tbl], values);
     // console.log(tbl, Date.now() - t0, values.length);
      // const result = await db.select().from(schema[tbl]);
    //  console.log(tbl, result?.length);
    }
    console.log(`finished: ${Date.now() - t0}ms`);
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
async function writeAll(db: any, schema: any, values: any) {
  //{tbl: vals[]}
  let tables = Object.keys(values);
  for await (const tbl of tables) {
    await writeTable(db, tbl, values[tbl]);
  }
}
