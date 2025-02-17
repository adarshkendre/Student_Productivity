import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateSchedule } from "./services/ai";
import { scheduleRequestSchema } from "@shared/schema";
import { validateConcept } from "./services/ai";

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

  // Schedule API
  app.get("/api/schedules", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const schedules = await storage.getSchedules(req.user.id);
    res.json(schedules);
  });

  app.post("/api/schedules/generate", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const requestData = scheduleRequestSchema.parse(req.body);

    try {
      const generatedSchedule = await generateSchedule(requestData);
      const schedule = await storage.createSchedule(req.user.id, generatedSchedule);
      res.status(201).json(schedule);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/validate-concept", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { content } = req.body;

    try {
      const validation = await validateConcept(content);
      res.json({ message: validation });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}