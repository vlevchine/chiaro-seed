import { faker } from "@faker-js/faker";
import { nanoid } from "nanoid";
//import { nanoid } from "https://cdn.jsdelivr.net/npm/nanoid/nanoid.js";
import { hashPassword } from "./helpers";
import { getOperators } from "drizzle-orm";

//let nanoid: any;
export const initMocks = async () => {
  // const module = await import("nanoid");
  // nanoid = module.nanoid;
};

const specialRoles = ["power", "partner", "audit"],
  roleSets = [
    "admin",
    "admin,office",
    "office,activity",
    "activity,field",
    "office,activity,field",
    "field",
  ],
  from: (arr: any[]) => any = (arr: any[]) =>
    faker.helpers.arrayElement(arr as any);

let co: string, conf: any, lLookups: any;
export const generate: any = {
    vendor: getVendors,
    company: getCompanies,
    user: getUsers,
    well: getWells,
    wellbore: getWellbores,
    project: getProjects,
  },
  init = (_co: string, _conf: any, _lLookups: any) => {
    co = _co;
    conf = _conf;
    lLookups = _lLookups;
  };

export async function getVendors(num = 0) {
  return Promise.resolve(
    Array.from({ length: num }).map(() => ({
      id: nanoid(10),
      name: faker.company.name(),
      type: "muds",
      muds: true,
    }))
  );
}

export async function getUsers(num = 0) {
  const items = [
      {
        id: "winston",
        name: "Winston Chirchill",
        username: "winston.chirchill",
        email: `winston.chirchill@${co}.io`,
        roles: "wellMng,activity",
      },
      {
        id: "woodrow",
        name: "Woodrow Wilson",
        username: "woodrow.wilson",
        email: `woodrow.wilson@${co}.io`,
        roles: "engineering",
        affiliationId: "eng_united",
      },
      {
        id: "franklin",
        name: "Franklin Roosevelt",
        username: "franklin.roosevelt",
        email: `franklin.roosevelt@${co}.io`,
        roles: "partner",
        affiliationId: "partner1",
      },
      {
        id: "ronald",
        name: "Ronald Reagan",
        username: "ronald.reagan",
        email: `ronald.reagan@${co}.io`,
        roles: "power",
        approvalLevel: 100000000,
      },
      ...Array.from({ length: num }).map((e: any, i: number) => fakeUser()),
    ],
    psw = await Promise.all(
      Array.from({ length: items.length }).map((e: any) => hashPassword("4321"))
    );
  items.forEach((e: any, i: number) => {
    e.password = psw[i];
  });

  return items;
}

function fakeUser() {
  const name = faker.person.fullName(), // Rowan Nikolaus
    [firstName, lastName] = name.split(" "),
    username = faker.internet.username({ firstName, lastName }), // 'John.Doe';
    email = `${username}@${co}.io`,
    roleSeed = faker.number.int({ min: 0, max: roleSets.length - 1 }),
    approvalLevel = faker.number.int({
      min: 100000,
      max: 10000000,
      multipleOf: 100000,
    });
  let roles = roleSets[roleSeed];
  if (approvalLevel > 1000000 && !roles.split(",").includes("office"))
    roles += ",office";

  return {
    id: nanoid(10),
    name,
    username,
    email,
    roles,
    approvalLevel,
  };
}

const meridians = ["W4", "W5", "W6"],
  partners = ["partner1", "partner2"];
export async function getWells(num = 0) {
  const _partners: any[] = [],
    names = Array.from(
      new Set(Array.from({ length: num * 2 }).map(() => faker.location.city()))
    ),
    wells = Array.from({ length: num }).map((_e, i) => {
      const w = from(meridians),
        rg = faker.number.int({ min: 1, max: 30 }),
        twp = faker.number.int({ min: 1, max: 126 }),
        sc = faker.number.int({ min: 1, max: 36 }),
        lsd = faker.number.int({ min: 1, max: 16 }),
        surface: any = [[lsd, sc, twp, rg].join("-"), w].join(" "),
        spudDate = faker.date.between({ from: "2010-01-01", to: "2020-01-01" }),
        ground = faker.number.float({ min: 50, max: 240, fractionDigits: 2 }),
        wellType = from(conf.WellType),
        kb = faker.number.float({
          min: 4,
          max: 20,
          fractionDigits: 1,
        }),
        well: any = {
          id: nanoid(10),
          name: names[i],
          alias: faker.lorem.word(),
          type: wellType.id,
          jurisdiction: from(from(conf.Jurisdiction).items).id,
          hierarchy: from(from(hier).items).id,
          ownerId: getOwner(),
          operatorId: getOperator(),
          status: from(conf.Status).id,
          subType: wellType.items ? from(wellType.items).id : undefined,
          surface: "200/" + surface,
          uwi: ["200", surface.replaceAll(" ", ""), "00"].join("/"),
          h2s: faker.datatype.boolean({ probability: 0.7 }),
          license: faker.airline.recordLocator(),
          leaseType: from(conf.LeaseType).id,
          landOwner: from(conf.LandOwner).id,
          class: from(conf.LaheeClass).id,
          confidentiality: from(conf.Confidentiality).id,
          businessInterest: from(conf.BusinessInterest).id,
          businessIntention: from(conf.BusinessIntention).id,
          outcome: from(conf.Outcome).id,
          role: from(conf.Role).id,
          playType: from(conf.PlayType).id,
          wellStructure: from(conf.WellStructure).id,
          fluidDirection: from(conf.FluidDirection).id,
          siteAccess: from(conf.SiteAccess).id,
          directions:
            "Take a long way home... then take left on HWY72, cross the bridge. Follow the road for 2km. You should find it near the river.",
          ground,
          kb,
          cf: kb - 1,
          thf: kb - 3,
          lat: faker.location.latitude({ max: 58, min: 53, precision: 7 }), // 55.7482933,
          lon: faker.location.longitude({ max: -115, min: -120, precision: 7 }), //- 118.3865941,
          utm: {
            zone: `Zone ${faker.number.int({ min: 0, max: 30 })}`,
            ns: faker.number.int({ min: -300, max: 300 }),
            we: faker.number.int({ min: -500, max: 500 }),
          },
          spudDate,
        };
      if (Math.random() > 0.05)
        Array.from({ length: faker.number.int({ min: 1, max: 2 }) }).forEach(
          (e, i) => {
            _partners.push({
              wellId: well.id,
              companyId: partners[i],
              share: 0.3,
            });
          }
        );

      return well;
    });

  return [wells, _partners];
}

export async function getWellbores(num = 0, cache: any) {
  const wells: any[] = cache.well,
    bores: any[] = wells.map((well: any) => {
      const w_uwi = well.uwi.split("/");
      const tvd = faker.number.float({
          min: 800,
          max: 1440,
          fractionDigits: 2,
        }),
        kopTVD = faker.number.float({
          min: 50,
          max: 140,
          fractionDigits: 2,
        });
      return Array.from({
        length: faker.number.int({ min: 1, max: 4 }),
      }).map((_e, i) => {
        const es = i ? `0${i + 1}` : "00",
          id = [well.id, es].join("_");
        return {
          id,
          name: ["Whole", es].join("-"),
          wellId: well.id,
          parentId: i ? well.id + "_00" : undefined,
          uwi: [w_uwi[0], w_uwi[1], es].join("/"),
          tvd,
          md: tvd + faker.number.int({ min: 0, max: 50 }),
          kopTVD,
          kopMD: kopTVD + faker.number.int({ min: 0, max: 10 }),
          trajectory: (faker.helpers.arrayElement(conf.Trajectory) as any).id,
          reason: from(conf.DeviationReason).id,
        };
      });
    });

  return bores.flat();
}

const projSets = [
  [0, 1, 2],
  [0, 1, 2, 3],
  [2, 3],
  [2, 3, 4],
  [0, 2],
  [1, 2, 4],
];

const projectTypes = [
    "afe",
    "construction",
    "drilling",
    "completion",
    "suspension",
    "abandonment",
  ],
  nonActive = ["suspension", "abandonment"],
  timed: any = {
    afe: [-12],
    construction: [-10],
    drilling: [0],
    completion: [2],
    suspension: [60],
    abandonment: [72],
  },
  dateFunc = {
    past: faker.date.past,
    future: faker.date.future,
  };
async function getProjects(n = 0, cache: any) {
  const wells: any[] = cache.well,
    users = cache.user.filter((u: any) => {
      const roles = u.roles.split(","),
        allow = roles.includes("wellMng") || roles.includes("power");
      return allow;
    }),
    _proj_bores: any[] = [];

  const projects = wells.map((w, i) => {
      let spud = w.spudDate,
        num = faker.number.int({ min: 0, max: projSets.length - 1 }),
        set = projSets[num],
        year = spud.getFullYear(),
        month = spud.getMonth(),
        day = spud.getDate();

      return set.map((e: any) => {
        const type = projectTypes[e],
          [months]: [number] = timed[type],
          start = new Date(year, month + months, day, 12),
          end = faker.date.soon({ days: 90, refDate: start }),
          proj = {
            id: nanoid(10),
            wellId: w.id,
            type,
            start,
            end,
            createdBy: from(users).id,
          };
        if (type === "drilling")
          _proj_bores.push({ wellboreId: w.id + "_00", projectId: proj.id });
        return proj;
      });
    }, []),
    _projects = projects.flat();

  return [_projects, _proj_bores];
}

export function getTenants(ids: string[]) {
  const items: any[] = ids.map((id: string) => {
    return {
      id,
      email: `contact@${id}.com`,
      contact: faker.person.fullName(),
      name: `${id[0].toUpperCase()}${id.slice(
        1
      )} ${faker.company.buzzNoun()} Inc.`,
      locale: "en-CA",
      timezone: "America/Toronto",
      numLicenses: faker.number.int({ min: 2, max: 10 }),
      // pages: text("pages"),
      // roles: text("roles"),
    };
  });
  return items;
}

export function testSession(tenant: any, user: any) {
  // return {
  //   id: nanoid(),
  //   tenantId: tenant.id,
  //   userId: user.id,
  //   impersonatorId: 0,
  //   name: user.name,
  //   username: user.username,
  //   locale: tenant.locale,
  //   roles: user.roles,
  //   type: "none",
  //   expiresAt: new Date(Date.now() + 36000000),
  // };
  return {
    id: "P5SbsgtRNK5bQXdgm8ONp1",
    tenantId: "northern",
    userId: 4,
    impersonatorId: 0,
    name: "Ronald Reagan",
    username: "ronald.reagan",
    locale: "en-CA",
    roles: "power",
    expiresAt: new Date(Date.now() + 36000000), //2024-12-28T18:15:01.267Z
  };
}

const hier = [
  {
    id: "tier1",
    name: "Tiier 1",
    items: [
      { name: "Group 1", id: "tier1.group1" },
      { name: "Group 2", id: "tier1.group2" },
      { name: "Group 3", id: "tier1.group3" },
    ],
  },
  {
    id: "tier2",
    name: "Tiier 2",
    items: [
      { name: "Group 1", id: "tier2.group1" },
      { name: "Group 2", id: "tier2.group2" },
      { name: "Group 3", id: "tier2.group3" },
      { name: "Group 4", id: "tier2.group4" },
    ],
  },
];

const companies = [
    {
      id: "eng_serv",
      name: "Engineering Service Co.",
      engineering: true,
      locale: "en-CA",
      timezone: "America/Winnipeg",
    },
    {
      id: "eng_united",
      name: "United Engineering Corp.",
      engineering: true,
      locale: "en-US",
      timezone: "America/Winnipeg",
    },
    {
      id: "global",
      name: "Global Oil and Gas Corp.",
      engineering: true,
      ogc: true,
      locale: "en-US",
      timezone: "America/Winnipeg",
    },
    {
      partner: true,
      id: "partner1",
      name: "Financial Hub Inc.",
      locale: "en-US",
      timezone: "America/Toronto",
    },
    {
      partner: true,
      id: "partner2",
      name: "Venture Club Inc.",
      locale: "en-US",
      timezone: "America/Toronto",
    },
    {
      type: "auditor",
      id: "auditor",
      name: "Auditing Authrity Co.",
      locale: "en-GB",
      timezone: "Europe/London",
    },
  ],
  eng = ["eng_united", "eng_serv", "global"];

export async function getCompanies() {
  return companies;
}
function getOperator() {
  return Math.random() > 0.5 ? from(eng) : undefined;
}
function getOwner() {
  return;
}
