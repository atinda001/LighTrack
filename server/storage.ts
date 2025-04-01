import { 
  users, 
  lightTowers, 
  maintenanceReports, 
  activityLogs,
  type User, 
  type InsertUser,
  type LightTower,
  type InsertLightTower,
  type MaintenanceReport,
  type InsertMaintenanceReport,
  type ActivityLog,
  type InsertActivityLog
} from "@shared/schema";

// Modify the interface with CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Light Tower methods
  getLightTower(id: number): Promise<LightTower | undefined>;
  getLightTowerByTowerId(towerId: string): Promise<LightTower | undefined>;
  getAllLightTowers(): Promise<LightTower[]>;
  getLightTowersByStatus(status: string): Promise<LightTower[]>;
  getLightTowersByConstituency(constituency: string): Promise<LightTower[]>;
  getLightTowersByWard(ward: string): Promise<LightTower[]>;
  createLightTower(tower: InsertLightTower): Promise<LightTower>;
  updateLightTower(id: number, tower: Partial<LightTower>): Promise<LightTower | undefined>;
  
  // Maintenance Report methods
  getMaintenanceReport(id: number): Promise<MaintenanceReport | undefined>;
  getMaintenanceReportsByTowerId(towerId: number): Promise<MaintenanceReport[]>;
  createMaintenanceReport(report: InsertMaintenanceReport): Promise<MaintenanceReport>;
  
  // Activity Log methods
  getActivityLog(id: number): Promise<ActivityLog | undefined>;
  getActivityLogsByTowerId(towerId: number): Promise<ActivityLog[]>;
  getRecentActivityLogs(limit: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  
  // Stats methods
  getLightTowerStats(): Promise<{active: number, warning: number, critical: number, total: number}>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private lightTowers: Map<number, LightTower>;
  private maintenanceReports: Map<number, MaintenanceReport>;
  private activityLogs: Map<number, ActivityLog>;
  
  private userCurrentId: number;
  private towerCurrentId: number;
  private reportCurrentId: number;
  private logCurrentId: number;

  constructor() {
    this.users = new Map();
    this.lightTowers = new Map();
    this.maintenanceReports = new Map();
    this.activityLogs = new Map();
    
    this.userCurrentId = 1;
    this.towerCurrentId = 1;
    this.reportCurrentId = 1;
    this.logCurrentId = 1;
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Light Tower methods
  async getLightTower(id: number): Promise<LightTower | undefined> {
    return this.lightTowers.get(id);
  }
  
  async getLightTowerByTowerId(towerId: string): Promise<LightTower | undefined> {
    return Array.from(this.lightTowers.values()).find(
      (tower) => tower.towerId === towerId,
    );
  }
  
  async getAllLightTowers(): Promise<LightTower[]> {
    return Array.from(this.lightTowers.values());
  }
  
  async getLightTowersByStatus(status: string): Promise<LightTower[]> {
    return Array.from(this.lightTowers.values()).filter(
      (tower) => tower.status === status,
    );
  }
  
  async getLightTowersByConstituency(constituency: string): Promise<LightTower[]> {
    return Array.from(this.lightTowers.values()).filter(
      (tower) => tower.constituency === constituency,
    );
  }
  
  async getLightTowersByWard(ward: string): Promise<LightTower[]> {
    return Array.from(this.lightTowers.values()).filter(
      (tower) => tower.ward === ward,
    );
  }
  
  async createLightTower(insertTower: InsertLightTower): Promise<LightTower> {
    const id = this.towerCurrentId++;
    const towerId = insertTower.towerId || `LT-${String(id).padStart(3, '0')}`;
    const tower: LightTower = { 
      ...insertTower, 
      id, 
      towerId,
      createdAt: new Date() 
    };
    this.lightTowers.set(id, tower);
    return tower;
  }
  
  async updateLightTower(id: number, towerUpdate: Partial<LightTower>): Promise<LightTower | undefined> {
    const existingTower = this.lightTowers.get(id);
    if (!existingTower) return undefined;
    
    const updatedTower = { ...existingTower, ...towerUpdate };
    this.lightTowers.set(id, updatedTower);
    return updatedTower;
  }
  
  // Maintenance Report methods
  async getMaintenanceReport(id: number): Promise<MaintenanceReport | undefined> {
    return this.maintenanceReports.get(id);
  }
  
  async getMaintenanceReportsByTowerId(towerId: number): Promise<MaintenanceReport[]> {
    return Array.from(this.maintenanceReports.values()).filter(
      (report) => report.towerId === towerId,
    );
  }
  
  async createMaintenanceReport(insertReport: InsertMaintenanceReport): Promise<MaintenanceReport> {
    const id = this.reportCurrentId++;
    const report: MaintenanceReport = { 
      ...insertReport, 
      id,
      reportedAt: new Date() 
    };
    this.maintenanceReports.set(id, report);
    
    // Update tower status
    const tower = await this.getLightTower(insertReport.towerId);
    if (tower) {
      await this.updateLightTower(tower.id, { status: insertReport.status });
    }
    
    return report;
  }
  
  // Activity Log methods
  async getActivityLog(id: number): Promise<ActivityLog | undefined> {
    return this.activityLogs.get(id);
  }
  
  async getActivityLogsByTowerId(towerId: number): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values()).filter(
      (log) => log.towerId === towerId,
    );
  }
  
  async getRecentActivityLogs(limit: number): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .sort((a, b) => b.performedAt.getTime() - a.performedAt.getTime())
      .slice(0, limit);
  }
  
  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const id = this.logCurrentId++;
    const log: ActivityLog = { 
      ...insertLog, 
      id,
      performedAt: new Date() 
    };
    this.activityLogs.set(id, log);
    return log;
  }
  
  // Stats methods
  async getLightTowerStats(): Promise<{active: number, warning: number, critical: number, total: number}> {
    const towers = Array.from(this.lightTowers.values());
    const active = towers.filter(tower => tower.status === 'active').length;
    const warning = towers.filter(tower => tower.status === 'warning').length;
    const critical = towers.filter(tower => tower.status === 'critical').length;
    const total = towers.length;
    
    return { active, warning, critical, total };
  }
  
  // Helper method to initialize sample data for development
  private initializeSampleData() {
    // Create sample admin user
    this.createUser({
      username: 'admin',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin'
    });
    
    // Create sample light towers
    const sampleTowers = [
      {
        towerId: 'LT-001',
        location: 'Parklands Road, near Westlands Mall',
        constituency: 'Westlands',
        ward: 'Parklands/Highridge',
        latitude: '-1.2644',
        longitude: '36.8066',
        status: 'active',
        verificationStatus: 'verified',
        notes: 'Near Westlands Mall entrance'
      },
      {
        towerId: 'LT-002',
        location: 'Madaraka Estate, main junction',
        constituency: 'Langata',
        ward: 'South C',
        latitude: '-1.3075',
        longitude: '36.8219',
        status: 'warning',
        verificationStatus: 'verified',
        notes: 'Street light on main junction. Bulb is flickering and needs replacement.'
      },
      {
        towerId: 'LT-003',
        location: 'Olympic Estate, main road',
        constituency: 'Kibra',
        ward: 'Sarangombe',
        latitude: '-1.3106',
        longitude: '36.7809',
        status: 'critical',
        verificationStatus: 'verified',
        notes: 'No working lights, electrical issue'
      },
      {
        towerId: 'LT-004',
        location: 'Mirema Drive, near TRM Mall',
        constituency: 'Roysambu',
        ward: 'Roysambu',
        latitude: '-1.2188',
        longitude: '36.8871',
        status: 'active',
        verificationStatus: 'verified',
        notes: 'Recently installed'
      },
      {
        towerId: 'LT-005',
        location: 'Kawangware, Congo junction',
        constituency: 'Dagoretti North',
        ward: 'Kawangware',
        latitude: '-1.2856',
        longitude: '36.7488',
        status: 'active',
        verificationStatus: 'verified',
        notes: 'Working properly'
      }
    ];
    
    sampleTowers.forEach(tower => {
      this.createLightTower(tower as InsertLightTower);
    });
    
    // Create sample activity logs
    const sampleLogs = [
      {
        towerId: 2,
        activityType: 'status_update',
        description: 'Tower LT-002 reported as needing maintenance',
        performedBy: 'John Doe'
      },
      {
        towerId: 3,
        activityType: 'status_update',
        description: 'Tower LT-003 marked as critical - no working lights',
        performedBy: 'Jane Smith'
      },
      {
        towerId: 5,
        activityType: 'maintenance',
        description: 'Tower LT-005 maintenance completed',
        performedBy: 'Maintenance Team'
      },
      {
        towerId: 4,
        activityType: 'registration',
        description: 'New tower LT-004 registered in Roysambu',
        performedBy: 'Community Admin'
      }
    ];
    
    sampleLogs.forEach(log => {
      this.createActivityLog(log as InsertActivityLog);
    });
  }
}

export const storage = new MemStorage();
