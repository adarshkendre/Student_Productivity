import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertGoalSchema, insertLearningSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Goals API
  app.get("/api/goals", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const goals = await storage.getGoals(req.user.id);
    res.json(goals);
  });

  app.post("/api/goals", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const goalData = insertGoalSchema.parse(req.body);
    const goal = await storage.createGoal(req.user.id, goalData);
    res.status(201).json(goal);
  });

  app.patch("/api/goals/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    const goalData = insertGoalSchema.partial().parse(req.body);
    const goal = await storage.updateGoal(id, req.user.id, goalData);
    if (!goal) return res.sendStatus(404);
    res.json(goal);
  });

  // Learnings API
  app.get("/api/learnings", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const learnings = await storage.getLearnings(req.user.id);
    res.json(learnings);
  });

  app.post("/api/learnings", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const learningData = insertLearningSchema.parse(req.body);
    const learning = await storage.createLearning(req.user.id, learningData);
    res.status(201).json(learning);
  });

  const httpServer = createServer(app);
  return httpServer;
}
