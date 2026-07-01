import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Daily hydration goal for each user.
 * Stores the user's target ml intake per day.
 */
export const dailyGoals = mysqlTable("daily_goals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  goalMl: int("goalMl").notNull().default(2000),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DailyGoal = typeof dailyGoals.$inferSelect;
export type InsertDailyGoal = typeof dailyGoals.$inferInsert;

/**
 * Hydration intake log for tracking daily consumption.
 * Records each drink intake with type, amount, and timestamp.
 */
export const hydrationLogs = mysqlTable("hydration_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  drinkType: varchar("drinkType", { length: 50 }).notNull(), // "Água", "Café", "Suco", "Chá"
  amountMl: int("amountMl").notNull(),
  logDate: varchar("logDate", { length: 10 }).notNull(), // YYYY-MM-DD format for grouping by day
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HydrationLog = typeof hydrationLogs.$inferSelect;
export type InsertHydrationLog = typeof hydrationLogs.$inferInsert;