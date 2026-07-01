import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, DailyGoal, HydrationLog, dailyGoals, hydrationLogs } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get or create daily goal for a user.
 * Returns the goal in ml for the current day.
 */
export async function getOrCreateDailyGoal(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get daily goal: database not available");
    return 2000; // Default fallback
  }

  try {
    const existing = await db
      .select()
      .from(dailyGoals)
      .where(eq(dailyGoals.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      return existing[0].goalMl;
    }

    // Create default goal
    await db.insert(dailyGoals).values({
      userId,
      goalMl: 2000,
    });

    return 2000;
  } catch (error) {
    console.error("[Database] Failed to get/create daily goal:", error);
    return 2000;
  }
}

/**
 * Update daily goal for a user.
 */
export async function updateDailyGoal(userId: number, goalMl: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update daily goal: database not available");
    return;
  }

  try {
    const existing = await db
      .select()
      .from(dailyGoals)
      .where(eq(dailyGoals.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(dailyGoals)
        .set({ goalMl })
        .where(eq(dailyGoals.userId, userId));
    } else {
      await db.insert(dailyGoals).values({
        userId,
        goalMl,
      });
    }
  } catch (error) {
    console.error("[Database] Failed to update daily goal:", error);
    throw error;
  }
}

/**
 * Add hydration log entry.
 */
export async function addHydrationLog(
  userId: number,
  drinkType: string,
  amountMl: number,
  logDate: string
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add hydration log: database not available");
    return;
  }

  try {
    await db.insert(hydrationLogs).values({
      userId,
      drinkType,
      amountMl,
      logDate,
    });
  } catch (error) {
    console.error("[Database] Failed to add hydration log:", error);
    throw error;
  }
}

/**
 * Get all hydration logs for a specific date.
 */
export async function getHydrationLogsByDate(
  userId: number,
  logDate: string
): Promise<HydrationLog[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get hydration logs: database not available");
    return [];
  }

  try {
    const logs = await db
      .select()
      .from(hydrationLogs)
      .where(
        and(
          eq(hydrationLogs.userId, userId),
          eq(hydrationLogs.logDate, logDate)
        )
      )
      .orderBy(desc(hydrationLogs.createdAt));

    return logs;
  } catch (error) {
    console.error("[Database] Failed to get hydration logs:", error);
    return [];
  }
}


