
import { getUsers, getCompanies, getWells } from "./mock";
import * as northern from "./schema/northern";
import * as western from "./schema/western";
import { getConnection } from './db_client';

const co = 'northern';

const clientSchemas = { northern, western },
  schema = clientSchemas[co];
seed();
//process.env.TEST_VALUE
async function seed(): Promise<void> {
    const t0 = Date.now();

    const companies = getCompanies(200),
        users = getUsers(co, 32),
        [wells, wellbores] = getWells(10000)

    console.log('generating data:', Date.now() - t0);

    //const db = getConnection("common");
}

async function writeTable(db: any, tbl: any, values = []) {
    return db.insert(tbl).values();
}

async function writeAll(db: any, schema: any, values: any) {//{tbl: vals[]}
    let tables = Object.keys(values);
    for (let tbl in tables) {
        await  writeTable(db, tbl, values[tbl])
    }
}