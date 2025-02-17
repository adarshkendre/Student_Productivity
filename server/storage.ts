import { InsertUser, User, Goal, InsertGoal, Learning, InsertLearning } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getGoals(userId: number): Promise<Goal[]>;
  createGoal(userId: number, goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, userId: number, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  
  getLearnings(userId: number): Promise<Learning[]>;
  createLearning(userId: number, learning: InsertLearning): Promise<Learning>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private goals: Map<number, Goal>;
  private learnings: Map<number, Learning>;
  private currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.goals = new Map();
    this.learnings = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getGoals(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(
      (goal) => goal.userId === userId,
    );
  }

  async createGoal(userId: number, insertGoal: InsertGoal): Promise<Goal> {
    const id = this.currentId++;
    const goal: Goal = { ...insertGoal, id, userId };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(
    id: number, 
    userId: number, 
    goalUpdate: Partial<InsertGoal>
  ): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal || goal.userId !== userId) return undefined;
    
    const updatedGoal = { ...goal, ...goalUpdate };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  async getLearnings(userId: number): Promise<Learning[]> {
    return Array.from(this.learnings.values())
      .filter((learning) => learning.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async createLearning(userId: number, insertLearning: InsertLearning): Promise<Learning> {
    const id = this.currentId++;
    const learning: Learning = {
      ...insertLearning,
      id,
      userId,
      date: new Date(),
    };
    this.learnings.set(id, learning);
    return learning;
  }
}

export const storage = new MemStorage();
