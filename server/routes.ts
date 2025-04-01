import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertLightTowerSchema, 
  insertMaintenanceReportSchema,
  insertActivityLogSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiPrefix = '/api';
  
  // Get all light towers
  app.get(`${apiPrefix}/towers`, async (_req: Request, res: Response) => {
    try {
      const towers = await storage.getAllLightTowers();
      res.json(towers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch light towers" });
    }
  });
  
  // Get light tower by ID
  app.get(`${apiPrefix}/towers/:id`, async (req: Request, res: Response) => {
    try {
      const towerId = req.params.id;
      // Check if id is a numeric id or a tower ID string (LT-XXX)
      if (towerId.startsWith('LT-')) {
        const tower = await storage.getLightTowerByTowerId(towerId);
        if (tower) {
          res.json(tower);
        } else {
          res.status(404).json({ message: "Light tower not found" });
        }
      } else {
        const id = parseInt(towerId);
        if (isNaN(id)) {
          return res.status(400).json({ message: "Invalid tower ID format" });
        }
        
        const tower = await storage.getLightTower(id);
        if (tower) {
          res.json(tower);
        } else {
          res.status(404).json({ message: "Light tower not found" });
        }
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch light tower" });
    }
  });
  
  // Create a new light tower
  app.post(`${apiPrefix}/towers`, async (req: Request, res: Response) => {
    try {
      const validatedData = insertLightTowerSchema.parse(req.body);
      const tower = await storage.createLightTower(validatedData);
      
      // Create activity log for new tower registration
      await storage.createActivityLog({
        towerId: tower.id,
        activityType: 'registration',
        description: `New tower ${tower.towerId} registered in ${tower.constituency}`,
        performedBy: req.body.registeredBy || 'Anonymous'
      });
      
      res.status(201).json(tower);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create light tower" });
      }
    }
  });
  
  // Update a light tower
  app.patch(`${apiPrefix}/towers/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tower ID" });
      }
      
      const tower = await storage.getLightTower(id);
      if (!tower) {
        return res.status(404).json({ message: "Light tower not found" });
      }
      
      const updatedTower = await storage.updateLightTower(id, req.body);
      
      // Create activity log for tower update
      if (req.body.status && req.body.status !== tower.status) {
        await storage.createActivityLog({
          towerId: tower.id,
          activityType: 'status_update',
          description: `Tower ${tower.towerId} status updated from ${tower.status} to ${req.body.status}`,
          performedBy: req.body.updatedBy || 'Anonymous'
        });
      }
      
      res.json(updatedTower);
    } catch (error) {
      res.status(500).json({ message: "Failed to update light tower" });
    }
  });
  
  // Get light tower stats
  app.get(`${apiPrefix}/stats`, async (_req: Request, res: Response) => {
    try {
      const stats = await storage.getLightTowerStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
  
  // Get maintenance reports for a tower
  app.get(`${apiPrefix}/towers/:id/reports`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tower ID" });
      }
      
      const reports = await storage.getMaintenanceReportsByTowerId(id);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch maintenance reports" });
    }
  });
  
  // Create a new maintenance report
  app.post(`${apiPrefix}/reports`, async (req: Request, res: Response) => {
    try {
      const validatedData = insertMaintenanceReportSchema.parse(req.body);
      
      // Check if the tower exists
      const tower = await storage.getLightTower(validatedData.towerId);
      if (!tower) {
        return res.status(404).json({ message: "Light tower not found" });
      }
      
      const report = await storage.createMaintenanceReport(validatedData);
      
      // Create activity log for new report
      await storage.createActivityLog({
        towerId: tower.id,
        activityType: 'maintenance',
        description: `New maintenance report submitted for tower ${tower.towerId} - Status: ${validatedData.status}`,
        performedBy: validatedData.reportedBy
      });
      
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create maintenance report" });
      }
    }
  });
  
  // Get activity logs
  app.get(`${apiPrefix}/activity`, async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const logs = await storage.getRecentActivityLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });
  
  // Get activity logs for a specific tower
  app.get(`${apiPrefix}/towers/:id/activity`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tower ID" });
      }
      
      const logs = await storage.getActivityLogsByTowerId(id);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });
  
  // Get filters data (constituencies and wards)
  app.get(`${apiPrefix}/filters`, async (_req: Request, res: Response) => {
    try {
      const towers = await storage.getAllLightTowers();
      
      // Extract unique constituencies and wards
      const constituencies = [...new Set(towers.map(tower => tower.constituency))];
      const wards = [...new Set(towers.map(tower => tower.ward))];
      
      res.json({ constituencies, wards });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch filters data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
