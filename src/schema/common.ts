import { sql, relations } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const company: any = sqliteTable("companies", {
  id: text("id").primaryKey(),
  name: text("name"),
  locale: text("locale"), //.notNull(),
  timezone: text("timezone"),
  type: text("type"), //"engineering" | "partner" | "auditor"
  // engineering: integer("engineering", { mode: "boolean" }),
  // partner: integer("partner", { mode: "boolean" }),
  // auditor: integer("auditor", { mode: "boolean" }),
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
  wellBore = sqliteTable("wellbores", {
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

export const wellRelations = relations(well, ({ many }) => ({
  wellbores: many(wellBore),
  projects: many(project)
}))

//Types
type Bounds = {
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


