// Types for frontend usage
export interface LightTower {
  id: number;
  towerId: string;
  location: string;
  constituency: string;
  ward: string;
  latitude?: string;
  longitude?: string;
  status: 'active' | 'warning' | 'critical';
  lastMaintenance?: Date;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  notes?: string;
  createdAt: Date;
}

export interface MaintenanceReport {
  id: number;
  towerId: number;
  status: 'active' | 'warning' | 'critical';
  reportedBy: string;
  notes?: string;
  imageUrl?: string;
  reportedAt: Date;
}

export interface ActivityLog {
  id: number;
  towerId: number;
  activityType: string;
  description: string;
  performedBy: string;
  performedAt: Date;
}

export interface TowerStats {
  active: number;
  warning: number;
  critical: number;
  total: number;
}

export interface Filters {
  constituencies: string[];
  wards: string[];
}

// Mapping status to colors
export const statusColors = {
  active: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    color: 'hsl(145, 63%, 49%)',
    label: 'Active'
  },
  warning: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    color: 'hsl(48, 89%, 50%)',
    label: 'Needs Attention'
  },
  critical: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    color: 'hsl(6, 78%, 57%)',
    label: 'Critical'
  }
};
