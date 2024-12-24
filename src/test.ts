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
        wellbores: { with: { parent: { columns: { name: true, id: true } } } },
        projects: {
          with: {
            created: { columns: { name: true } },
            players: { with: { user: { columns: { name: true } } } },
          },
        },
        partners: { with: { company: { columns: { name: true } } } },
        operator: true,
        owner: true,
      },
    });
  //with = ['wellbores.parent:name,id', 'projects.created:name;players.user:name', 'partners.company:name', 'operator', 'owner' ]
  function enhanceResult(spec: any, joinWith: string[]) {
    spec.with = joinWith.reduce((acc: any, e: string) => {
      e.split(';').forEach((tbl: string) => {
        tbl.split('.').forEach((it: string) => {
          const items = it.split(':')
        });
      })
      return acc;
    }, {})   
  }
  
  //console.log("testing", result);

  console.log("wellbores", result.wellbores);
  //out: [..., {id: '9SYOv4ad2V_02', name: 'Whole-02', uwi: '200/15-25-110-8W5/02',..., parent: { name: 'Whole-00', id: '9SYOv4ad2V_00' }}]

  //result.projects.map((e: any) => e.players.forEach((p: any) => console.log(p)))
  //out: projectId: 'UJ9B0qqF1q', userId: 'jimmy', role: 'field', user: { name: 'Jimmy carter' }

  //console.log("created", result.projects.map((e: any) => e.players));
  // console.log(
  //   "parents",
  //   result.wellbores.map((e: any) => e.parent)
  // );
  //out: [ null, { name: 'Whole-00' } ]

  //console.log('partners', result.partners);
  //out: [{ companyId: 'partner1',  wellId: '9SYOv4ad2V',  hare: 0.3, company: { name: 'Financial Hub Inc.' } }]
}
// // const res = await db.query.user.findMany({with: {affiliation: true}});
// // console.log(res.filter((u: any) => u.affiliation))
