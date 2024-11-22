
import { faker } from "@faker-js/faker";

const specialRoles = ['power','partner', 'audit'],
  roleSets = ['power', 'admin', 'admin,well', 'well,activity', 'activity,field', 'field', 'partner', 'audit']; //partner, audit
export function fakeUser(co: string) {
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
  if (approvalLevel > 1000000 && !specialRoles.includes(roles)) {
      if (!roles.split(',').includes('well')) roles += ',well'
  }
  
  return {
    name,
    username,
    email,
    roles,
    approvalLevel,
  };
}
export function getUsers(co: string, num = 10) {
  return Array.from({length: num}).map(() => fakeUser(co))
}

//   id: integer("id").primaryKey({ autoIncrement: true }),
//   name: text("name").notNull(),
//   username: text("username").unique(),
//   email: text("email").unique(),
//   roles: text("roles").notNull(),
//   approvalLevel: integer("approval_level", { mode: "number" }).default(0),
//   affiliation: text("affiliation"),
//   createdAt: integer("created_at", { mode: "timestamp" }).default(
//     sql`(unixepoch())`
//   ),
//   deactivatedAt: integer("deactivated_at", { mode: "timestamp" }),