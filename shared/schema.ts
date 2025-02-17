import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  targetDate: timestamp("target_date").notNull(),
  completed: boolean("completed").default(false).notNull(),
  specific: text("specific").notNull(),
  measurable: text("measurable").notNull(),
  achievable: text("achievable").notNull(),
  relevant: text("relevant").notNull(),
});

export const learnings = pgTable("learnings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  date: timestamp("date").defaultNow().notNull(),
});

export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  schedule: text("schedule").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGoalSchema = createInsertSchema(goals)
  .omit({ id: true, userId: true })
  .extend({
    targetDate: z.string().transform((str) => new Date(str)),
  });

export const insertLearningSchema = createInsertSchema(learnings)
  .omit({ id: true, userId: true, date: true });

export const scheduleRequestSchema = z.object({
  wakeUpTime: z.string(),
  sleepTime: z.string(),
  preferences: z.array(z.string()),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Learning = typeof learnings.$inferSelect;
export type InsertLearning = z.infer<typeof insertLearningSchema>;
export type Schedule = typeof schedules.$inferSelect;
export type ScheduleRequest = z.infer<typeof scheduleRequestSchema>;