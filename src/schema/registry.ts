import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const session: any = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  userId: integer("user_id"),
  impersonatorId: integer("impersonator_id"),
  name: text("name"),
  username: text("username"),
  locale: text("locale"),
  roles: text("roles"),
  type: text("type"),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
  closedAt: integer("closed_at", { mode: "timestamp" }),
});

export const tenant: any = sqliteTable("tenants", {
  id: text("id").primaryKey(),
  contact: text("contact"),
  email: text("email"),
  name: text("name"),
  timezone: text("timezone"),
  locale: text("locale"),
  pages: text("pages"),
  roles: text("roles"),
  numLicenses: integer("num_licenses"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch()*1000)`
  ),
});

export const sessionRelations = relations(session, ({ one }) => ({
  tenant: one(tenant, {
    fields: [session.tenantId],
    references: [tenant.id],
  }),
}));

export const tenantRelations = relations(tenant, ({ many }) => ({
  sessions: many(session),
}));
