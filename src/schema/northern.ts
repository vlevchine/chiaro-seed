import { relations, sql } from "drizzle-orm";
import {
  blob,
  index,
  integer,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";
export * from "./common";
import * as common from "./common";

export const project = sqliteTable(
  "projects",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    start: text("start").default(sql`(CURRENT_DATE)`),
    end: text("end"),
    createdBy: integer("createdby")
      .notNull()
      .references(() => common.user.id, { onDelete: "cascade" }),
  },
  (table) => ({
    startIndex: index("start_index").on(table.start),
    endIndex: index("end_index").on(table.end),
    timeUniqueConstraint: unique("time_unique_constraint").on(
      table.start,
      table.createdBy
    ),
  })
);

export const projectRelations = relations(project, ({ one }) => ({
  user: one(common.user, {
    fields: [project.createdBy],
    references: [common.user.id],
  }),
}));
