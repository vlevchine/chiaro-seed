import { relations, sql } from "drizzle-orm";
import {
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const company: any = sqliteTable("companies", {
  id: text("id").primaryKey(),
  name: text("name"),
  locale: text("locale"), //.notNull(),
  timezone: text("timezone"),
  ogc: integer("ogc", { mode: "boolean" }),
  engineering: integer("engineering", { mode: "boolean" }),
  type: text("type"), //"engineering" | "partner" | "auditor"
  auditor: integer("auditor", { mode: "boolean" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

export const vendor: any = sqliteTable("vendors", {
  id: text("id").primaryKey(),
  name: text("name"),
  type: text("type"),
  muds: integer("muds", { mode: "boolean" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

export const user: any = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  username: text("username").unique(),
  password: text("password").unique(),
  email: text("email").unique(),
  roles: text("roles").notNull(),
  approvalLevel: integer("approval_level", { mode: "number" }).default(0),
  affiliationId: text("affiliation_id").references(() => company.id, {
    onDelete: "cascade",
  }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).default(
    sql`(unixepoch() * 1000)`
  ),
  deactivated: integer("deactivated_at", { mode: "timestamp" }),
});

export const well = sqliteTable("wells", {
  id: text("id").primaryKey(),
  name: text("name").notNull(), //.unique(),
  alias: text("alias"),
  uwi: text("uwi"),
  type: text("type").notNull(),
  status: text("status"),
  //general location depths
  subType: text("subtype"),
  hierarchy: text("hierarchy"),
  spudDate: integer("spud_date", { mode: "timestamp" }),
  jurisdiction: text("jurisdiction"),
  ownerId: text("owner_id").references(() => company.id),
  operatorId: text("operator_id").references(() => company.id),
  h2s: integer("h2s", { mode: "boolean" }),
  wellStructure: text("well_structure"),
  fluidDirection: text("fluid_direction"),

  //business
  license: text("license"), //.unique(),
  licenseType: text("license_type"),
  landOwner: text("land_owner"),
  confidentiality: text("confidentiality"),
  class: text("lahee_class"),
  businessInterest: text("business_interest"),
  businessIntention: text("business_intention"),
  outcome: text("outcome"),
  role: text("role"),
  playType: text("play_type"),

  //location and reference points
  surface: text("surface"),
  utm: text("utm", { mode: "json" }).$type<Bounds>(),
  lat: real("lat"),
  lon: real("lon"),
  directions: text("directions"),
  siteAccess: text("site_access"),
  ground: real("ground"),
  kb: real("kb"),
  cf: real("cf"),
  thf: real("thf"),
});

export const companyToWell = sqliteTable(
  "companies_to_wells",
  {
    companyId: text("company_id")
      .notNull()
      .references(() => company.id),
    wellId: text("well_id")
      .notNull()
      .references(() => well.id),
    share: real("share"),
  },
  (t: any) => ({
    pk: primaryKey({ columns: [t.companyId, t.wellId] }),
  })
);

export const wellbore: any = sqliteTable("wellbores", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  uwi: text("uwi"),
  wellId: text("well_id")
    .notNull()
    .references(() => well.id, { onDelete: "cascade" }),
  parentId: text("parent_id").references(() => wellbore.id, {
    onDelete: "cascade",
  }),
  trajectory: text("trajectory"),
  reason: text("reason"),
  kopTVD: real("kop_tvd"),
  kopMD: real("kop_md"),
  tvd: real("tvd"),
  md: real("md"),
});

export const project = sqliteTable(
  "projects",
  {
    id: text("id").primaryKey(),
    type: text("name").notNull(),
    start: integer("start", { mode: "timestamp" }), //text("start").default(sql`(CURRENT_DATE)`),
    end: integer("end", { mode: "timestamp" }),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    wellId: text("well_id")
      .notNull()
      .references(() => well.id, { onDelete: "cascade" }),
  }
  // (table) => ({
  //   startIndex: index("start_index").on(table.start),
  //   endIndex: index("end_index").on(table.end),
  //   timeUniqueConstraint: unique("time_unique_constraint").on(
  //     table.start,
  //     table.createdBy
  //   ),
  // })
);

export const projectToWellbore = sqliteTable(
  "projects_to_wellbores",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => project.id),
    wellboreId: text("wellbore_id")
      .notNull()
      .references(() => wellbore.id),
  },
  (t: any) => ({
    pk: primaryKey({ columns: [t.projectId, t.wellboreId] }),
  })
);

//Relations
export const companyRelations = relations(company, ({ one, many }) => ({
  ownWells: many(well, { relationName: "owner" }),
  operatedWells: many(well, { relationName: "operator" }),
  //servicWells: many(well),
  partners: many(companyToWell),
}));

export const userRelations = relations(user, ({ one }) => ({
  affiliation: one(company, {
    fields: [user.affiliationId],
    references: [company.id],
  }),
}));

export const wellRelations = relations(well, ({ one, many }) => ({
  owner: one(company, {
    fields: [well.ownerId],
    references: [company.id],
    relationName: "owner",
  }),
  operator: one(company, {
    fields: [well.operatorId],
    references: [company.id],
    relationName: "operator",
  }),
  wellbores: many(wellbore),
  projects: many(project),
  stakeHolders: many(companyToWell),
}));
export const wellboreRelations = relations(wellbore, ({ one, many }) => ({
  well: one(well, {
    fields: [wellbore.wellId],
    references: [well.id],
  }),
  parent: one(wellbore, {
    fields: [wellbore.parentId],
    references: [wellbore.id],
    relationName: "wellbores",
  }),
  childBores: many(wellbore, { relationName: "wellbores" }),
}));
export const projectRelations = relations(project, ({ one }) => ({
  createdBy: one(user, {
    fields: [project.createdBy],
    references: [user.id],
  }),
  well: one(well, {
    fields: [project.wellId],
    references: [well.id],
  }),
}));

export const companyToWellRelations = relations(companyToWell, ({ one }) => ({
  company: one(company, {
    fields: [companyToWell.companyId],
    references: [company.id],
  }),
  well: one(well, {
    fields: [companyToWell.wellId],
    references: [well.id],
  }),
}));

//Types
type Bounds = {
  zone: string;
  ns: number;
  we: number;
};
type Geo = {
  lat: number;
  lon: number;
};
type Formation = {
  id: string;
  name: string;
  top: number;
  bottom: number;
  porosity: number;
  lithology: string;
};

// well0 = sqliteTable("wells", {
//     id: text("id").primaryKey(),
//     name: text("name"), //.unique(),
//     alias: text("alias"), //.unique(),
//     type: text("type").notNull(),
//     active: integer("active", { mode: "boolean" }),
//     uwi: text("uwi"),
//     license: text("license"), //.unique(),
//     licensee: text("licensee"),
//     licenseType: text("license_type"),
//     landOwner: text("land_owner"),
//     jurisdiction: text("jurisdiction"),
//     trajectory: text("trajectory"),
//     area: text("area"),
//     field: text("field"),
//     surveyType: text("survey_type"),
//     siteAccess: text("site_access"),
//     geo: text("geo", { mode: "json" }).$type<Geo>(),
//     surface: text("surface"),
//     ground: real("ground"),
//     bounds: text("bounds", { mode: "json" }).$type<Bounds>(),
//     kb: real("kb"),
//     h2s: real("h2s"),
//     spudDate: integer("spud_date", { mode: "timestamp" }),
//     tvd: real("tvd"),
//     md: real("md"),
//     formations: text("formations", { mode: "json" }).$type<Formation[]>(),
//     directions: text("directions"),
//   }),
//   wellBore0 = sqliteTable("wellbores", {
//     id: text("id").primaryKey(),
//     wellId: text("well_id")
//       .notNull()
//       .references(() => well.id, { onDelete: "cascade" }),
//     name: text("name").notNull(),
//     uwi: text("uwi"),
//     trajectory: text("trajectory"),
//     location: text("location"),
//     depth: real("depth"),
//     active: integer("active", { mode: "boolean" }),
//   });
