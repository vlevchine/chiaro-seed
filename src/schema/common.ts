import { sql, relations } from "drizzle-orm";
import {
  integer,
  real,
  sqliteTable,
  text,
  primaryKey,
} from "drizzle-orm/sqlite-core";

export const company: any = sqliteTable("companies", {
  id: text("id").primaryKey(),
  name: text("name"),
  locale: text("locale"), //.notNull(),
  timezone: text("timezone"),
  ogc: integer("ogc", { mode: "boolean" }),
  engineering: integer("engineering", { mode: "boolean" }),
  type: text("type"), //"engineering" | "partner" | "auditor"
  // partner: integer("partner", { mode: "boolean" }),
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
  id: integer("id").primaryKey({ autoIncrement: true }),
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

//!!! - removced unique, as it's hard to auto-gen those
export const well = sqliteTable("wells", {
    id: text("id").primaryKey(),
    name: text("name").notNull(), //.unique(),
    alias: text("alias"),
    uwi: text("uwi"),
    type: text("type").notNull(),
    subType: text("subtype"),
    status: text("status"),
    hierarchy: text("hierarchy"),
    license: text("license"), //.unique(),
    class: text("licensee"),
    licenseType: text("license_type"),
    landOwner: text("land_owner"),
    jurisdiction: text("jurisdiction"),
    ownerId: integer("owner_id").references(() => company.id),
    operatorId: integer("operator_id").references(() => company.id),
    confidentiality: text("confidentiality"),
    businessInterest: text("business_interest"),
    businessIntention: text("business_intention"),
    outcome: text("outcome"),
    role: text("role"),
    playType: text("play_type"),
    h2s: integer("h2s", { mode: "boolean" }),
    directions: text("directions"),
    siteAccess: text("site_access"),
    wellStructure: text("well_structure"),
    fluidDirection: text("fluid_direction"),
    ground: real("ground"),
    kb: real("kb"),
    cf: real("kb"),
    thf: real("kb"),
    surface: text("surface"),
    utm: text("bounds", { mode: "json" }).$type<Bounds>(),
    lat: real("lat"),
    lon: real("lon"),
  }),
  wellbore = sqliteTable("wellbores", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    seq: text("seq"),
    parentId: text("parent_id").references(() => wellbore.id, {
      onDelete: "cascade",
    }),
    trajectory: text("trajectory"),
    reason: text("reason"),
    spudDate: integer("spud_date", { mode: "timestamp" }),
    kopTVD: real("kop_tvd"),
    kopMD: real("kop_md"),
    totalTVD: real("total_tvd"),
    totalMD: real("total_md"),
  }),
  companyToWell = sqliteTable(
    "companies_to_wells",
    {
      companyId: integer("company_id")
        .notNull()
        .references(() => company.id),
      wellId: integer("well_id")
        .notNull()
        .references(() => well.id),
      share: real("share"),
    },
    (t: any) => ({
      pk: primaryKey({ columns: [t.companyId, t.wellId] }),
    })
  ),
  well0 = sqliteTable("wells", {
    id: text("id").primaryKey(),
    name: text("name"), //.unique(),
    alias: text("alias"), //.unique(),
    type: text("type").notNull(),
    active: integer("active", { mode: "boolean" }),
    uwi: text("uwi"),
    license: text("license"), //.unique(),
    licensee: text("licensee"),
    licenseType: text("license_type"),
    landOwner: text("land_owner"),
    jurisdiction: text("jurisdiction"),
    trajectory: text("trajectory"),
    area: text("area"),
    field: text("field"),
    surveyType: text("survey_type"),
    siteAccess: text("site_access"),
    geo: text("geo", { mode: "json" }).$type<Geo>(),
    surface: text("surface"),
    ground: real("ground"),
    bounds: text("bounds", { mode: "json" }).$type<Bounds>(),
    kb: real("kb"),
    h2s: real("h2s"),
    spudDate: integer("spud_date", { mode: "timestamp" }),
    tvd: real("tvd"),
    md: real("md"),
    formations: text("formations", { mode: "json" }).$type<Formation[]>(),
    directions: text("directions"),
  }),
  wellBore0 = sqliteTable("wellbores", {
    id: text("id").primaryKey(),
    wellId: text("well_id")
      .notNull()
      .references(() => well.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    uwi: text("uwi"),
    trajectory: text("trajectory"),
    location: text("location"),
    depth: real("depth"),
    active: integer("active", { mode: "boolean" }),
  });

export const project = sqliteTable(
  "projects",
  {
    id: text("id").primaryKey(),
    type: text("name").notNull(),
    start: integer("start", { mode: "timestamp" }), //text("start").default(sql`(CURRENT_DATE)`),
    end: integer("end", { mode: "timestamp" }),
    createdBy: integer("createdby")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    wellId: integer("asset_id")
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

export const userRelations = relations(user, ({ one }) => ({
  affiliation: one(company, {
    fields: [user.affiliationId],
    references: [company.id],
  }),
}));

export const companyRelations = relations(company, ({ one, many }) => ({
  ownWells: many(well),
  servicWells: many(well),
  companyToWell: many(companyToWell),
}));
export const wellRelations = relations(well, ({ one, many }) => ({
  owner: one(company),
  operator: one(company),
  wellbores: many(wellbore),
  projects: many(project),
  companyToWell: many(companyToWell),
}));

export const companyToWellRelations = relations(companyToWell, ({ one }) => ({
  company: one(company, {
    fields: [companyToWell.companyId],
    references: [well.id],
  }),
  user: one(well, {
    fields: [companyToWell.wellId],
    references: [company.id],
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
