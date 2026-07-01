import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  getOrCreateDailyGoal,
  updateDailyGoal,
  addHydrationLog,
  getHydrationLogsByDate,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  hydration: router({
    /**
     * Get today's hydration data: goal, logs, and total consumed
     */
    getTodayData: protectedProcedure.query(async ({ ctx }) => {
      const today = new Date().toISOString().split("T")[0];
      const goal = await getOrCreateDailyGoal(ctx.user.id);
      const logs = await getHydrationLogsByDate(ctx.user.id, today);
      const totalMl = logs.reduce((sum, log) => sum + log.amountMl, 0);

      return {
        goal,
        logs,
        totalMl,
        date: today,
      };
    }),

    /**
     * Add a new hydration log entry
     */
    addLog: protectedProcedure
      .input(
        z.object({
          drinkType: z.enum(["Água", "Café", "Suco", "Chá"]),
          amountMl: z.number().int().positive().multipleOf(50).max(2000),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const today = new Date().toISOString().split("T")[0];
        await addHydrationLog(ctx.user.id, input.drinkType, input.amountMl, today);

        // Return updated data
        const logs = await getHydrationLogsByDate(ctx.user.id, today);
        const totalMl = logs.reduce((sum, log) => sum + log.amountMl, 0);
        const goal = await getOrCreateDailyGoal(ctx.user.id);

        return {
          success: true,
          goal,
          logs,
          totalMl,
        };
      }),

    /**
     * Update daily goal
     */
    updateGoal: protectedProcedure
      .input(z.object({ goalMl: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        await updateDailyGoal(ctx.user.id, input.goalMl);
        const goal = await getOrCreateDailyGoal(ctx.user.id);
        return { success: true, goalMl: goal };
      }),
  }),
});

export type AppRouter = typeof appRouter;
