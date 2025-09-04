import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertOperationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get all operations
  app.get("/api/operations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const operations = await storage.getAllOperations(userId);
      res.json(operations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch operations" });
    }
  });

  // Get operation by ID
  app.get("/api/operations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const operation = await storage.getOperation(req.params.id, userId);
      if (!operation) {
        return res.status(404).json({ message: "Operation not found" });
      }
      res.json(operation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch operation" });
    }
  });

  // Create new operation
  app.post("/api/operations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertOperationSchema.parse(req.body);
      const operation = await storage.createOperation({ ...validatedData, userId });
      res.status(201).json(operation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create operation" });
    }
  });

  // Update operation
  app.put("/api/operations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertOperationSchema.partial().parse(req.body);
      const operation = await storage.updateOperation(req.params.id, userId, validatedData);
      
      if (!operation) {
        return res.status(404).json({ message: "Operation not found" });
      }
      
      res.json(operation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update operation" });
    }
  });

  // Delete operation
  app.delete("/api/operations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const success = await storage.deleteOperation(req.params.id, userId);
      if (!success) {
        return res.status(404).json({ message: "Operation not found" });
      }
      res.json({ message: "Operation deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete operation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
