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
  datum: text("datum"), //Lookup: kb, ground
  ogc: integer("ogc", { mode: "boolean" }),
  engineering: integer("engineering", { mode: "boolean" }),
  partner: integer("partner", { mode: "boolean" }),
  auditor: integer("auditor", { mode: "boolean" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
  deactivated: integer("deactivated_at", { mode: "timestamp" }),
});

export const vendor: any = sqliteTable("vendors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code"),
  type: text("type"), //multiple types joined - 'muds;bits;'
  pending: integer("pending", { mode: "boolean" }),
  deactivated: integer("deactivated_at", { mode: "timestamp" }),
});

export const lookup: any = sqliteTable("lookups", {
  id: text("id").primaryKey(),
  name: text("name"),
  code: text("code"),
  type: text("type"),
  pending: integer("pending", { mode: "boolean" }),
  deactivated: integer("deactivated_at", { mode: "timestamp" }),
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

export const userGroup: any = sqliteTable("user-groups", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
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
  ////user groups
  //general
  subType: text("subtype"),
  hierarchy: text("hierarchy"),
  spudDate: integer("spud_date", { mode: "timestamp" }),
  h2s: integer("h2s", { mode: "boolean" }),
  wellStructure: text("well_structure"),
  fluidDirection: text("fluid_direction"),
  role: text("role"),
  playType: text("play_type"),

  //legal
  jurisdiction: text("jurisdiction"),
  ownerId: text("owner_id").references(() => company.id),
  operatorId: text("operator_id").references(() => company.id),
  license: text("license"), //.unique(),
  leaseType: text("lease_type"),
  landOwner: text("land_owner"),
  confidentiality: text("confidentiality"),

  //business
  class: text("lahee_class"),
  businessInterest: text("business_interest"),
  businessIntention: text("business_intention"),
  outcome: text("outcome"),
  /////partners

  //location
  surface: text("surface"),
  utm: text("utm", { mode: "json" }).$type<Bounds>(),
  lat: real("lat"),
  lon: real("lon"),
  directions: text("directions"),
  siteAccess: text("site_access"),
  //elevations
  ground: real("ground"),
  kb: real("kb"),
  cf: real("cf"),
  thf: real("thf"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

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
  //estimated depths
  kopTVD: real("kop_tvd"),
  kopMD: real("kop_md"),
  tvd: real("tvd"),
  md: real("md"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

export const project = sqliteTable("projects", {
  id: text("id").primaryKey(),
  type: text("name").notNull(),
  estStart: integer("est_start", { mode: "timestamp" }),
  estEnd: integer("est_end", { mode: "timestamp" }),
  start: integer("start", { mode: "timestamp" }), //text("start").default(sql`(CURRENT_DATE)`),
  end: integer("end", { mode: "timestamp" }),
  wellId: text("well_id")
    .notNull()
    .references(() => well.id, { onDelete: "cascade" }),
  aboveEstWarning: real("above_est_warn"),
  //Estimates: list of - day, depth, cost
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

//Join tables
export const userToUserGroup: any = sqliteTable(
  "user-to-groups",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    groupId: text("group_id")
      .notNull()
      .references(() => userGroup.id),
  },
  (t: any) => ({
    pk: primaryKey({ columns: [t.userId, t.groupId] }),
  })
);
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
export const wellToUserGroup: any = sqliteTable(
  "well-to-groups",
  {
    wellId: text("well_id")
      .notNull()
      .references(() => well.id),
    groupId: text("group_id")
      .notNull()
      .references(() => userGroup.id),
  },
  (t: any) => ({
    pk: primaryKey({ columns: [t.wellId, t.groupId] }),
  })
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
export const projectToUser = sqliteTable(
  "projects_to_users",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => project.id),
    userId: text("manager_id")
      .notNull()
      .references(() => user.id),
    role: text("role"), //'manager', 'fieldManager'
  },
  (t: any) => ({
    pk: primaryKey({ columns: [t.projectId, t.userId] }),
  })
);

//Join relations
export const userToUserGroupRelations = relations(
  userToUserGroup,
  ({ one }) => ({
    user: one(user, {
      fields: [userToUserGroup.userId],
      references: [user.id],
    }),
    group: one(userGroup, {
      fields: [userToUserGroup.groupId],
      references: [userGroup.id],
    }),
  })
);
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
export const wellToUserGroupRelations = relations(
  wellToUserGroup,
  ({ one }) => ({
    well: one(well, {
      fields: [wellToUserGroup.wellId],
      references: [well.id],
    }),
    group: one(userGroup, {
      fields: [wellToUserGroup.groupId],
      references: [userGroup.id],
    }),
  })
);
export const projectToWellboreRelations = relations(
  projectToWellbore,
  ({ one }) => ({
    project: one(project, {
      fields: [projectToWellbore.projectId],
      references: [project.id],
    }),
    user: one(wellbore, {
      fields: [projectToWellbore.wellboreId],
      references: [wellbore.id],
    }),
  })
);
export const projectToUserRelations = relations(projectToUser, ({ one }) => ({
  project: one(project, {
    fields: [projectToUser.projectId],
    references: [project.id],
  }),
  user: one(user, {
    fields: [projectToUser.userId],
    references: [user.id],
  }),
}));

//Relations
export const userRelations = relations(user, ({ one, many }) => ({
  affiliation: one(company, {
    fields: [user.affiliationId],
    references: [company.id],
  }),
  groups: many(userToUserGroup),
  projects: many(projectToUser),
}));
export const userGroupRelations = relations(userGroup, ({ many }) => ({
  users: many(userToUserGroup),
  wells: many(wellToUserGroup),
}));
export const companyRelations = relations(company, ({ many }) => ({
  ownWells: many(well, { relationName: "owner" }),
  operatedWells: many(well, { relationName: "operator" }),
  stakeInWells: many(companyToWell),
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
  partners: many(companyToWell),
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
  projects: many(projectToWellbore),
}));
export const projectRelations = relations(project, ({ one, many }) => ({
  created: one(user, {
    fields: [project.createdBy],
    references: [user.id],
  }),
  well: one(well, {
    fields: [project.wellId],
    references: [well.id],
  }),
  players: many(projectToUser),
  wellbores: many(projectToWellbore),
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

