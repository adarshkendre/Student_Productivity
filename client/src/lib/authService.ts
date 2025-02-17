
import { User } from "@shared/schema";
import { apiRequest } from "./queryClient";

export const authService = {
  login: async (username: string, password: string): Promise<User> => {
    const res = await apiRequest("POST", "/api/login", { username, password });
    if (!res.ok) {
      throw new Error("Invalid credentials");
    }
    return res.json();
  },

  logout: async (): Promise<void> => {
    await apiRequest("POST", "/api/logout");
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const res = await apiRequest("GET", "/api/user");
      if (!res.ok) return null;
      return res.json();
    } catch (error) {
      return null;
    }
  },

  register: async (username: string, password: string): Promise<User> => {
    const res = await apiRequest("POST", "/api/register", { username, password });
    if (!res.ok) {
      throw new Error("Registration failed");
    }
    return res.json();
  }
};
