import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Create enum for tower status
export const towerStatusEnum = pgEnum('tower_status', ['active', 'warning', 'critical']);

// Create enum for verification status
export const verificationStatusEnum = pgEnum('verification_status', ['pending', 'verified', 'rejected']);

// Create light towers table
export const lightTowers = pgTable("light_towers", {
  id: serial("id").primaryKey(),
  towerId: text("tower_id").notNull().unique(), // LT-001, LT-002, etc.
  location: text("location").notNull(),
  constituency: text("constituency").notNull(),
  ward: text("ward").notNull(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  status: towerStatusEnum("status").notNull().default("active"),
  lastMaintenance: timestamp("last_maintenance"),
  verificationStatus: verificationStatusEnum("verification_status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create maintenance reports table
export const maintenanceReports = pgTable("maintenance_reports", {
  id: serial("id").primaryKey(),
  towerId: integer("tower_id").notNull(),
  status: towerStatusEnum("status").notNull(),
  reportedBy: text("reported_by").notNull(),
  notes: text("notes"),
  imageUrl: text("image_url"),
  reportedAt: timestamp("reported_at").defaultNow(),
});

// Create activity logs table
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  towerId: integer("tower_id").notNull(),
  activityType: text("activity_type").notNull(), // 'registration', 'maintenance', 'status_update'
  description: text("description").notNull(),
  performedBy: text("performed_by").notNull(),
  performedAt: timestamp("performed_at").defaultNow(),
});

// Create users table - basic user model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"), // 'user', 'admin'
});

// Create insert schemas
export const insertLightTowerSchema = createInsertSchema(lightTowers).omit({
  id: true,
  createdAt: true
});

export const insertMaintenanceReportSchema = createInsertSchema(maintenanceReports).omit({
  id: true,
  reportedAt: true
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  performedAt: true
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true
});

// Create types
export type LightTower = typeof lightTowers.$inferSelect;
export type InsertLightTower = z.infer<typeof insertLightTowerSchema>;

export type MaintenanceReport = typeof maintenanceReports.$inferSelect;
export type InsertMaintenanceReport = z.infer<typeof insertMaintenanceReportSchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Status type for frontend usage
export type TowerStatus = 'active' | 'warning' | 'critical';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
