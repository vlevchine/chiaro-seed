import { faker } from "@faker-js/faker";
import { nanoid } from "nanoid";

const specialRoles = ["power", "partner", "audit"],
  roleSets = [
    "admin",
    "admin,office",
    "office,activity",
    "activity,field",
    "office,activity,field",
    "field",
  ];

let co: string, conf: any, lLookups: any;
export const generate: any = {
    vendor: getVendors,
    company: getCompanies,
    user: getUsers,
    well: getWells,
    wellBore: getWellbores,
    project: getProjects,
  },
  init = (_co: string, _conf: any, _lLookups: any) => {
    co = _co;
    conf = _conf;
    lLookups = _lLookups;
  };

export function getVendors(num = 0) {
  return Array.from({ length: num }).map(() => ({
    id: nanoid(10),
    name: faker.company.name(),
    type: "muds",
    muds: true,
  }));
}
export function getCompanies() {
  return [
    {
      type: "engineering",
      id: "engineering",
      name: "Engineering Service Co.",
      locale: "en-CA",
      timezone: "America/Winnipeg",
    },
    {
      type: "partner",
      id: "partner",
      name: "My Patner Inc.",
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
  ];
}

export function getUsers(num = 0) {
  const items: any[] = Array.from({ length: num }).map(() => fakeUser());
  items.push(
    {
      name: "Winston Chirchill",
      username: "winston.chirchill",
      email: `winston.chirchill@${co}.io`,
      roles: "auditor",
      affiliationId: "auditor",
    },
    {
      name: "Woodrow Wilson",
      username: "woodrow.wilson",
      email: `woodrow.wilson@${co}.io`,
      roles: "engineering",
      affiliationId: "engineering",
    },
    {
      name: "Franklin Roosevelt",
      username: "franklin.roosevelt",
      email: `franklin.roosevelt@${co}.io`,
      roles: "partner",
      affiliationId: "partner",
    },
    {
      name: "Ronald Reagan",
      username: "ronald.reagan",
      email: `ronald.reagan@${co}.io`,
      roles: "power",
      approvalLevel: 100000000,
    }
  );

  return items;
}

export function fakeUser() {
  const name = faker.person.fullName(), // Rowan Nikolaus
    [firstName, lastName] = name.split(" "),
    username = faker.internet.username({ firstName, lastName }), // 'John.Doe';
    email = `${username}@${co}.io`,
    roleSeed = faker.number.int({ min: 0, max: roleSets.length - 1 }),
    approvalLevel = faker.number.int({
      min: 100000,
      max: 10000000,
      multipleOf: 100000,
    }); // 50; // Kassandra.Haley@northern.com
  let roles = roleSets[roleSeed];
  if (approvalLevel > 1000000 && !roles.split(",").includes("office"))
    roles += ",office";

  return {
    name,
    username,
    email,
    roles,
    approvalLevel,
  };
}

const meridians = ["W4", "W5", "W6"];
export function getWells(num = 0) {
  return Array.from({ length: num }).map((_e, i) => {
    const w = faker.helpers.arrayElement(meridians),
      rg = faker.number.int({ min: 1, max: 30 }),
      twp = faker.number.int({ min: 1, max: 126 }),
      sc = faker.number.int({ min: 1, max: 36 }),
      lsd = faker.number.int({ min: 1, max: 16 }),
      spudDate = faker.date.between({ from: "2010-01-01", to: "2020-01-01" }),
      ground = faker.number.float({ min: 50, max: 240, fractionDigits: 2 }),
      tvd = ground + faker.number.int({ min: 500, max: 1000 }),
      well: any = {
        id: nanoid(10),
        name: faker.commerce.productName(),
        alias: faker.lorem.word(),
        type: (faker.helpers.arrayElement(conf.WellType) as any).id,
        license: faker.airline.recordLocator(),
        licensee: faker.company.name(),
        leaseType: (faker.helpers.arrayElement(conf.LeaseType) as any).id,
        landOwner: (faker.helpers.arrayElement(conf.LandOwner) as any).id,
        trajectory: (faker.helpers.arrayElement(conf.Trajectory) as any).id,
        area: faker.helpers.arrayElement(lLookups.areas),
        field: faker.helpers.arrayElement(lLookups.fields),
        surveyType: (faker.helpers.arrayElement(conf.Survey) as any).id,
        siteAccess: (faker.helpers.arrayElement(conf.SiteAccess) as any).id,
        jurisdiction: (faker.helpers.arrayElement(conf.Jurisdiction) as any).id,
        surface: [[lsd, sc, twp, rg].join("-"), w].join(" "),
        es: "00", //event seq: 0 - for welll, 2... for new wellbores
        bounds: {
          ns: faker.number.int({ min: -300, max: 300 }),
          we: faker.number.int({ min: -500, max: 500 }),
        },
        geo: {
          lat: faker.location.latitude({ max: 58, min: 53, precision: 7 }), // 55.7482933,
          lon: faker.location.longitude({ max: -115, min: -120, precision: 7 }), //- 118.3865941,
        },
        h2s: 0.04,
        spudDate,
        ground,
        kb: faker.number.float({
          min: 1,
          max: 10,
          fractionDigits: 1,
        }),
        tvd,
        md: tvd + faker.number.int({ min: 0, max: 100 }),
        directions:
          "Take a long way home... then take left on HWY72, cross the bridge. Follow the road for 2km. You should find it near the river.",
      };
    well.formations = Array.from({
      length: faker.number.int({ min: 2, max: 5 }),
    }).map((_e, i) => {
      return {
        id: "_" + i,
        name: faker.helpers.arrayElement(lLookups.formations),
        top: 570 + i * 200,
        bottom: 650 + i * 200,
        porosity: faker.number.float({
          min: 0.1,
          max: 0.8,
          fractionDigits: 2,
        }),
        lithology: (faker.helpers.arrayElement(conf.Lithology) as any).id,
      };
    });

    return well;
  });
}

function getWellbores(num = 0, cache: any) {
  const wells: any[] = cache.well,
    bores: any[] = wells.map((well: any) =>
      Array.from({
        length: faker.number.int({ min: 1, max: 4 }),
      }).map((_e, i) => {
        const es = i ? `0${i + 1}` : "00";
        return {
          id: [well.id, es].join("-"),
          name: ["Whole", es, well.name].join("-"),
          wellId: well.id,
          es,
          location: "123",
          trajectory: (faker.helpers.arrayElement(conf.Trajectory) as any).id,
          depth: faker.number.float({
            min: 800,
            max: 1440,
            fractionDigits: 2,
          }),
          active: faker.datatype.boolean({ probability: 0.7 }),
        };
      })
    );

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
function getProjects(n = 0, cache: any) {
  const wells: any[] = cache.well,
    users = cache.user.filter((u: any) => {
      const roles = u.roles.split(","),
        allow = roles.includes("office") || roles.includes("power");
      return allow;
    }),
    userSpec = { min: 0, max: users.length - 1 };

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
          createdBy: users[faker.number.int(userSpec)].id,
        };

      return proj;
    });
  }, []);

  return projects.flat();
}
