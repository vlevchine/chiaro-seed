import { eq } from "drizzle-orm";
import { getConnection } from "./db_client";
import * as northern from "./schema/northern";
import * as registry from "./schema/registry";
import * as western from "./schema/western";

const co: string = "northern";
//const co: string = "northern";
//const co: string = "registry";

const clientSchemas: any = { registry, northern, western },
  schema: any = clientSchemas[co];
test();

async function test() {
  const id = "RaKeJd69v1";
  const db: any = await getConnection(co),
    schema = clientSchemas[co],
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
// // const res = await db.query.user.findMany({with: {affiliation: true}});
// // console.log(res.filter((u: any) => u.affiliation))
